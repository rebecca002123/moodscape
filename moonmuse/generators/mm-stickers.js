// MoonMuse GoodNotes sticker pack: 100 base designs x 6 pastel colourways = 600 stickers.
// Rendered as transparent 5x6 sheets (220px cells), sliced to PNGs by slice-stickers.py.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'mm-pages');
fs.mkdirSync(OUT, { recursive: true });

const PASTELS = {
  gold: { main: '#D9B978', soft: '#F2E4C4', ink: '#8A6F35' },
  lavender: { main: '#C3B8EC', soft: '#E9E4F9', ink: '#6F63A8' },
  blush: { main: '#EFC3CB', soft: '#FAE7EA', ink: '#B06B78' },
  sage: { main: '#BFD4B9', soft: '#E7F0E4', ink: '#6E8A66' },
  sky: { main: '#B8D3EA', soft: '#E5F0F9', ink: '#5F82A5' },
  navy: { main: '#4A5480', soft: '#D7DBEA', ink: '#232B52' },
};
const CELL = 220, COLS = 5, ROWS = 6;

const S = (x, y, r, c) => { const k = r * 0.18; return `<path d="M ${x} ${y - r} C ${x + k * .4} ${y - k} ${x + k} ${y - k * .4} ${x + r} ${y} C ${x + k} ${y + k * .4} ${x + k * .4} ${y + k} ${x} ${y + r} C ${x - k * .4} ${y + k} ${x - k} ${y + k * .4} ${x - r} ${y} C ${x - k} ${y - k * .4} ${x - k * .4} ${y - k} ${x} ${y - r} Z" fill="${c}"/>`; };
const star5 = (x, y, r, c) => { let p = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = -Math.PI / 2 + i * Math.PI / 5; p += `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)} `; } return `<polygon points="${p}" fill="${c}"/>`; };
const moonp = (x, y, r, ph, C, filled) => {
  let inner = '';
  if (ph === 'full') inner = `<circle cx="${x}" cy="${y}" r="${r * .96}" fill="${C.main}"/>`;
  else if (ph === 'new') inner = '';
  else {
    const map = { wax_c: [0.12, 1], first_q: [0.25, 1], wax_g: [0.38, 1], wan_g: [0.62, 0], last_q: [0.75, 0], wan_c: [0.88, 0] };
    const [p, right] = map[ph];
    const rx = Math.abs(Math.cos(p * 2 * Math.PI)) * r;
    const sweepInner = (p < 0.25 || (p >= 0.5 && p < 0.75)) ? 1 - right : right;
    inner = `<path d="M ${x} ${y - r} A ${r} ${r} 0 0 ${right} ${x} ${y + r} A ${rx.toFixed(1)} ${r} 0 0 ${sweepInner} ${x} ${y - r} Z" fill="${C.main}"/>`;
  }
  return `${filled ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.soft}"/>` : ''}${inner}<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
};
const pill = (x, y, w, h, text, C, fs2 = 26) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.soft}" stroke="${C.main}" stroke-width="3"/><text x="${x}" y="${y + fs2 * 0.36}" text-anchor="middle" font-family="'DejaVu Sans'" font-size="${fs2}" letter-spacing="3" fill="${C.ink}">${text}</text>`;
const tag = (x, y, w, h, text, C, fs2 = 24) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="${C.main}"/><text x="${x}" y="${y + fs2 * 0.36}" text-anchor="middle" font-family="'DejaVu Sans'" font-size="${fs2}" letter-spacing="2.5" fill="#fff">${text}</text>`;

// each design: (C) => svg fragment centered in 220x220
const designs = [];
const add = (name, fn) => designs.push({ name, fn });
// --- moons: 8 phases x 2 styles = 16
for (const [ph, label] of [['new', 'new'], ['wax_c', 'waxing-crescent'], ['first_q', 'first-quarter'], ['wax_g', 'waxing-gibbous'], ['full', 'full'], ['wan_g', 'waning-gibbous'], ['last_q', 'last-quarter'], ['wan_c', 'waning-crescent']]) {
  add(`moon-${label}`, C => moonp(110, 110, 62, ph, C, false));
  add(`moon-${label}-soft`, C => moonp(110, 110, 62, ph, C, true));
}
// --- stars: 5
add('star-sparkle', C => S(110, 110, 58, C.main) + `<circle cx="110" cy="110" r="70" fill="none" stroke="${C.soft}" stroke-width="0"/>`);
add('star-classic', C => star5(110, 110, 62, C.main));
add('star-outline', C => { let p = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? 28 : 62, a = -Math.PI / 2 + i * Math.PI / 5; p += `${(110 + Math.cos(a) * rr).toFixed(1)},${(110 + Math.sin(a) * rr).toFixed(1)} `; } return `<polygon points="${p}" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`; });
add('star-cluster', C => S(85, 95, 34, C.main) + S(140, 70, 18, C.ink) + S(145, 140, 24, C.main) + `<circle cx="95" cy="155" r="7" fill="${C.ink}"/>`);
add('star-shooting', C => star5(75, 85, 30, C.main) + `<path d="M 100 100 q 40 20 80 60" fill="none" stroke="${C.main}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 14"/>`);
// --- clouds: 3
const cloudPath = (x, y, s2, C, fill) => `<path transform="translate(${x},${y}) scale(${s2})" d="M -60 20 a 22 22 0 0 1 4 -43 a 30 30 0 0 1 57 -9 a 24 24 0 0 1 32 22 a 18 18 0 0 1 -4 30 Z" fill="${fill}" stroke="${C.ink}" stroke-width="${4 / s2}" stroke-linejoin="round"/>`;
add('cloud', C => cloudPath(122, 110, 1.3, C, C.soft));
add('cloud-moon', C => moonp(140, 80, 36, 'wax_c', C, false) + cloudPath(105, 140, 1.1, C, C.soft));
add('cloud-stars', C => cloudPath(122, 95, 1.2, C, C.soft) + S(80, 160, 14, C.main) + S(125, 172, 10, C.ink) + S(165, 158, 12, C.main));
// --- constellations: 4
const constel = (pts, C) => { let s2 = ''; for (let i = 0; i < pts.length - 1; i++) s2 += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}" stroke="${C.main}" stroke-width="3" opacity="0.8"/>`; pts.forEach(([px, py], i) => s2 += i === 2 ? S(px, py, 12, C.ink) : `<circle cx="${px}" cy="${py}" r="6" fill="${C.ink}"/>`); return s2; };
add('constellation-arc', C => constel([[40, 140], [80, 90], [120, 110], [160, 70], [185, 100]], C));
add('constellation-zigzag', C => constel([[45, 80], [90, 130], [130, 75], [170, 125], [185, 95]], C));
add('constellation-crown', C => constel([[40, 130], [75, 80], [110, 115], [145, 75], [180, 130]], C));
add('constellation-dipper', C => constel([[45, 90], [85, 95], [120, 105], [150, 130], [185, 120]], C));
// --- sparkle clusters: 3
add('sparkles-trio', C => S(80, 90, 30, C.main) + S(135, 120, 20, C.ink) + S(105, 160, 14, C.main));
add('sparkles-rain', C => [50, 90, 130, 170].map((x, i) => S(x, 70 + i * 28, 14 + (i % 2) * 8, i % 2 ? C.ink : C.main)).join(''));
add('sparkles-halo', C => `<circle cx="110" cy="110" r="48" fill="none" stroke="${C.soft}" stroke-width="10"/>` + S(110, 62, 16, C.main) + S(158, 110, 12, C.ink) + S(110, 158, 14, C.main) + S(62, 110, 12, C.ink));
// --- arrows: 6
const arr = (d, C, extra = '') => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>${extra}`;
add('arrow-right', C => arr('M 40 110 H 175 M 145 80 L 178 110 L 145 140', C));
add('arrow-curve', C => arr('M 50 150 Q 110 40 168 96 M 168 60 L 172 100 L 132 102', C));
add('arrow-swirl', C => arr('M 45 140 q 30 -80 75 -45 q 35 28 -5 45 q -30 10 -22 -22 M 150 80 L 172 108 L 136 116', C));
add('arrow-down', C => arr('M 110 45 V 170 M 80 140 L 110 173 L 140 140', C));
add('arrow-double', C => arr('M 55 90 H 165 M 140 65 L 168 90 L 140 115 M 165 145 H 55 M 80 120 L 52 145 L 80 170', C));
add('arrow-dotted', C => `<path d="M 45 110 H 160" fill="none" stroke="${C.main}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 18"/>` + arr('M 140 82 L 172 110 L 140 138', C));
// --- checklist: 5
add('check-box', C => `<rect x="60" y="60" width="100" height="100" rx="24" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/>`);
add('check-done', C => `<rect x="60" y="60" width="100" height="100" rx="24" fill="${C.main}"/><path d="M 85 112 L 105 132 L 140 88" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`);
add('check-circle', C => `<circle cx="110" cy="110" r="52" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/>`);
add('check-moon-done', C => `<circle cx="110" cy="110" r="52" fill="${C.main}"/><path d="M 118 74 A 40 40 0 1 0 118 146 A 48 48 0 0 1 118 74 Z" fill="#fff" opacity="0.9"/>`);
add('check-bullet', C => `<circle cx="110" cy="110" r="18" fill="${C.ink}"/><circle cx="110" cy="110" r="34" fill="none" stroke="${C.main}" stroke-width="5"/>`);
// --- tabs: 3
add('tab-round', C => `<path d="M 40 160 v -60 a 24 24 0 0 1 24 -24 h 92 a 24 24 0 0 1 24 24 v 60 Z" fill="${C.main}"/>`);
add('tab-label', C => `<rect x="38" y="80" width="144" height="60" rx="14" fill="${C.soft}" stroke="${C.ink}" stroke-width="4"/><line x1="60" y1="110" x2="160" y2="110" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/>`);
add('tab-flag', C => `<path d="M 60 50 h 100 v 120 l -50 -28 l -50 28 Z" fill="${C.main}"/>` + S(110, 95, 18, '#fff'));
// --- planner labels: 12
for (const w of ['TODAY', 'TO DO', 'NOTES', 'IDEAS', 'GOALS', 'FOCUS', 'REMEMBER', 'SELF CARE', 'DEADLINE', 'EVENT', 'DONE', 'PLANS']) add(`label-${w.toLowerCase().replace(' ', '')}`, C => tag(110, 110, w.length > 6 ? 190 : 150, 58, w, C, w.length > 6 ? 21 : 25));
// --- months: 12
for (const m of ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']) add(`month-${m.toLowerCase()}`, C => pill(110, 110, 140, 62, m, C));
// --- weekdays: 7
for (const d of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']) add(`day-${d.toLowerCase()}`, C => pill(110, 110, 132, 56, d, C, 24));
// --- reminder icons: 6
add('icon-bell', C => `<path d="M 78 138 a 32 40 0 0 1 64 0 Z m -10 0 h 84" fill="${C.soft}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="110" cy="152" r="9" fill="${C.main}"/><line x1="110" y1="92" x2="110" y2="80" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`);
add('icon-clock', C => `<circle cx="110" cy="110" r="52" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><path d="M 110 82 V 110 L 134 124" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`);
add('icon-calendar', C => `<rect x="58" y="70" width="104" height="90" rx="14" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><line x1="58" y1="96" x2="162" y2="96" stroke="${C.ink}" stroke-width="5"/><line x1="84" y1="58" x2="84" y2="80" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><line x1="136" y1="58" x2="136" y2="80" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="122" r="7" fill="${C.main}"/><circle cx="118" cy="122" r="7" fill="${C.main}"/><circle cx="146" cy="122" r="7" fill="${C.main}"/>`);
add('icon-pin', C => `<path d="M 110 55 a 38 38 0 0 1 38 38 c 0 28 -38 72 -38 72 s -38 -44 -38 -72 a 38 38 0 0 1 38 -38 Z" fill="${C.main}"/><circle cx="110" cy="93" r="14" fill="#fff"/>`);
add('icon-envelope', C => `<rect x="52" y="76" width="116" height="76" rx="12" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><path d="M 56 82 L 110 122 L 164 82" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
add('icon-reminder-star', C => `<circle cx="110" cy="110" r="50" fill="${C.soft}"/><circle cx="110" cy="110" r="50" fill="none" stroke="${C.main}" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>` + S(110, 110, 26, C.ink));
// --- finance: 6
add('fin-coin', C => `<circle cx="110" cy="110" r="50" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><text x="110" y="128" text-anchor="middle" font-family="Georgia" font-size="52" fill="${C.ink}">£</text>`);
add('fin-note', C => `<rect x="48" y="80" width="124" height="68" rx="10" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><circle cx="110" cy="114" r="18" fill="none" stroke="${C.main}" stroke-width="5"/><line x1="64" y1="114" x2="72" y2="114" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/><line x1="148" y1="114" x2="156" y2="114" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/>`);
add('fin-piggy', C => `<ellipse cx="110" cy="118" rx="52" ry="40" fill="${C.main}"/><circle cx="88" cy="108" r="5" fill="#fff"/><rect x="96" y="70" width="28" height="10" rx="5" fill="${C.ink}"/><path d="M 158 108 q 14 4 10 18" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><rect x="80" y="152" width="12" height="16" rx="5" fill="${C.ink}"/><rect x="128" y="152" width="12" height="16" rx="5" fill="${C.ink}"/>`);
add('fin-wallet', C => `<rect x="52" y="72" width="116" height="84" rx="16" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><rect x="126" y="100" width="42" height="30" rx="10" fill="${C.main}"/><circle cx="144" cy="115" r="6" fill="#fff"/>`);
add('fin-chart', C => `<path d="M 55 160 V 60 M 55 160 H 170" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/><path d="M 68 140 L 100 110 L 122 126 L 158 78" fill="none" stroke="${C.main}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` + S(160, 70, 12, C.ink));
add('fin-receipt', C => `<path d="M 70 55 h 80 v 105 l -13 -9 l -14 9 l -13 -9 l -14 9 l -13 -9 l -13 9 Z" fill="${C.soft}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><line x1="88" y1="85" x2="132" y2="85" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/><line x1="88" y1="105" x2="132" y2="105" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/><line x1="88" y1="125" x2="116" y2="125" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/>`);
// --- study: 6
add('study-book', C => `<path d="M 110 70 q -30 -14 -55 -6 v 92 q 25 -8 55 6 q 30 -14 55 -6 v -92 q -25 -8 -55 6 Z M 110 70 v 92" fill="${C.soft}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`);
add('study-pencil', C => `<g transform="rotate(45 110 110)"><rect x="94" y="40" width="32" height="110" rx="4" fill="${C.main}"/><path d="M 94 150 h 32 l -16 28 Z" fill="${C.soft}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><rect x="94" y="40" width="32" height="16" rx="4" fill="${C.ink}"/></g>`);
add('study-laptop', C => `<rect x="62" y="70" width="96" height="62" rx="8" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><path d="M 50 150 h 120 l -10 -14 H 60 Z" fill="${C.main}"/>`);
add('study-gradcap', C => `<path d="M 110 70 L 175 98 L 110 126 L 45 98 Z" fill="${C.main}"/><path d="M 78 112 v 26 q 32 18 64 0 v -26" fill="none" stroke="${C.ink}" stroke-width="5"/><line x1="168" y1="102" x2="168" y2="136" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`);
add('study-bulb', C => `<circle cx="110" cy="98" r="38" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><path d="M 96 132 h 28 v 14 a 8 8 0 0 1 -8 8 h -12 a 8 8 0 0 1 -8 -8 Z" fill="${C.main}"/>` + S(110, 96, 16, C.main));
add('study-bookmark', C => `<path d="M 76 52 h 68 v 118 l -34 -22 l -34 22 Z" fill="${C.main}"/>` + S(110, 92, 16, '#fff'));
// --- health: 6
add('health-heart', C => `<path d="M 110 158 C 60 122 52 92 68 74 a 28 28 0 0 1 42 4 a 28 28 0 0 1 42 -4 c 16 18 8 48 -42 84 Z" fill="${C.main}"/>`);
add('health-drop', C => `<path d="M 110 52 c 26 34 40 56 40 76 a 40 40 0 0 1 -80 0 c 0 -20 14 -42 40 -76 Z" fill="${C.soft}" stroke="${C.ink}" stroke-width="5"/><path d="M 92 128 a 18 18 0 0 0 14 18" fill="none" stroke="${C.main}" stroke-width="5" stroke-linecap="round"/>`);
add('health-leaf', C => `<path d="M 145 60 C 85 66 60 100 62 150 c 50 2 84 -23 90 -83 Z" fill="${C.main}"/><path d="M 70 145 Q 100 110 138 70" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`);
add('health-dumbbell', C => `<g transform="rotate(-30 110 110)"><rect x="58" y="96" width="104" height="28" rx="10" fill="${C.soft}" stroke="${C.ink}" stroke-width="4"/><rect x="44" y="78" width="22" height="64" rx="9" fill="${C.main}"/><rect x="154" y="78" width="22" height="64" rx="9" fill="${C.main}"/></g>`);
add('health-sleep', C => `<path d="M 118 58 A 46 46 0 1 0 118 162 A 56 56 0 0 1 118 58 Z" fill="${C.main}"/><text x="140" y="86" font-family="'DejaVu Sans'" font-size="30" fill="${C.ink}">z</text><text x="158" y="66" font-family="'DejaVu Sans'" font-size="22" fill="${C.ink}">z</text>`);
add('health-apple', C => `<circle cx="94" cy="120" r="34" fill="${C.main}"/><circle cx="126" cy="120" r="34" fill="${C.main}"/><path d="M 110 88 q -2 -18 12 -26" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="M 122 66 q 18 -6 22 10 q -18 6 -22 -10 Z" fill="${C.main}"/>`);

console.log('base designs:', designs.length);
// build sheets: for each colourway, designs chunked into pages of 30
const manifest = [];
let sheetNo = 0;
for (const [cname, C] of Object.entries(PASTELS)) {
  for (let i = 0; i < designs.length; i += COLS * ROWS) {
    const chunk = designs.slice(i, i + COLS * ROWS);
    let cells = '';
    chunk.forEach((d, j) => {
      const cx = (j % COLS) * CELL, cy = Math.floor(j / COLS) * CELL;
      cells += `<g transform="translate(${cx},${cy})">${d.fn(C)}</g>`;
      manifest.push({ sheet: sheetNo, col: j % COLS, row: Math.floor(j / COLS), name: `${d.name}--${cname}` });
    });
    const html = `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${COLS * CELL}px;height:${ROWS * CELL}px;background:transparent;overflow:hidden}</style>
<svg width="${COLS * CELL}" height="${ROWS * CELL}" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
    fs.writeFileSync(path.join(OUT, `stickersheet-${String(sheetNo).padStart(2, '0')}.html`), html);
    sheetNo++;
  }
}
fs.writeFileSync(path.join(__dirname, 'sticker-manifest.json'), JSON.stringify({ CELL, COLS, ROWS, stickers: manifest }));
console.log('sheets:', sheetNo, 'stickers:', manifest.length);
