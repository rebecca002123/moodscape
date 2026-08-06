// MoonMuse 365 Journal (A5, ~450pp) and 365 Affirmation Cards (A4 sheets, fronts+backs).
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'mm-docs');
fs.mkdirSync(OUT, { recursive: true });
const { P } = require('./mm.js');
const { buildPrompts, buildAffirmations } = require('./mm-text.js');

const SPARK = (x, y, r, c = P.gold) => {
  const k = r * 0.18;
  return `<path d="M ${x} ${y - r} C ${x + k * 0.4} ${y - k} ${x + k} ${y - k * 0.4} ${x + r} ${y} C ${x + k} ${y + k * 0.4} ${x + k * 0.4} ${y + k} ${x} ${y + r} C ${x - k * 0.4} ${y + k} ${x - k} ${y + k * 0.4} ${x - r} ${y} C ${x - k} ${y - k * 0.4} ${x - k * 0.4} ${y - k} ${x} ${y - r} Z" fill="${c}"/>`;
};
const MOONP = (cx, cy, r, phase, c) => {
  const p = phase % 1; let inner = '';
  if (Math.abs(p - 0.5) < 0.06) inner = `<circle cx="${cx}" cy="${cy}" r="${r * 0.96}" fill="${c}"/>`;
  else if (p > 0.04 && p < 0.96) {
    const rx = Math.abs(Math.cos(p * 2 * Math.PI)) * r;
    const right = p < 0.5 ? 1 : 0;
    const sweepInner = (p < 0.25 || (p >= 0.5 && p < 0.75)) ? 1 - right : right;
    inner = `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 ${right} ${cx} ${cy + r} A ${rx.toFixed(1)} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z" fill="${c}"/>`;
  }
  return `${inner}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="1.4"/>`;
};

function shell(title, size, css, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: ${size}; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia,'DejaVu Serif',serif; color:${P.ink}; }
  .sans { font-family:'DejaVu Sans',Arial,sans-serif; }
  .label { font-family:'DejaVu Sans'; letter-spacing:3px; font-size:7.5pt; color:${P.gold}; text-transform:uppercase; }
  .hint { font-family:'DejaVu Sans'; font-size:7pt; color:${P.soft}; }
  ${css}
</style>${body}`;
}

// ================= JOURNAL =================
{
  const months = buildPrompts();
  const css = `.page { width:148mm; height:210mm; page-break-after:always; position:relative; background:${P.paper}; padding:16mm 14mm 12mm; }
  .page:last-child { page-break-after:auto; }
  .wl { border-bottom:0.35pt solid ${P.line}; height:8.2mm; }
  .foot { position:absolute; bottom:7mm; left:14mm; right:14mm; display:flex; justify-content:space-between; font-family:'DejaVu Sans'; font-size:6.5pt; letter-spacing:2px; color:${P.soft}; }`;
  let pages = '';
  let dayNo = 1;
  // cover
  pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="40" fill="none" stroke="${P.goldSoft}" stroke-width="1.4"/><path d="M 53 21 A 35 35 0 1 1 48 88 A 43 43 0 0 0 53 21 Z" fill="${P.goldSoft}"/>${SPARK(76, 34, 6.5, P.goldSoft)}</svg>
    <div style="font-size:27pt;margin:9mm 0 3mm;">365 Nights<br>of Ink</div>
    <div class="sans" style="letter-spacing:5px;font-size:8.5pt;color:${P.lav};">A YEAR OF JOURNAL PROMPTS</div>
    <div class="sans" style="letter-spacing:4px;font-size:7.5pt;color:${P.goldSoft};position:absolute;bottom:14mm;">M O O N M U S E &nbsp; S T U D I O</div>
  </div>`;
  // guide
  pages += `<div class="page"><div class="label">How to use this journal</div>
    <h1 style="font-size:19pt;font-weight:normal;margin:3mm 0 6mm;">One page a night.<br>No catching up, ever.</h1>
    <p style="font-size:10pt;line-height:1.8;margin-bottom:4mm;">There are 365 prompts here, gathered into twelve moons — one theme per month, from Beginnings to Renewal. Start any day of the year. If you miss a night, simply carry on; the pages do not keep score.</p>
    <p style="font-size:10pt;line-height:1.8;margin-bottom:4mm;">Every seventh page is a check-in, every month ends with a review, and the back of the book holds spaces for gratitude, dreams, and the things you are calling toward yourself.</p>
    <p style="font-size:10pt;line-height:1.8;">Write badly. Write briefly. Just write true.</p>
    <div class="foot"><span>MOONMUSE STUDIO</span><span>365 NIGHTS OF INK</span></div></div>`;
  months.forEach((m, mi) => {
    // divider
    pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
      <svg width="90" height="90" viewBox="0 0 90 90">${MOONP(45, 45, 32, m.theme.phase, P.goldSoft)}</svg>
      <div class="sans" style="letter-spacing:5px;font-size:8pt;color:${P.lav};margin-top:8mm;">MOON ${String(mi + 1).padStart(2, '0')}</div>
      <div style="font-size:24pt;margin-top:2mm;">${m.theme.name}</div></div>`;
    let sinceCheck = 0;
    m.prompts.forEach((prompt, pi) => {
      pages += `<div class="page">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div class="label">${m.theme.name}</div>
          <div class="hint">day ${dayNo} of 365</div>
        </div>
        <div style="font-size:12.5pt;line-height:1.55;margin:5mm 0 4mm;">${prompt}</div>
        <svg width="60" height="10" viewBox="0 0 60 10"><line x1="0" y1="5" x2="44" y2="5" stroke="${P.gold}" stroke-width="0.8"/>${SPARK(53, 5, 4)}</svg>
        <div style="margin-top:4mm;">${Array(14).fill('<div class="wl"></div>').join('')}</div>
        <div class="foot"><span>MOONMUSE STUDIO</span><span>${m.theme.name.toUpperCase()}</span></div>
      </div>`;
      dayNo++; sinceCheck++;
      if (sinceCheck === 7 && pi < m.prompts.length - 2) {
        sinceCheck = 0;
        pages += `<div class="page" style="background:${P.cream};">
          <div class="label">Weekly check-in</div>
          <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">Seven nights, one look back</h1>
          ${['The night that mattered most', 'A sentence I want to keep', 'What I need less of next week', 'What I need more of'].map(q => `<div style="margin-bottom:5mm;"><div class="hint" style="letter-spacing:1.5px;text-transform:uppercase;">${q}</div><div class="wl"></div><div class="wl"></div></div>`).join('')}
          <div class="foot"><span>MOONMUSE STUDIO</span><span>CHECK-IN</span></div></div>`;
      }
    });
    // monthly review
    pages += `<div class="page" style="background:${P.cream};">
      <div class="label">Monthly review — ${m.theme.name}</div>
      <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">Closing this moon</h1>
      ${['Three moments I want to remember', 'What this month taught me about ' + m.theme.noun, 'What I am carrying forward', 'What I am leaving here'].map(q => `<div style="margin-bottom:5mm;"><div class="hint" style="letter-spacing:1.5px;text-transform:uppercase;">${q}</div><div class="wl"></div><div class="wl"></div><div class="wl"></div></div>`).join('')}
      <div class="foot"><span>MOONMUSE STUDIO</span><span>REVIEW</span></div></div>`;
  });
  // back sections: gratitude x4, manifestation x4, dreams x6, year review x2
  for (let i = 0; i < 4; i++) pages += `<div class="page"><div class="label">Gratitude pages</div>
    <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">Small lights, kept</h1>
    ${Array(9).fill(`<div style="display:flex;gap:3mm;align-items:flex-end;margin-bottom:3mm;"><svg width="12" height="12" viewBox="0 0 12 12">${SPARK(6, 6, 4.5, P.goldSoft)}</svg><div class="wl" style="flex:1;"></div></div>`).join('')}
    <div class="foot"><span>MOONMUSE STUDIO</span><span>GRATITUDE</span></div></div>`;
  for (let i = 0; i < 4; i++) pages += `<div class="page"><div class="label">Manifestation pages</div>
    <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">Calling it in</h1>
    ${['What I want, said plainly', 'Why it matters (the honest why)', 'Who I become on the way there', 'The first thing I will do about it this week'].map(q => `<div style="margin-bottom:5mm;"><div class="hint" style="letter-spacing:1.5px;text-transform:uppercase;">${q}</div><div class="wl"></div><div class="wl"></div></div>`).join('')}
    <div class="foot"><span>MOONMUSE STUDIO</span><span>MANIFESTATION</span></div></div>`;
  for (let i = 0; i < 6; i++) pages += `<div class="page"><div class="label">Dream journal</div>
    <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">Night notes</h1>
    <div style="display:flex;gap:4mm;margin-bottom:4mm;"><div style="flex:1;"><div class="hint">DATE</div><div class="wl"></div></div><div style="flex:2;"><div class="hint">FEELING ON WAKING</div><div class="wl"></div></div></div>
    ${Array(11).fill('<div class="wl"></div>').join('')}
    <div style="margin-top:4mm;"><div class="hint">RECURRING SIGNS · PEOPLE · PLACES</div><div class="wl"></div></div>
    <div class="foot"><span>MOONMUSE STUDIO</span><span>DREAMS</span></div></div>`;
  for (let i = 0; i < 2; i++) pages += `<div class="page" style="background:${P.cream};"><div class="label">Year review — part ${i + 1}</div>
    <h1 style="font-size:17pt;font-weight:normal;margin:3mm 0 5mm;">${i === 0 ? 'The year, seen whole' : 'And what comes next'}</h1>
    ${(i === 0 ? ['The chapters this year actually had', 'The people who made it', 'The hardest phase, and how it passed', 'What I am proudest of'] : ['What I want more of next year', 'What ends here', 'One promise, renewed', 'A blessing for the year ahead, in my own words']).map(q => `<div style="margin-bottom:6mm;"><div class="hint" style="letter-spacing:1.5px;text-transform:uppercase;">${q}</div><div class="wl"></div><div class="wl"></div><div class="wl"></div></div>`).join('')}
    <div class="foot"><span>MOONMUSE STUDIO</span><span>YEAR REVIEW</span></div></div>`;
  pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <svg width="120" height="24" viewBox="0 0 200 24">${[0.05, 0.25, 0.5, 0.75, 0.95].map((p, i) => MOONP(24 + i * 38, 12, 9, p, P.goldSoft)).join('')}</svg>
    <div style="font-size:14pt;line-height:1.7;margin-top:8mm;">Three hundred and sixty-five nights,<br>and every one of them yours.</div>
    <div class="sans" style="letter-spacing:4px;font-size:7.5pt;color:${P.lav};margin-top:7mm;">M O O N M U S E &nbsp; S T U D I O</div></div>`;
  fs.writeFileSync(path.join(OUT, 'moonmuse-365-journal.html'), shell('MoonMuse 365 Nights of Ink', '148mm 210mm', css, pages));
  console.log('journal html done');
}

// ================= AFFIRMATION CARDS =================
{
  const months = buildAffirmations();
  const css = `.page { width:210mm; height:297mm; page-break-after:always; position:relative; background:${P.white}; padding:12mm 10mm; }
  .page:last-child { page-break-after:auto; }
  .sheet { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr 1fr; gap:5mm; height:100%; }
  .card { border:0.4pt dashed ${P.line}; border-radius:5mm; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:8mm; background:${P.paper}; }
  .cardback { background:${P.navy}; }`;
  let pages = '';
  // cover page
  pages += `<div class="page" style="background:${P.navy};color:${P.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="${P.goldSoft}" stroke-width="1.5"/>${SPARK(60, 60, 16, P.goldSoft)}</svg>
    <div style="font-size:30pt;margin:9mm 0 3mm;">365 Days of Light</div>
    <div class="sans" style="letter-spacing:5px;font-size:9pt;color:${P.lav};">AFFIRMATION CARDS · PRINT &amp; CUT</div>
    <div class="sans" style="font-size:8.5pt;color:#9aa3c8;margin-top:10mm;max-width:120mm;line-height:1.8;">Print fronts and backs double-sided (flip on long edge), cut along the dashed lines, and keep the deck where mornings happen. Six cards per sheet, twelve monthly themes, one card per day of the year.</div>
    <div class="sans" style="letter-spacing:4px;font-size:8pt;color:${P.goldSoft};position:absolute;bottom:14mm;">M O O N M U S E &nbsp; S T U D I O</div></div>`;
  let cardNo = 1;
  months.forEach((m, mi) => {
    for (let i = 0; i < m.items.length; i += 6) {
      const chunk = m.items.slice(i, i + 6);
      // fronts
      pages += `<div class="page"><div class="sheet">` + chunk.map((a, j) => `
        <div class="card">
          <svg width="26" height="26" viewBox="0 0 26 26">${MOONP(13, 13, 9, m.theme.phase, P.gold)}</svg>
          <div style="font-size:12pt;line-height:1.55;margin:5mm 0;">${a}</div>
          <div class="sans" style="letter-spacing:2.5px;font-size:6pt;color:${P.soft};">DAY ${cardNo + j} · ${m.theme.name.toUpperCase()}</div>
        </div>`).join('') + (chunk.length < 6 ? Array(6 - chunk.length).fill('<div></div>').join('') : '') + `</div></div>`;
      // backs (mirrored order for duplex: reverse each row of 2)
      const backOrder = [];
      for (let r = 0; r < 3; r++) { const row = chunk.slice(r * 2, r * 2 + 2); backOrder.push(...row.reverse()); }
      pages += `<div class="page"><div class="sheet">` + backOrder.map(() => `
        <div class="card cardback">
          <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="16" fill="none" stroke="${P.goldSoft}" stroke-width="1.2"/><path d="M 21 8 A 13 13 0 1 1 19 33 A 16 16 0 0 0 21 8 Z" fill="${P.goldSoft}"/>${SPARK(30, 13, 3.5, P.goldSoft)}</svg>
          <div class="sans" style="letter-spacing:3px;font-size:6.5pt;color:${P.lav};margin-top:4mm;">MOONMUSE STUDIO</div>
        </div>`).join('') + (backOrder.length < 6 ? Array(6 - backOrder.length).fill('<div></div>').join('') : '') + `</div></div>`;
      cardNo += chunk.length;
    }
  });
  fs.writeFileSync(path.join(OUT, 'moonmuse-affirmation-cards.html'), shell('MoonMuse 365 Days of Light', '210mm 297mm', css, pages));
  console.log('cards html done, cards:', cardNo - 1);
}
