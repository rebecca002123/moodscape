// Prism asset generator — runs automatically after `npm install`.
// Paints the app icon, splash art and Android adaptive icon as PNGs in pure
// Node (no dependencies): a glass prism splitting a beam of light into the
// spectrum. A fresh clone runs in Expo Go with zero downloads.

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

const SPECTRUM = ['#22D3EE', '#818CF8', '#E879F9', '#FB7185', '#FBBF24'].map(hex);

function makeCanvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}

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
      blend(canvas, x, y, rgb, alpha * (1 - d) ** 2);
    }
  }
}

// soft white beam along segment p0→p1 with the given half-width
function beam(canvas, p0, p1, halfWidth, rgb, alpha) {
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  const minX = Math.max(0, Math.floor(Math.min(x0, x1) - halfWidth));
  const maxX = Math.min(canvas.w - 1, Math.ceil(Math.max(x0, x1) + halfWidth));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1) - halfWidth));
  const maxY = Math.min(canvas.h - 1, Math.ceil(Math.max(y0, y1) + halfWidth));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t = clamp01(((x - x0) * dx + (y - y0) * dy) / len2);
      const px = x0 + t * dx;
      const py = y0 + t * dy;
      const dist = Math.hypot(x - px, y - py) / halfWidth;
      if (dist >= 1) continue;
      blend(canvas, x, y, rgb, alpha * (1 - dist) ** 2);
    }
  }
}

// rainbow fan spreading from (ex, ey) between angles a0 and a1
function rainbow(canvas, ex, ey, a0, a1, reach, alpha) {
  const bands = SPECTRUM.length;
  const span = a1 - a0;
  for (let y = 0; y < canvas.h; y++) {
    for (let x = Math.max(0, Math.floor(ex)); x < canvas.w; x++) {
      const dx = x - ex;
      const dy = y - ey;
      if (dx <= 0) continue;
      const dist = Math.hypot(dx, dy);
      if (dist > reach) continue;
      const ang = Math.atan2(dy, dx);
      const u = (ang - a0) / span;
      if (u < 0 || u >= 1) continue;
      const band = Math.min(bands - 1, Math.floor(u * bands));
      // soften band borders and the fan's outer edges
      const inBand = (u * bands) % 1;
      const edge = Math.min(inBand, 1 - inBand) * 4;
      const fade = (1 - dist / reach) * Math.min(1, edge + 0.35) * Math.min(1, dist / 60);
      blend(canvas, x, y, SPECTRUM[band], alpha * fade);
    }
  }
}

// translucent glass triangle with bright edges and a top sheen
function prism(canvas, apex, left, right) {
  const [ax, ay] = apex;
  const [bx, by] = left;
  const [cx, cy] = right;
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)) - 2);
  const maxX = Math.min(canvas.w - 1, Math.ceil(Math.max(ax, bx, cx)) + 2);
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)) - 2);
  const maxY = Math.min(canvas.h - 1, Math.ceil(Math.max(ay, by, cy)) + 2);

  const edgeDist = (px, py, x0, y0, x1, y1) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const t = clamp01(((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy));
    return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
  };

  const area = (x0, y0, x1, y1, x2, y2) => (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  const total = area(ax, ay, bx, by, cx, cy);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = area(bx, by, cx, cy, x, y) / total;
      const w1 = area(cx, cy, ax, ay, x, y) / total;
      const w2 = area(ax, ay, bx, by, x, y) / total;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const vertical = clamp01((y - ay) / (Math.max(by, cy) - ay));
      // cool glass fill, brighter toward the apex
      const fill = [
        mix(235, 175, vertical),
        mix(245, 195, vertical),
        mix(255, 235, vertical),
      ];
      blend(canvas, x, y, fill, 0.16 + (1 - vertical) * 0.10);
      // bright refractive edges
      const e = Math.min(
        edgeDist(x, y, ax, ay, bx, by),
        edgeDist(x, y, ax, ay, cx, cy),
        edgeDist(x, y, bx, by, cx, cy),
      );
      if (e < 10) blend(canvas, x, y, [255, 255, 255], (1 - e / 10) ** 2 * 0.85);
      // sheen streak under the left edge
      const sheen = edgeDist(x, y, ax, ay, bx, by);
      if (sheen > 14 && sheen < 44) {
        blend(canvas, x, y, [255, 255, 255], (1 - Math.abs(sheen - 29) / 15) * 0.16);
      }
    }
  }
}

/* ---------------------------------------------------------------- */
/* compose the three assets                                          */
/* ---------------------------------------------------------------- */
const S = 1024;

function paintScene(canvas, { background }) {
  if (background) {
    fillVertical(canvas, hex('#060812'), hex('#141B3C'));
    glow(canvas, S * 0.72, S * 0.30, S * 0.55, hex('#8B5CF6'), 0.30);
    glow(canvas, S * 0.25, S * 0.72, S * 0.5, hex('#22D3EE'), 0.22);
  }
  const apex = [S * 0.485, S * 0.245];
  const left = [S * 0.285, S * 0.685];
  const right = [S * 0.685, S * 0.685];
  const entry = [S * 0.40, S * 0.50];

  beam(canvas, [0, S * 0.40], entry, S * 0.035, [255, 255, 255], 0.5);
  rainbow(canvas, S * 0.52, S * 0.475, -0.28, 0.52, S * 0.58, 0.8);
  prism(canvas, apex, left, right);
}

function save(name, canvas) {
  fs.writeFileSync(path.join(outDir, name), encodePNG(canvas.w, canvas.h, canvas.data));
  console.log(`  painted assets/${name}`);
}

console.log('Prism: painting Liquid Glass assets…');

const icon = makeCanvas(S, S);
paintScene(icon, { background: true });
save('icon.png', icon);

const splash = makeCanvas(S, S);
glow(splash, S / 2, S / 2, S * 0.48, hex('#8B5CF6'), 0.35);
paintScene(splash, { background: false });
save('splash-icon.png', splash);

const adaptive = makeCanvas(S, S);
glow(adaptive, S / 2, S / 2, S * 0.36, hex('#8B5CF6'), 0.4);
prism(adaptive, [S * 0.5, S * 0.32], [S * 0.34, S * 0.66], [S * 0.66, S * 0.66]);
save('adaptive-icon.png', adaptive);

console.log('Prism: assets ready.');
