// MoonMuse wallpapers (phone 50 designs x lock/home x dark/light) +
// desktop (3 designs x 4 sizes x 2 modes) + wall art (6 designs x 5 ratios).
const M = require('./mm.js');
const { P, f2, rng, sparkle, crescent, moonPhase, dotStars, constellation, ringedPlanet, sunMark, sky, page } = M;

const QUOTES = [
  'Plan by moonlight.', 'Quietly, and in phases.', 'The night is patient.',
  'Begin again, gently.', 'Slow is a direction.', 'Even the moon rests.',
  'Small lights still count.', 'Aim your telescope.', 'Soft focus, full heart.',
  'The stars keep their own time.', 'Breathe out longer.', 'Let it wane.',
  'Full, in your own time.', 'Orbit what matters.', 'Darkness is half the art.',
  'Rise like the slow moon.', 'Keep one still corner.', 'Gravity is optional tonight.',
  'New moon, new margin.', 'You are the quiet sky.',
];

function phoneArt(W, H, seed, mode, variant, quote) {
  const dark = mode === 'dark';
  const fg = dark ? P.goldSoft : P.gold;
  const lav = dark ? P.lav : '#9A8FD0';
  const r = rng(seed);
  let art = sky(W, H, mode, `s${seed}${mode}${variant}`);
  art += dotStars(dark ? 110 : 60, W, H, seed + 1, dark ? '#C9D0EE' : P.gold, 1.7, dark ? 0.6 : 0.3);
  const kind = seed % 5;
  if (variant === 'lock') {
    // clear space top third for clock; art anchored low
    if (kind === 0) art += moonPhase(W / 2, H * 0.62, W * 0.17, [0.25, 0.5, 0.72, 0.88][seed % 4], fg, fg, 3) + sparkle(W * 0.7, H * 0.5, 16, lav);
    if (kind === 1) art += constellation(W * 0.14, H * 0.55, W * 0.72, H * 0.16, seed + 5, fg, 5 + (seed % 3), 4, 1.6);
    if (kind === 2) art += crescent(W / 2, H * 0.6, W * 0.15, fg) + sparkle(W * 0.66, H * 0.52, 20, lav) + sparkle(W * 0.35, H * 0.68, 13, fg);
    if (kind === 3) art += ringedPlanet(W / 2, H * 0.6, W * 0.11, fg, 3) + dotStars(20, W, H * 0.3, seed + 9, lav, 2, 0.7).replace(/cy="([\d.]+)"/g, (m, y) => `cy="${f2(parseFloat(y) + H * 0.45)}"`);
    if (kind === 4) { // moon phase row
      const ph = [0.05, 0.25, 0.5, 0.75, 0.95];
      ph.forEach((p, i) => art += moonPhase(W * (0.18 + i * 0.16), H * 0.62, W * 0.05, p, fg, fg, 2.4));
    }
    if (quote) art += `<text x="${W / 2}" y="${H * 0.8}" text-anchor="middle" font-family="Georgia" font-size="${W * 0.045}" fill="${dark ? P.cream : P.ink}" opacity="0.9">${quote}</text>
      <line x1="${W / 2 - 60}" y1="${H * 0.83}" x2="${W / 2 + 60}" y2="${H * 0.83}" stroke="${fg}" stroke-width="2" opacity="0.7"/>`;
  } else {
    // home: sparse, corners only, icons live in middle
    if (kind % 2 === 0) art += moonPhase(W * 0.82, H * 0.08, W * 0.07, [0.25, 0.72][seed % 2], fg, fg, 2.4);
    else art += crescent(W * 0.84, H * 0.08, W * 0.06, fg);
    art += sparkle(W * 0.12, H * 0.05, 12, lav, 0.9);
    art += `<g opacity="0.5">${constellation(W * 0.1, H * 0.9, W * 0.8, H * 0.05, seed + 3, fg, 5, 3, 1.2)}</g>`;
  }
  return art;
}

// --- 50 designs x lock/home x dark/light
let count = 0;
for (let d = 0; d < 50; d++) {
  const quote = d < 20 ? QUOTES[d] : null;
  for (const mode of ['dark', 'light']) {
    page(`wp-${String(d + 1).padStart(2, '0')}-lock-${mode}`, 1290, 2796, phoneArt(1290, 2796, 100 + d, mode, 'lock', quote));
    page(`wp-${String(d + 1).padStart(2, '0')}-home-${mode}`, 1290, 2796, phoneArt(1290, 2796, 100 + d, mode, 'home', null));
    count += 2;
  }
}
console.log('phone wallpapers:', count);

// --- desktop: 3 designs x 4 sizes x 2 modes
const SIZES = { macbook: [2880, 1800], windows: [2560, 1440], ultrawide: [3440, 1440], ipad: [2048, 2732] };
function desktopArt(W, H, design, mode) {
  const dark = mode === 'dark';
  const fg = dark ? P.goldSoft : P.gold;
  let art = sky(W, H, mode, `d${design}${mode}${W}`);
  art += dotStars(dark ? 160 : 80, W, H, design * 7 + 2, dark ? '#C9D0EE' : P.gold, 1.8, dark ? 0.55 : 0.3);
  if (design === 0) art += moonPhase(W * 0.5, H * 0.46, Math.min(W, H) * 0.13, 0.72, fg, fg, 3) + `<g opacity="0.7">${constellation(W * 0.12, H * 0.72, W * 0.3, H * 0.1, 8, fg, 5, 3.5, 1.4)}</g>` + sparkle(W * 0.78, H * 0.3, 18, dark ? P.lav : '#9A8FD0');
  if (design === 1) { const ph = [0.05, 0.25, 0.5, 0.75, 0.95]; ph.forEach((p, i) => art += moonPhase(W * (0.5 + (i - 2) * 0.11), H * 0.5, Math.min(W, H) * 0.045, p, fg, fg, 2.6)); }
  if (design === 2) art += `<g opacity="0.85">${constellation(W * 0.2, H * 0.32, W * 0.6, H * 0.3, 15, fg, 7, 4, 1.6)}</g>` + crescent(W * 0.86, H * 0.16, Math.min(W, H) * 0.05, fg);
  return art;
}
for (let d = 0; d < 3; d++) for (const [sz, [W, H]] of Object.entries(SIZES)) for (const mode of ['dark', 'light'])
  page(`dt-${d + 1}-${sz}-${mode}`, W, H, desktopArt(W, H, d, mode));
console.log('desktop done');

// --- wall art: 6 designs x 5 ratios
const RATIOS = { '2x3': [2400, 3600], '3x4': [2700, 3600], '4x5': [2880, 3600], 'A4': [2480, 3508], 'A3': [2980, 4213] };
function artPrint(W, H, design) {
  const m = W * 0.09; // generous mat
  let inner = `<rect width="${W}" height="${H}" fill="${P.paper}"/>`;
  const cw = W - 2 * m, ch = H - 2 * m;
  const cx = W / 2;
  const label = (t, sub) => `<text x="${cx}" y="${H - m * 1.45}" text-anchor="middle" font-family="Georgia" font-size="${W * 0.032}" letter-spacing="${W * 0.008}" fill="${P.ink}">${t}</text>
    <text x="${cx}" y="${H - m * 1.06}" text-anchor="middle" font-family="'DejaVu Sans'" font-size="${W * 0.013}" letter-spacing="${W * 0.006}" fill="${P.soft}">${sub}</text>`;
  if (design === 0) { // moon phases column
    const ph = [0.05, 0.25, 0.38, 0.5, 0.62, 0.75, 0.95];
    ph.forEach((p, i) => inner += moonPhase(cx, m + ch * 0.1 + i * ch * 0.1, W * 0.052, p, P.gold, P.gold, 3));
    inner += label('L U N A R', 'THE PHASES OF THE MOON');
  }
  if (design === 1) { // minimal stars grid
    const r = rng(9);
    for (let i = 0; i < 60; i++) inner += (i % 7 === 0 ? sparkle(m + r() * cw, m + r() * ch * 0.82, W * 0.012, P.gold) : `<circle cx="${f2(m + r() * cw)}" cy="${f2(m + r() * ch * 0.82)}" r="${f2(W * 0.0035)}" fill="${i % 3 ? P.ink : P.gold}" opacity="0.8"/>`);
    inner += label('S T A R F I E L D', 'A QUIET SCATTER OF LIGHT');
  }
  if (design === 2) { inner += `<g opacity="0.9">${constellation(m + cw * 0.08, m + ch * 0.2, cw * 0.84, ch * 0.4, 5, P.navy, 7, W * 0.006, 2.4)}</g>`; inner += label('C O N S T E L L A T I O N', 'DRAWN BY SEVEN BRIGHT POINTS'); }
  if (design === 3) { inner += sunMark(cx - cw * 0.2, m + ch * 0.38, W * 0.075, P.gold, 3.4) + moonPhase(cx + cw * 0.2, m + ch * 0.38, W * 0.075, 0.82, P.navy, P.navy, 3.4); inner += label('S O L  &amp;  L U N A', 'THE DAY AND ITS SISTER'); }
  if (design === 4) { // minimal planets
    inner += `<circle cx="${cx}" cy="${m + ch * 0.36}" r="${W * 0.1}" fill="none" stroke="${P.navy}" stroke-width="3.4"/>`;
    inner += ringedPlanet(cx - cw * 0.28, m + ch * 0.2, W * 0.038, P.gold, 3);
    inner += `<circle cx="${f2(cx + cw * 0.3)}" cy="${m + ch * 0.52}" r="${W * 0.02}" fill="${P.gold}"/>`;
    inner += `<circle cx="${f2(cx + cw * 0.24)}" cy="${m + ch * 0.14}" r="${W * 0.012}" fill="${P.navy}"/>`;
    inner += label('O R B I T S', 'MINOR BODIES, MAJOR CALM');
  }
  if (design === 5) { // quote
    inner += dotStars(24, W, H * 0.4, 31, P.gold, W * 0.001 + 1.4, 0.5);
    inner += crescent(cx, m + ch * 0.3, W * 0.075, P.gold);
    inner += `<text x="${cx}" y="${m + ch * 0.56}" text-anchor="middle" font-family="Georgia" font-size="${W * 0.05}" fill="${P.ink}">Plan by moonlight.</text>`;
    inner += `<text x="${cx}" y="${m + ch * 0.63}" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="${W * 0.02}" fill="${P.soft}">quietly, and in phases</text>`;
    inner += `<line x1="${cx - W * 0.05}" y1="${m + ch * 0.72}" x2="${cx + W * 0.05}" y2="${m + ch * 0.72}" stroke="${P.gold}" stroke-width="3"/>`;
  }
  return inner;
}
const ARTNAMES = ['moon-phases', 'starfield', 'constellation', 'sun-and-moon', 'planets', 'quote'];
for (let d = 0; d < 6; d++) for (const [rt, [W, H]] of Object.entries(RATIOS))
  page(`art-${ARTNAMES[d]}-${rt}`, W, H, artPrint(W, H, d));
console.log('wall art done');
