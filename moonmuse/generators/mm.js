// MoonMuse Studio design system — "Apple meets astronomy".
// Minimal, luxurious, celestial: thin gold line-work, soft gradients,
// cream / midnight navy / warm gold / lavender, generous whitespace.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'mm-pages');
fs.mkdirSync(OUT, { recursive: true });

const P = {
  cream: '#F6F1E7', paper: '#FBF8F2', white: '#FFFFFF',
  navy: '#0E1430', navy2: '#1A2142', navy3: '#232B52',
  gold: '#C6A15B', goldSoft: '#E3CD9A', goldFaint: '#EFE3C8',
  lav: '#B9AFE4', lavSoft: '#DCD6F2', lavFaint: '#EEEBF8',
  ink: '#23283E', soft: '#6A7090', line: '#D9D2C4', lineDark: '#2E3660',
};
const f2 = n => Math.round(n * 100) / 100;
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- motifs (thin line-work) ----------
// 4-point sparkle — the MoonMuse signature mark
function sparkle(x, y, r, color = P.gold, o = 1) {
  const k = r * 0.18;
  return `<path d="M ${x} ${y - r} C ${x + k * 0.4} ${y - k} ${x + k} ${y - k * 0.4} ${x + r} ${y} C ${x + k} ${y + k * 0.4} ${x + k * 0.4} ${y + k} ${x} ${y + r} C ${x - k * 0.4} ${y + k} ${x - k} ${y + k * 0.4} ${x - r} ${y} C ${x - k} ${y - k * 0.4} ${x - k * 0.4} ${y - k} ${x} ${y - r} Z" fill="${color}" opacity="${o}"/>`;
}
function crescent(x, y, r, color = P.gold, sw = 0) {
  // moon crescent: outer arc + inner arc offset
  const d = `M ${x} ${f2(y - r)} A ${r} ${r} 0 1 1 ${f2(x - r * 0.09)} ${f2(y + r * 0.996)} A ${f2(r * 1.35)} ${f2(r * 1.35)} 0 0 0 ${x} ${f2(y - r)} Z`;
  return sw ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"/>` : `<path d="${d}" fill="${color}"/>`;
}
// moon phase disc: outline circle + terminator. phase 0..1 (0 new, .5 full)
function moonPhase(x, y, r, phase, stroke = P.gold, fill = null, sw = 1.6) {
  const f = fill || stroke;
  let inner = '';
  const p = phase % 1;
  if (p > 0.02 && p < 0.98) {
    const t = Math.cos(p * 2 * Math.PI); // 1 new, -1 full
    const rx = f2(Math.abs(t) * r);
    const right = p < 0.5;
    // lit portion path: half circle + terminator ellipse
    const sweepOuter = right ? 1 : 0;
    const sweepInner = (p < 0.25 || (p >= 0.5 && p < 0.75)) ? (right ? 0 : 1) : (right ? 1 : 0);
    inner = `<path d="M ${x} ${f2(y - r)} A ${r} ${r} 0 0 ${sweepOuter} ${x} ${f2(y + r)} A ${rx} ${r} 0 0 ${sweepInner} ${x} ${f2(y - r)} Z" fill="${f}" opacity="0.92"/>`;
  } else if (p >= 0.98 || p <= 0.02) {
    inner = '';
  }
  if (Math.abs(p - 0.5) < 0.02) inner = `<circle cx="${x}" cy="${y}" r="${f2(r * 0.985)}" fill="${f}" opacity="0.92"/>`;
  return `${inner}<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function dotStars(n, w, h, seed, color, maxR = 1.6, o = 0.8) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${f2(r() * w)}" cy="${f2(r() * h)}" r="${f2(0.5 + r() * maxR)}" fill="${color}" opacity="${f2(o * (0.3 + r() * 0.7))}"/>`;
  }
  return s;
}
function constellation(x, y, w, h, seed, color = P.gold, n = 6, dotR = 2.2, sw = 1) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) pts.push([f2(x + (i / (n - 1)) * w + (r() - 0.5) * w * 0.16), f2(y + (i % 2 ? 0.75 : 0.15) * h + (r() - 0.5) * h * 0.3)]);
  let s = '';
  for (let i = 0; i < n - 1; i++) s += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}" stroke="${color}" stroke-width="${sw}" opacity="0.55"/>`;
  pts.forEach(([px, py], i) => { s += i === Math.floor(n / 2) ? sparkle(px, py, dotR * 3.2, color) : `<circle cx="${px}" cy="${py}" r="${dotR}" fill="${color}"/>`; });
  return s;
}
function ringedPlanet(x, y, r, color = P.gold, sw = 1.6) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
  <ellipse cx="${x}" cy="${y}" rx="${f2(r * 1.75)}" ry="${f2(r * 0.5)}" fill="none" stroke="${color}" stroke-width="${sw * 0.8}" transform="rotate(-16 ${x} ${y})" opacity="0.85"/>`;
}
function sunMark(x, y, r, color = P.gold, sw = 1.6) {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rays += `<line x1="${f2(x + Math.cos(a) * r * 1.45)}" y1="${f2(y + Math.sin(a) * r * 1.45)}" x2="${f2(x + Math.cos(a) * r * 1.95)}" y2="${f2(y + Math.sin(a) * r * 1.95)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>${rays}`;
}
// soft gradient sky
function sky(w, h, mode, id) {
  const g = mode === 'dark'
    ? `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1028"/><stop offset="0.55" stop-color="${P.navy}"/><stop offset="1" stop-color="#1C2450"/></linearGradient>`
    : `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.paper}"/><stop offset="0.6" stop-color="${P.cream}"/><stop offset="1" stop-color="${P.lavFaint}"/></linearGradient>`;
  return `<defs>${g}</defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}
// full moonmuse logo lockup (icon + wordmark), light or dark ground
function logo(x, y, scale, onDark = false) {
  const c = onDark ? P.goldSoft : P.gold;
  const ink = onDark ? P.cream : P.ink;
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <circle cx="0" cy="0" r="30" fill="none" stroke="${c}" stroke-width="1.8"/>
    ${crescent(-1, 0, 16, c)}
    ${sparkle(13, -11, 4.5, c)}
    <text x="48" y="1" font-family="Georgia" font-size="26" letter-spacing="7" fill="${ink}" dominant-baseline="middle">MOONMUSE</text>
    <text x="50" y="22" font-family="'DejaVu Sans'" font-size="10" letter-spacing="9" fill="${onDark ? P.lav : P.soft}" dominant-baseline="middle">S T U D I O</text>
  </g>`;
}
function iconOnly(x, y, scale, color = P.gold) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <circle cx="0" cy="0" r="30" fill="none" stroke="${color}" stroke-width="1.8"/>
    ${crescent(-1, 0, 16, color)}
    ${sparkle(13, -11, 4.5, color)}
  </g>`;
}

function page(name, w, h, svgInner, overlayHtml = '', bg = '#000') {
  const html = `<!doctype html><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${w}px; height:${h}px; overflow:hidden; background:${bg}; }
  .wrap { position:relative; width:${w}px; height:${h}px; }
  svg.base { position:absolute; inset:0; display:block; }
  .ov { position:absolute; inset:0; font-family: Georgia, 'DejaVu Serif', serif; }
  .sans { font-family: 'DejaVu Sans', Arial, sans-serif; }
</style>
<div class="wrap">
  <svg class="base" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${svgInner}</svg>
  <div class="ov">${overlayHtml}</div>
</div>`;
  fs.writeFileSync(path.join(OUT, name + '.html'), html);
  console.log('mm:', name);
}

module.exports = { P, f2, rng, sparkle, crescent, moonPhase, dotStars, constellation, ringedPlanet, sunMark, sky, logo, iconOnly, page, OUT };
