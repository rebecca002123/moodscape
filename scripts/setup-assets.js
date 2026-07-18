// MoodScape asset generator — runs automatically after `npm install`.
// Pure Node (no dependencies): paints the app icon + splash art as PNGs and
// synthesizes the ambient soundscape + glass chime as WAVs, so a fresh clone
// runs standalone. If you have the MoodScape.zip, its premium assets simply
// overwrite these files — same filenames, same magic.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------------------------ */
/* tiny seeded rng                                                     */
/* ------------------------------------------------------------------ */
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* PNG encoder (RGBA8)                                                 */
/* ------------------------------------------------------------------ */
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
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/* framebuffer + shapes                                                */
/* ------------------------------------------------------------------ */
function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
class Canvas {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.buf = Buffer.alloc(w * h * 4); // transparent
  }
  blend(x, y, r, g, b, a) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const da = this.buf[i + 3] / 255;
    const oa = a + da * (1 - a);
    if (oa <= 0) return;
    this.buf[i]     = Math.round((r * a + this.buf[i] * da * (1 - a)) / oa);
    this.buf[i + 1] = Math.round((g * a + this.buf[i + 1] * da * (1 - a)) / oa);
    this.buf[i + 2] = Math.round((b * a + this.buf[i + 2] * da * (1 - a)) / oa);
    this.buf[i + 3] = Math.round(oa * 255);
  }
  add(x, y, r, g, b, a) { // additive glow
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    this.buf[i] = Math.min(255, this.buf[i] + r * a);
    this.buf[i + 1] = Math.min(255, this.buf[i + 1] + g * a);
    this.buf[i + 2] = Math.min(255, this.buf[i + 2] + b * a);
    this.buf[i + 3] = Math.min(255, this.buf[i + 3] + 140 * a);
  }
  vGradient(stops) {
    for (let y = 0; y < this.h; y++) {
      const t = y / (this.h - 1);
      let i = 0;
      while (i < stops.length - 2 && stops[i + 1][0] <= t) i++;
      const [t0, c0] = stops[i], [t1, c1] = stops[i + 1];
      const k = Math.max(0, Math.min(1, (t - t0) / (t1 - t0 || 1)));
      const [r0, g0, b0] = hexRgb(c0), [r1, g1, b1] = hexRgb(c1);
      const r = r0 + (r1 - r0) * k, g = g0 + (g1 - g0) * k, b = b0 + (b1 - b0) * k;
      for (let x = 0; x < this.w; x++) this.blend(x, y, r, g, b, 1);
    }
  }
  ellipse(cx, cy, rx, ry, hex, alpha) {
    const [r, g, b] = hexRgb(hex);
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d <= 1) this.blend(x, y, r, g, b, alpha);
        else if (d <= 1.06) this.blend(x, y, r, g, b, alpha * (1.06 - d) / 0.06);
      }
    }
  }
  glow(cx, cy, radius, hex, strength) {
    const [r, g, b] = hexRgb(hex);
    for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
      for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
        const d = Math.hypot(x - cx, y - cy) / radius;
        if (d < 1) this.add(x, y, r, g, b, strength * (1 - d) * (1 - d));
      }
    }
  }
  poly(points, hex, alpha) {
    const [r, g, b] = hexRgb(hex);
    const ys = points.map((p) => p[1]);
    const yMin = Math.floor(Math.min(...ys)), yMax = Math.ceil(Math.max(...ys));
    for (let y = yMin; y <= yMax; y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i], [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.floor(xs[i]); x <= Math.ceil(xs[i + 1]); x++) this.blend(x, y, r, g, b, alpha);
      }
    }
  }
  line(x1, y1, x2, y2, w, hex, alpha) {
    const [r, g, b] = hexRgb(hex);
    const minX = Math.floor(Math.min(x1, x2) - w), maxX = Math.ceil(Math.max(x1, x2) + w);
    const minY = Math.floor(Math.min(y1, y2) - w), maxY = Math.ceil(Math.max(y1, y2) + w);
    const len2 = (x2 - x1) ** 2 + (y2 - y1) ** 2 || 1;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / len2));
        const d = Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1)));
        if (d <= w) this.blend(x, y, r, g, b, alpha * (1 - d / (w + 1)));
      }
    }
  }
  downsample(factor) {
    const w = this.w / factor, h = this.h / factor;
    const out = new Canvas(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let dy = 0; dy < factor; dy++) {
          for (let dx = 0; dx < factor; dx++) {
            const i = ((y * factor + dy) * this.w + x * factor + dx) * 4;
            r += this.buf[i]; g += this.buf[i + 1]; b += this.buf[i + 2]; a += this.buf[i + 3];
          }
        }
        const n = factor * factor, o = (y * w + x) * 4;
        out.buf[o] = r / n; out.buf[o + 1] = g / n; out.buf[o + 2] = b / n; out.buf[o + 3] = a / n;
      }
    }
    return out;
  }
}

/* ------------------------------------------------------------------ */
/* paint the MoodScape island                                          */
/* ------------------------------------------------------------------ */
function paintIsland(S, withSky) {
  const W = 1024 * S, H = 1024 * S;
  const c = new Canvas(W, H);
  const rng = makeRng(20260718);

  if (withSky) {
    c.vGradient([[0, '#141a44'], [0.42, '#4a3f8e'], [0.72, '#c06a9e'], [1, '#f7a8b8']]);
    for (let i = 0; i < 46; i++) { // stars
      const x = rng() * W, y = rng() * H * 0.5, r = (1 + rng() * 2.2) * S;
      c.ellipse(x, y, r, r, '#ffffff', 0.35 + rng() * 0.5);
    }
  }

  const cx = W / 2, cy = H * 0.545;
  c.glow(cx, cy - 30 * S, 400 * S, '#ffd9ec', withSky ? 0.4 : 0.55);
  c.glow(cx, cy - 160 * S, 260 * S, '#c9a8ff', 0.35);

  // crystal root
  c.poly([[cx - 240 * S, cy + 55 * S], [cx, cy + 470 * S], [cx + 240 * S, cy + 55 * S]], '#8f7fd8', 0.85);
  c.poly([[cx - 120 * S, cy + 62 * S], [cx, cy + 330 * S], [cx + 120 * S, cy + 62 * S]], '#bfaaff', 0.55);
  c.line(cx, cy + 62 * S, cx, cy + 440 * S, 5 * S, '#ffffff', 0.35);

  // waterfalls
  for (let i = 0; i < 5; i++) {
    const x = cx - (170 - i * 26) * S;
    c.line(x, cy + 30 * S, x + 6 * S, cy + (300 + rng() * 60) * S, 7 * S, '#dff0ff', 0.75);
  }

  // glass platform
  c.ellipse(cx, cy, 330 * S, 112 * S, '#e8d9ff', 0.95);
  c.ellipse(cx, cy - 14 * S, 262 * S, 74 * S, '#ffffff', 0.4);
  c.ellipse(cx, cy + 6 * S, 330 * S, 106 * S, '#9d8bd8', 0.25);

  // crystal tree
  c.glow(cx + 60 * S, cy - 300 * S, 240 * S, '#ffb8e6', 0.5);
  c.line(cx + 66 * S, cy - 8 * S, cx + 44 * S, cy - 235 * S, 15 * S, '#efe0d8', 0.95);
  const crown = ['#ffb8e6', '#c9a8ff', '#9fd8ff', '#ffd9ec'];
  for (let i = 0; i < 9; i++) {
    const a = rng() * Math.PI * 2, d = rng() * 120 * S;
    c.ellipse(cx + 44 * S + Math.cos(a) * d, cy - 300 * S + Math.sin(a) * d * 0.7, (52 + rng() * 58) * S, (52 + rng() * 58) * S, crown[i % 4], 0.72);
  }
  c.ellipse(cx + 44 * S, cy - 300 * S, 60 * S, 60 * S, '#ffffff', 0.5);

  // side crystals
  c.poly([[cx - 250 * S, cy - 20 * S], [cx - 224 * S, cy - 120 * S], [cx - 198 * S, cy - 20 * S]], '#9fd8ff', 0.85);
  c.poly([[cx + 218 * S, cy - 14 * S], [cx + 244 * S, cy - 96 * S], [cx + 270 * S, cy - 14 * S]], '#ffd9ec', 0.8);

  // sparkles
  for (let i = 0; i < 14; i++) {
    const x = cx + (rng() - 0.5) * 640 * S, y = cy - rng() * 480 * S + 60 * S, l = (4 + rng() * 7) * S;
    c.line(x - l, y, x + l, y, 1.6 * S, '#ffffff', 0.85);
    c.line(x, y - l, x, y + l, 1.6 * S, '#ffffff', 0.85);
  }
  return c;
}

function savePNG(name, canvas) {
  fs.writeFileSync(path.join(outDir, name), encodePNG(canvas.w, canvas.h, canvas.buf));
  console.log(`[moodscape] painted ${name} (${canvas.w}x${canvas.h})`);
}

/* ------------------------------------------------------------------ */
/* WAV synthesis                                                       */
/* ------------------------------------------------------------------ */
function writeWav(file, samples, sr) {
  const n = samples.length;
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0);
  hdr.writeUInt32LE(36 + data.length, 4);
  hdr.write('WAVE', 8); hdr.write('fmt ', 12);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 2, 28);
  hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([hdr, data]));
}

function synthAmbient() {
  const sr = 44100, secs = 22, N = sr * secs;
  const rng = makeRng(77);
  const out = new Float32Array(N);
  const chords = [
    [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
    [116.54, 146.83, 174.61, 220.0, 261.63], // Bb add
  ];
  for (const [ci, chord] of chords.entries()) {
    for (const f of chord) {
      const lfoF = 0.04 + rng() * 0.05, lfoP = rng() * 6.28, det = 0.35 + rng() * 0.4;
      for (let i = 0; i < N; i++) {
        const t = i / sr;
        const xf = 0.5 + 0.5 * Math.tanh(Math.sin((t / secs) * Math.PI * 2 + ci * Math.PI) * 3);
        if ((ci === 0 ? xf : 1 - xf) < 0.02) continue;
        const lfo = 0.7 + 0.3 * Math.sin(6.283 * lfoF * t + lfoP);
        const s = Math.sin(6.283 * f * t) + 0.35 * Math.sin(6.283 * (f + det) * t) + 0.12 * Math.sin(6.283 * f * 2 * t);
        out[i] += s * lfo * (ci === 0 ? xf : 1 - xf) * 0.028;
      }
    }
  }
  // wind: filtered noise with slow swells
  let y = 0;
  for (let i = 0; i < N; i++) {
    const t = i / sr;
    y += 0.018 * ((rng() * 2 - 1) - y);
    out[i] += y * (0.35 + 0.3 * Math.sin(6.283 * t / 11)) * 0.9;
  }
  // sparse glass chimes (pentatonic)
  const notes = [880, 1046.5, 1174.7, 1318.5, 1568];
  for (const start of [1.4, 5.1, 9.3, 13.9, 18.2]) {
    const f = notes[Math.floor(rng() * notes.length)];
    const s0 = Math.floor(start * sr);
    for (let i = 0; i + s0 < N && i < sr * 3; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 2.4);
      out[s0 + i] += (Math.sin(6.283 * f * t) + 0.3 * Math.sin(6.283 * f * 2.76 * t) * Math.exp(-t * 3)) * env * 0.06;
    }
  }
  // seamless 1.2s loop crossfade
  const F = Math.floor(sr * 1.2);
  for (let i = 0; i < F; i++) {
    const k = i / F;
    out[N - F + i] = out[N - F + i] * (1 - k) + out[i] * k;
  }
  // normalize
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
  for (let i = 0; i < N; i++) out[i] = (out[i] / (peak || 1)) * 0.75;
  writeWav(path.join(outDir, 'ambient.wav'), out, sr);
  console.log('[moodscape] synthesized ambient.wav (22s loop)');
}

function synthChime() {
  const sr = 44100, N = Math.floor(sr * 1.8);
  const rng = makeRng(9);
  const out = new Float32Array(N);
  const f = 1318.5; // E6
  for (let i = 0; i < N; i++) {
    const t = i / sr;
    let s = Math.sin(6.283 * f * t) * Math.exp(-t * 3.2)
      + 0.4 * Math.sin(6.283 * f * 2.76 * t) * Math.exp(-t * 5.5)
      + 0.15 * Math.sin(6.283 * f * 5.4 * t) * Math.exp(-t * 8);
    if (t < 0.005) s += (rng() * 2 - 1) * 0.3 * (1 - t / 0.005); // strike
    out[i] = s * 0.5;
  }
  writeWav(path.join(outDir, 'chime.wav'), out, sr);
  console.log('[moodscape] synthesized chime.wav');
}

/* ------------------------------------------------------------------ */
const want = (n) => !fs.existsSync(path.join(outDir, n)) || fs.statSync(path.join(outDir, n)).size === 0;

if (want('icon.png')) {
  savePNG('icon.png', paintIsland(2, true).downsample(2));
}
if (want('adaptive-icon.png')) {
  savePNG('adaptive-icon.png', paintIsland(2, true).downsample(2));
}
if (want('splash-icon.png')) {
  savePNG('splash-icon.png', paintIsland(1, false).downsample(1));
}
if (want('ambient.wav')) synthAmbient();
if (want('chime.wav')) synthChime();

console.log('[moodscape] assets ready');
