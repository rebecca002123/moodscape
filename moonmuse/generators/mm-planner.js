// MoonMuse Ultimate Digital Planner — undated, A4, ~40 pages, all 21 sections.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'mm-docs');
fs.mkdirSync(OUT, { recursive: true });
const { P } = require('./mm.js');

const MOON = (cx, cy, r, phase, c = P.gold) => {
  // simplified phase glyph for print: outline + crescent fill steps
  const steps = { 0: '', 0.25: `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z" fill="${c}"/>`, 0.5: `<circle cx="${cx}" cy="${cy}" r="${r * 0.98}" fill="${c}"/>`, 0.75: `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="${c}"/>` };
  return `${steps[phase] || ''}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="1.2"/>`;
};
const SPARK = (x, y, r, c = P.gold) => {
  const k = r * 0.18;
  return `<path d="M ${x} ${y - r} C ${x + k * 0.4} ${y - k} ${x + k} ${y - k * 0.4} ${x + r} ${y} C ${x + k} ${y + k * 0.4} ${x + k * 0.4} ${y + k} ${x} ${y + r} C ${x - k * 0.4} ${y + k} ${x - k} ${y + k * 0.4} ${x - r} ${y} C ${x - k} ${y - k * 0.4} ${x - k * 0.4} ${y - k} ${x} ${y - r} Z" fill="${c}"/>`;
};
const phasesRow = w => `<svg width="100%" height="18" viewBox="0 0 ${w} 18">${[0, 0.25, 0.5, 0.75, 0].map((p, i) => MOON(w / 2 - 60 + i * 30, 9, 6, p)).join('')}</svg>`;

function shell(bodyPages) {
  return `<!doctype html><meta charset="utf-8"><title>MoonMuse Ultimate Digital Planner</title>
<style>
  @page { size: 210mm 297mm; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, 'DejaVu Serif', serif; color: ${P.ink}; }
  .page { width:210mm; height:297mm; page-break-after:always; position:relative; background:${P.paper}; padding:18mm 16mm 14mm; }
  .page:last-child { page-break-after:auto; }
  .sans { font-family:'DejaVu Sans',Arial,sans-serif; }
  .label { font-family:'DejaVu Sans'; letter-spacing:3.5px; font-size:8pt; color:${P.gold}; text-transform:uppercase; }
  h1 { font-size:24pt; font-weight:normal; margin:3mm 0 6mm; }
  .rule { border:none; border-top:0.4pt solid ${P.line}; margin:3mm 0; }
  .wl { border-bottom:0.4pt solid ${P.line}; height:8mm; }
  .hint { font-family:'DejaVu Sans'; font-size:7.5pt; color:${P.soft}; }
  .box { border:0.5pt solid ${P.line}; border-radius:4mm; padding:4mm; background:${P.white}; }
  .grid { display:grid; gap:3mm; }
  .cell { border:0.5pt solid ${P.line}; border-radius:3mm; background:${P.white}; }
  .foot { position:absolute; bottom:8mm; left:16mm; right:16mm; display:flex; justify-content:space-between; align-items:center; }
  .foot .sans { font-size:7pt; letter-spacing:2px; color:${P.soft}; }
  table { border-collapse:collapse; width:100%; }
  th { font-family:'DejaVu Sans'; font-size:7.5pt; letter-spacing:1.5px; color:${P.soft}; text-transform:uppercase; font-weight:normal; text-align:left; padding:2mm 2mm; border-bottom:0.6pt solid ${P.gold}; }
  td { border-bottom:0.4pt solid ${P.line}; height:9mm; padding:0 2mm; font-size:9pt; }
</style>${bodyPages}`;
}
const foot = t => `<div class="foot"><span class="sans">MOONMUSE STUDIO</span>${phasesRow(160)}<span class="sans">${t}</span></div>`;
const head = (label, title, hint = '') => `<div class="label">${label}</div><h1>${title}</h1>${hint ? `<div class="hint" style="margin:-4mm 0 4mm;">${hint}</div>` : ''}`;

let pages = '';
// 1 cover
pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
  <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="52" fill="none" stroke="${P.goldSoft}" stroke-width="1.6"/>
  <path d="M 68 26 A 45 45 0 1 1 61 113 A 56 56 0 0 0 68 26 Z" fill="${P.goldSoft}"/>${SPARK(95, 42, 8, P.goldSoft)}</svg>
  <div style="font-size:34pt;margin:10mm 0 3mm;">The Ultimate<br>Digital Planner</div>
  <div class="sans" style="letter-spacing:6px;font-size:10pt;color:${P.lav};margin-top:4mm;">UNDATED &nbsp;·&nbsp; 21 SECTIONS &nbsp;·&nbsp; A4</div>
  <div class="sans" style="letter-spacing:5px;font-size:9pt;color:${P.goldSoft};position:absolute;bottom:16mm;">M O O N M U S E &nbsp; S T U D I O</div>
</div>`;
// 2 welcome
pages += `<div class="page">${head('Welcome', 'A quieter kind of organised')}
  <p style="font-size:11pt;line-height:1.8;margin-bottom:5mm;">This planner is undated, so it begins whenever you do. Every section is a template: print the pages you need, or duplicate them inside GoodNotes, Notability or any PDF annotator. The design stays out of your way — thin gold lines, deep breaths of whitespace, and a moon that keeps you company in the footer.</p>
  <div class="box" style="margin-bottom:5mm;"><div class="label" style="margin-bottom:2mm;">Sections</div>
  <div class="sans" style="font-size:9pt;line-height:2.1;color:${P.ink};">Year at a Glance · Calendar · Goals · Vision Board · Monthly · Weekly · Daily · Habits · Mood · Water · Sleep · Reading · Finance · Budget · Savings · Expenses · Meals · Workouts · Gratitude · Reflection · Notes</div></div>
  <div class="hint">Tip — in GoodNotes: Add Page ▸ From Template, or lasso-copy any page. Nothing here is dated, so nothing here is ever wasted.</div>
  ${foot('WELCOME')}</div>`;
// 3 year at a glance
{
  let cells = '';
  for (let i = 0; i < 12; i++) cells += `<div class="cell" style="height:52mm;padding:3mm;"><div class="label" style="color:${P.soft};letter-spacing:2px;">Month ${i + 1}</div><div style="border-top:0.4pt solid ${P.line};margin-top:2mm;height:40mm;"></div></div>`;
  pages += `<div class="page">${head('The Year', 'Year at a glance', 'name each month, then write only what matters — one intention, one event, one moon')}
  <div class="grid" style="grid-template-columns:repeat(3,1fr);">${cells}</div>${foot('YEAR')}</div>`;
}
// 4 perpetual calendar
{
  let cells = '';
  for (let i = 0; i < 12; i++) {
    let mini = '<table style="width:100%;">';
    mini += '<tr>' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<td style="border:none;height:4mm;font-size:6pt;color:${P.gold};text-align:center;font-family:'DejaVu Sans';">${d}</td>`).join('') + '</tr>';
    for (let r = 0; r < 5; r++) mini += '<tr>' + Array(7).fill(`<td style="border:0.3pt solid ${P.line};height:5.5mm;"></td>`).join('') + '</tr>';
    mini += '</table>';
    cells += `<div style="padding:2mm;"><div class="label" style="letter-spacing:2px;color:${P.soft};margin-bottom:1mm;">Month ${i + 1}</div>${mini}</div>`;
  }
  pages += `<div class="page">${head('Calendar', 'Perpetual calendar', 'undated grids — number the days of any year, forever reusable')}
  <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:2mm;">${cells}</div>${foot('CALENDAR')}</div>`;
}
// 5-6 goals
pages += `<div class="page">${head('Goals', 'This year, by moonlight', 'three goals is a constellation; ten is a cloud')}
  ${[1, 2, 3].map(i => `<div class="box" style="margin-bottom:5mm;"><div class="label">Goal ${i}</div><div class="wl"></div>
  <div style="display:flex;gap:4mm;margin-top:3mm;"><div style="flex:1;"><div class="hint">why it matters</div><div class="wl"></div></div>
  <div style="flex:1;"><div class="hint">first small step</div><div class="wl"></div></div>
  <div style="width:30mm;"><div class="hint">by when</div><div class="wl"></div></div></div></div>`).join('')}
  <div class="hint">Progress moons — colour a quarter each season: ◔ ◑ ◕ ●</div>${foot('GOALS')}</div>`;
pages += `<div class="page">${head('Goals', 'Quarterly constellations', 'break each goal into four seasons of small, finishable steps')}
  ${['Q1', 'Q2', 'Q3', 'Q4'].map(q => `<div class="box" style="margin-bottom:4mm;"><div class="label">${q}</div>
  <div style="display:flex;gap:4mm;">${[1, 2, 3].map(() => '<div style="flex:1;"><div class="wl"></div><div class="wl"></div></div>').join('')}</div></div>`).join('')}${foot('GOALS · QUARTERS')}</div>`;
// 7 vision board
{
  const frames = [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 2], [0, 1, 2, 1], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1]];
  pages += `<div class="page">${head('Vision', 'Vision board', 'paste, sketch or write the year you are aiming your telescope at')}
  <div class="grid" style="grid-template-columns:repeat(3,1fr);grid-auto-rows:70mm;">
  ${frames.map(([c, r, cs, rs], i) => `<div class="cell" style="grid-column:${c + 1}/span ${cs};grid-row:${r + 1}/span ${rs};display:flex;align-items:center;justify-content:center;"><svg width="26" height="26" viewBox="0 0 26 26">${i % 2 ? SPARK(13, 13, 9, P.goldFaint) : MOON(13, 13, 8, [0.25, 0.5, 0.75][i % 3], P.goldFaint)}</svg></div>`).join('')}
  </div>${foot('VISION')}</div>`;
}
// 8-10 monthly x3
for (let c = 0; c < 3; c++) {
  let grid = '<table>';
  grid += '<tr>' + ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<th style="text-align:center;">${d}</th>`).join('') + '</tr>';
  for (let r = 0; r < 5; r++) grid += '<tr>' + Array(7).fill('<td style="height:34mm;vertical-align:top;"></td>').join('') + '</tr>';
  grid += '</table>';
  pages += `<div class="page">${head('Monthly', 'Month of <span style="display:inline-block;border-bottom:0.5pt solid ' + P.line + ';min-width:52mm;">&nbsp;</span>')}
  ${grid}${foot('MONTHLY')}</div>`;
}
// 11-14 weekly x4
for (let c = 0; c < 4; c++) {
  const day = d => `<div class="cell" style="padding:2.5mm;height:49mm;"><div class="label" style="letter-spacing:2px;color:${P.soft};">${d}</div></div>`;
  pages += `<div class="page">${head('Weekly', 'Week of <span style="display:inline-block;border-bottom:0.5pt solid ' + P.line + ';min-width:44mm;">&nbsp;</span>')}
  <div class="grid" style="grid-template-columns:1fr 1fr;">
  ${['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day).join('')}
  </div>
  <div style="display:flex;gap:3mm;margin-top:3mm;">
    ${day('SUNDAY').replace('49mm', '38mm').replace('class="cell"', 'class="cell" style="flex:1;padding:2.5mm;height:38mm;"').replace('style="flex:1;padding:2.5mm;height:38mm;" style=', 'style=')}
    <div class="cell" style="flex:1;padding:2.5mm;height:38mm;"><div class="label" style="letter-spacing:2px;">This week's one thing</div><div class="wl" style="margin-top:4mm;"></div><div class="wl"></div></div>
  </div>${foot('WEEKLY')}</div>`;
}
// 15-21 daily x7
for (let c = 0; c < 7; c++) {
  pages += `<div class="page">${head('Daily', 'Today <span class="hint" style="font-size:9pt;">·</span> <span style="display:inline-block;border-bottom:0.5pt solid ' + P.line + ';min-width:40mm;">&nbsp;</span>')}
  <div style="display:flex;gap:5mm;">
    <div style="flex:1.3;">
      <div class="label">Top three</div>
      ${[1, 2, 3].map(() => `<div style="display:flex;align-items:flex-end;gap:2mm;"><svg width="12" height="12" viewBox="0 0 12 12" style="margin-bottom:2mm;"><circle cx="6" cy="6" r="4.5" fill="none" stroke="${P.gold}" stroke-width="1"/></svg><div class="wl" style="flex:1;"></div></div>`).join('')}
      <div class="label" style="margin-top:5mm;">Then, if there's light left</div>
      ${Array(5).fill('<div class="wl"></div>').join('')}
      <div class="label" style="margin-top:5mm;">Notes</div>
      ${Array(6).fill('<div class="wl"></div>').join('')}
    </div>
    <div style="flex:1;">
      <div class="label">Schedule</div>
      <table>${['6', '8', '10', '12', '14', '16', '18', '20', '22'].map(h => `<tr><td style="width:10mm;color:${P.soft};font-size:7.5pt;border-bottom:none;height:8.4mm;" class="sans">${h}:00</td><td></td></tr>`).join('')}</table>
    </div>
  </div>
  <div style="display:flex;gap:5mm;margin-top:4mm;">
    <div class="box" style="flex:1;"><div class="hint">water ○○○○○○○○</div></div>
    <div class="box" style="flex:1;"><div class="hint">mood ◔ ◑ ◕ ● tonight's moon</div></div>
    <div class="box" style="flex:1.4;"><div class="hint">one good thing</div></div>
  </div>${foot('DAILY')}</div>`;
}
// 22 habit tracker
{
  let t = '<table><tr><th style="width:44mm;">Habit</th>' + Array.from({ length: 31 }, (_, i) => `<th style="text-align:center;padding:0;font-size:5.5pt;">${i + 1}</th>`).join('') + '</tr>';
  for (let r = 0; r < 10; r++) t += '<tr><td></td>' + Array(31).fill(`<td style="padding:0;text-align:center;"><span style="display:inline-block;width:3.2mm;height:3.2mm;border:0.4pt solid ${P.line};border-radius:50%;"></span></td>`).join('') + '</tr>';
  t += '</table>';
  pages += `<div class="page">${head('Habits', 'Habit tracker', 'fill a moon for every day the habit holds — aim for chains, not perfection')}${t}${foot('HABITS')}</div>`;
}
// 23 mood tracker
{
  let rows = '';
  for (let r = 0; r < 5; r++) {
    rows += '<div style="display:flex;justify-content:space-between;margin-bottom:6mm;">';
    for (let c = 0; c < 7; c++) {
      const d = r * 7 + c + 1;
      if (d <= 31) rows += `<div style="text-align:center;"><svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="17" fill="none" stroke="${P.line}" stroke-width="0.8"/></svg><div class="hint">${d}</div></div>`;
      else rows += '<div style="width:46px;"></div>';
    }
    rows += '</div>';
  }
  pages += `<div class="page">${head('Mood', 'A month of moons', 'shade each circle like a moon phase: new = heavy · full = light. Add a colour if the day had one.')}
  ${rows}<div class="box"><div class="hint">legend — write what your phases mean this month:</div><div class="wl"></div></div>${foot('MOOD')}</div>`;
}
// 24 water + 25 sleep
{
  let t = '<table><tr><th style="width:16mm;">Day</th>' + Array.from({ length: 8 }, (_, i) => `<th style="text-align:center;">${i + 1}</th>`).join('') + '<th style="width:34mm;">Felt like</th></tr>';
  for (let r = 1; r <= 31; r++) t += `<tr><td class="sans" style="font-size:7pt;color:${P.soft};height:6.8mm;">${r}</td>` + Array(8).fill(`<td style="text-align:center;padding:0;"><span style="display:inline-block;width:3.4mm;height:3.4mm;border:0.4pt solid ${P.gold};border-radius:1mm;"></span></td>`).join('') + '<td></td></tr>';
  t += '</table>';
  pages += `<div class="page">${head('Water', 'Water tracker', 'eight tides a day')}${t}${foot('WATER')}</div>`;
  let s = '<table><tr><th style="width:16mm;">Day</th>' + ['8pm', '9', '10', '11', '12', '1am', '2', '6', '7', '8', '9', '10'].map(h => `<th style="text-align:center;font-size:6pt;">${h}</th>`).join('') + '<th style="width:24mm;">Hours</th></tr>';
  for (let r = 1; r <= 31; r++) s += `<tr><td class="sans" style="font-size:7pt;color:${P.soft};height:6.8mm;">${r}</td>` + Array(12).fill(`<td style="padding:0;"><div style="height:4mm;border-left:0.3pt solid ${P.line};"></div></td>`).join('') + '<td></td></tr>';
  s += '</table>';
  pages += `<div class="page">${head('Sleep', 'Sleep tracker', 'shade the hours you slept — watch the dark band drift')}${s}${foot('SLEEP')}</div>`;
}
// 26 reading
pages += `<div class="page">${head('Reading', 'Reading tracker')}
  <table><tr><th>Title</th><th style="width:34mm;">Author</th><th style="width:22mm;">Finished</th><th style="width:30mm;">Rating</th></tr>
  ${Array(16).fill(`<tr><td></td><td></td><td></td><td class="sans" style="color:${P.goldSoft};letter-spacing:2px;">✦ ✦ ✦ ✦ ✦</td></tr>`).join('')}</table>
  ${foot('READING')}</div>`;
// 27-30 finance suite
pages += `<div class="page">${head('Finance', 'Finance overview', 'one honest page per month')}
  <div style="display:flex;gap:5mm;margin-bottom:5mm;">
  ${['Income', 'Fixed', 'Flexible', 'Saved'].map(k => `<div class="box" style="flex:1;text-align:center;"><div class="label">${k}</div><div style="height:10mm;"></div></div>`).join('')}</div>
  <table><tr><th>Money in</th><th style="width:30mm;">Expected</th><th style="width:30mm;">Actual</th></tr>${Array(5).fill('<tr><td></td><td></td><td></td></tr>').join('')}</table>
  <div style="height:5mm;"></div>
  <table><tr><th>Money out — the big rocks</th><th style="width:30mm;">Expected</th><th style="width:30mm;">Actual</th></tr>${Array(8).fill('<tr><td></td><td></td><td></td></tr>').join('')}</table>
  ${foot('FINANCE')}</div>`;
pages += `<div class="page">${head('Budget', 'Budget planner', 'give every pound a constellation to belong to')}
  <table><tr><th>Category</th><th style="width:26mm;">Planned</th><th style="width:26mm;">Spent</th><th style="width:26mm;">Left</th><th style="width:30mm;">Phase</th></tr>
  ${Array(14).fill(`<tr><td></td><td></td><td></td><td></td><td class="sans" style="color:${P.gold};font-size:8pt;">○ ◔ ◑ ◕ ●</td></tr>`).join('')}</table>
  ${foot('BUDGET')}</div>`;
{
  let moons = '';
  for (let i = 0; i < 10; i++) moons += `<div style="text-align:center;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="20" fill="none" stroke="${P.gold}" stroke-width="1.2"/></svg><div class="hint">${(i + 1) * 10}%</div></div>`;
  pages += `<div class="page">${head('Savings', 'Savings tracker', 'a lunar journey: shade one moon for every tenth of the goal')}
  <div class="box" style="margin-bottom:6mm;"><div class="label">Saving for</div><div class="wl"></div><div style="display:flex;gap:5mm;margin-top:3mm;"><div style="flex:1;"><div class="hint">goal amount</div><div class="wl"></div></div><div style="flex:1;"><div class="hint">by when</div><div class="wl"></div></div></div></div>
  <div style="display:flex;justify-content:space-between;margin-bottom:8mm;">${moons}</div>
  <table><tr><th style="width:26mm;">Date</th><th>Added</th><th style="width:30mm;">Amount</th><th style="width:34mm;">Total so far</th></tr>${Array(10).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('')}</table>
  ${foot('SAVINGS')}</div>`;
}
pages += `<div class="page">${head('Expenses', 'Expense log', 'small leaks sink starships')}
  <table><tr><th style="width:24mm;">Date</th><th>What</th><th style="width:28mm;">Category</th><th style="width:26mm;">Amount</th></tr>
  ${Array(22).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('')}</table>${foot('EXPENSES')}</div>`;
// 31 meals + 32 workout
pages += `<div class="page">${head('Meals', 'Meal planner')}
  <table><tr><th style="width:20mm;"></th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>
  ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<tr><td class="sans" style="font-size:8pt;color:${P.soft};height:13mm;">${d}</td><td></td><td></td><td></td></tr>`).join('')}</table>
  <div class="label" style="margin-top:5mm;">Grocery constellation</div>
  <div style="column-count:3;column-gap:6mm;margin-top:2mm;">${Array(12).fill('<div class="wl" style="height:7mm;"></div>').join('')}</div>
  ${foot('MEALS')}</div>`;
pages += `<div class="page">${head('Workouts', 'Workout planner', 'movement is a phase, not a punishment')}
  <table><tr><th style="width:20mm;"></th><th>Focus</th><th>Movement / sets</th><th style="width:24mm;">Done</th></tr>
  ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<tr><td class="sans" style="font-size:8pt;color:${P.soft};height:15mm;">${d}</td><td></td><td></td><td style="text-align:center;"><span style="display:inline-block;width:5mm;height:5mm;border:0.5pt solid ${P.gold};border-radius:50%;"></span></td></tr>`).join('')}</table>
  <div class="box" style="margin-top:5mm;"><div class="hint">how my body felt this week</div><div class="wl"></div><div class="wl"></div></div>
  ${foot('WORKOUTS')}</div>`;
// 33-34 gratitude x2, 35-36 reflection x2
for (let c = 0; c < 2; c++) pages += `<div class="page">${head('Gratitude', 'Small lights', 'three a day keeps the dark honest')}
  ${Array(7).fill(`<div style="display:flex;gap:4mm;align-items:flex-end;margin-bottom:4mm;"><svg width="18" height="18" viewBox="0 0 18 18">${SPARK(9, 9, 6, P.goldSoft)}</svg><div style="flex:1;"><div class="wl"></div><div class="wl"></div></div></div>`).join('')}
  ${foot('GRATITUDE')}</div>`;
for (let c = 0; c < 2; c++) pages += `<div class="page">${head('Reflection', 'Looking back to aim forward')}
  ${['What filled my sky this month', 'What I am proud of', 'What drained the light', 'What I will do differently', 'A sentence for my future self'].map(q => `<div style="margin-bottom:6mm;"><div class="label" style="letter-spacing:2px;color:${P.soft};">${q}</div><div class="wl"></div><div class="wl"></div></div>`).join('')}
  ${foot('REFLECTION')}</div>`;
// 37-38 notes lined + dot
pages += `<div class="page">${head('Notes', 'Lined')}${Array(24).fill('<div class="wl" style="height:9.5mm;"></div>').join('')}${foot('NOTES')}</div>`;
{
  let dots = '<svg width="100%" height="230mm" viewBox="0 0 178 230">';
  for (let y = 4; y < 230; y += 5) for (let x = 4; x < 178; x += 5) dots += `<circle cx="${x}" cy="${y}" r="0.28" fill="${P.line}"/>`;
  dots += '</svg>';
  pages += `<div class="page">${head('Notes', 'Dot grid')}${dots}${foot('NOTES')}</div>`;
}
// 39 closing
pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
  <svg width="90" height="24" viewBox="0 0 160 24">${[0, 0.25, 0.5, 0.75, 0].map((p, i) => MOON(20 + i * 30, 12, 8, p, P.goldSoft)).join('')}</svg>
  <div style="font-size:16pt;line-height:1.7;margin-top:8mm;">The moon never hurries<br>and is never late.</div>
  <div class="sans" style="letter-spacing:5px;font-size:8pt;color:${P.lav};margin-top:8mm;">M O O N M U S E &nbsp; S T U D I O</div>
</div>`;

fs.writeFileSync(path.join(OUT, 'moonmuse-ultimate-planner.html'), shell(pages));
console.log('planner html done');
