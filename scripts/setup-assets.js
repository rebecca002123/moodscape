// MoodScape asset generator — runs automatically after `npm install`.
// Paints the app icon, splash art and Android adaptive icon as PNGs in pure
// Node (no dependencies), so a fresh clone runs in Expo Go with zero setup.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

/* ---------------------------------------------------------------- */
/* minimal PNG encoder (RGBA8)                                       */
/* ---------------------------------------------------------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------------------------------------------------------- */
/* painting helpers                                                  */
/* ---------------------------------------------------------------- */
const hex = (s) => [
  parseInt(s.slice(1, 3), 16),
  parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16),
];
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const mix = (a, b, t) => a + (b - a) * t;

function makeCanvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}

// Source-over composite of color [r,g,b] with alpha a onto pixel i.
function blend(canvas, x, y, rgb, a) {
  if (x < 0 || y < 0 || x >= canvas.w || y >= canvas.h || a <= 0) return;
  const i = (y * canvas.w + x) * 4;
  const d = canvas.data;
  const da = d[i + 3] / 255;
  const outA = a + da * (1 - a);
  if (outA <= 0) return;
  for (let c = 0; c < 3; c++) {
    d[i + c] = Math.round((rgb[c] * a + d[i + c] * da * (1 - a)) / outA);
  }
  d[i + 3] = Math.round(outA * 255);
}

function fillVertical(canvas, top, bottom) {
  for (let y = 0; y < canvas.h; y++) {
    const t = y / (canvas.h - 1);
    const rgb = [mix(top[0], bottom[0], t), mix(top[1], bottom[1], t), mix(top[2], bottom[2], t)];
    for (let x = 0; x < canvas.w; x++) blend(canvas, x, y, rgb, 1);
  }
}

function glow(canvas, cx, cy, r, rgb, alpha) {
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(canvas.w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(canvas.h - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy) / r;
      if (d >= 1) continue;
      const fall = (1 - d) ** 2;
      blend(canvas, x, y, rgb, alpha * fall);
    }
  }
}

// The MoodScape orb: gradient glass sphere, sheen, rim light and a face.
function orb(canvas, cx, cy, r, topColor, bottomColor, { face = true } = {}) {
  const x0 = Math.max(0, Math.floor(cx - r) - 2);
  const x1 = Math.min(canvas.w - 1, Math.ceil(cx + r) + 2);
  const y0 = Math.max(0, Math.floor(cy - r) - 2);
  const y1 = Math.min(canvas.h - 1, Math.ceil(cy + r) + 2);
  const hx = cx - r * 0.34; // sheen centre
  const hy = cy - r * 0.42;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      const cov = clamp01(r - dist + 0.5); // 1px anti-aliased edge
      if (cov <= 0) continue;
      const t = clamp01((y - (cy - r)) / (2 * r));
      let rgb = [
        mix(topColor[0], bottomColor[0], t),
        mix(topColor[1], bottomColor[1], t),
        mix(topColor[2], bottomColor[2], t),
      ];
      // specular sheen (upper-left)
      const hd = Math.hypot(x - hx, y - hy) / (r * 0.62);
      if (hd < 1) {
        const s = (1 - hd) ** 2 * 0.85;
        rgb = rgb.map((v) => mix(v, 255, s));
      }
      // rim light near the lower edge
      const edge = dist / r;
      if (edge > 0.82) {
        const rim = ((edge - 0.82) / 0.18) ** 2 * (0.18 + 0.22 * t);
        rgb = rgb.map((v) => mix(v, 255, rim));
      }
      blend(canvas, x, y, rgb, cov);
    }
  }
  if (!face) return;
  const ink = hex('#141830');
  const eyeR = r * 0.075;
  for (const s of [-1, 1]) {
    glowSolid(canvas, cx + s * r * 0.30, cy - r * 0.05, eyeR, ink);
  }
  // smile: thick arc from the parametric curve
  const mw = r * 0.62;
  const my = cy + r * 0.30;
  const lift = r * 0.16;
  const thick = r * 0.055;
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const px = cx - mw / 2 + mw * u;
    const py = my + Math.sin(u * Math.PI) * lift;
    glowSolid(canvas, px, py, thick, ink);
  }
}

// filled anti-aliased dot
function glowSolid(canvas, cx, cy, r, rgb) {
  const x0 = Math.max(0, Math.floor(cx - r) - 1);
  const x1 = Math.min(canvas.w - 1, Math.ceil(cx + r) + 1);
  const y0 = Math.max(0, Math.floor(cy - r) - 1);
  const y1 = Math.min(canvas.h - 1, Math.ceil(cy + r) + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cov = clamp01(r - Math.hypot(x - cx, y - cy) + 0.5);
      if (cov > 0) blend(canvas, x, y, rgb, cov * 0.86);
    }
  }
}

/* ---------------------------------------------------------------- */
/* compose the three assets                                          */
/* ---------------------------------------------------------------- */
const S = 1024;

function paintScene(canvas, { background }) {
  const c = canvas.w / 2;
  if (background) {
    fillVertical(canvas, hex('#0A0F24'), hex('#1B2350'));
    glow(canvas, c, c * 0.9, S * 0.62, hex('#6E8BFF'), 0.35);
    glow(canvas, c * 1.5, c * 0.45, S * 0.30, hex('#A78BFA'), 0.30);
    glow(canvas, c * 0.42, c * 1.55, S * 0.34, hex('#2BC8A5'), 0.22);
  } else {
    glow(canvas, c, c, S * 0.46, hex('#6E8BFF'), 0.5);
  }
  // companion orbs
  orb(canvas, c * 1.52, c * 0.52, S * 0.085, hex('#FFE08A'), hex('#FF9E64'), { face: false });
  orb(canvas, c * 0.44, c * 1.50, S * 0.065, hex('#7CF29C'), hex('#2BC8A5'), { face: false });
  // the hero
  orb(canvas, c, c, S * 0.30, hex('#8AD8FF'), hex('#6E8BFF'));
}

function save(name, canvas) {
  fs.writeFileSync(path.join(outDir, name), encodePNG(canvas.w, canvas.h, canvas.data));
  console.log(`  painted assets/${name}`);
}

console.log('MoodScape: painting Liquid Glass assets…');

const icon = makeCanvas(S, S);
paintScene(icon, { background: true });
save('icon.png', icon);

const splash = makeCanvas(S, S);
paintScene(splash, { background: false });
save('splash-icon.png', splash);

const adaptive = makeCanvas(S, S);
glow(adaptive, S / 2, S / 2, S * 0.34, hex('#6E8BFF'), 0.5);
orb(adaptive, S / 2, S / 2, S * 0.24, hex('#8AD8FF'), hex('#6E8BFF'));
save('adaptive-icon.png', adaptive);

console.log('MoodScape: assets ready.');
