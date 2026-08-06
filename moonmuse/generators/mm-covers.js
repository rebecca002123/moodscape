// Product cover images for the MoonMuse Shopify listings (1600x1600).
const M = require('./mm.js');
const { P, sparkle, crescent, moonPhase, dotStars, constellation, sky, page, iconOnly } = M;

const S = 1600;
function cover(name, title, sub, art, dark = false) {
  page(`cover-${name}`, S, S, `${sky(S, S, dark ? 'dark' : 'light', 'cv' + name)}
    ${dotStars(dark ? 90 : 45, S, S, name.length * 7, dark ? '#C9D0EE' : P.gold, 1.5, dark ? 0.5 : 0.3)}${art}`,
    `<div style="position:absolute;top:110px;width:100%;text-align:center;">
      <div class="sans" style="letter-spacing:10px;font-size:26px;color:${dark ? P.lav : P.gold};">M O O N M U S E &nbsp; S T U D I O</div>
      <div style="font-size:74px;color:${dark ? P.cream : P.ink};margin-top:20px;line-height:1.15;">${title}</div>
    </div>
    <div class="sans" style="position:absolute;bottom:110px;width:100%;text-align:center;font-size:27px;color:${dark ? '#B9C0DE' : P.soft};">${sub}</div>`);
}
const card = (x, y, w, h, rot, inner) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>${inner}</g>`;

cover('planner', 'The Ultimate<br>Digital Planner', '39 pages · 21 sections · undated · A4 PDF',
  card(560, 500, 480, 660, 0, `${moonPhase(800, 700, 80, 0.72, P.gold, P.goldFaint, 2.2)}
  <text x="800" y="860" text-anchor="middle" font-family="Georgia" font-size="40" fill="${P.ink}">Plan by moonlight</text>
  ${[0, 1, 2].map(i => `<line x1="650" y1="${950 + i * 46}" x2="950" y2="${950 + i * 46}" stroke="${P.line}" stroke-width="2"/>`).join('')}`)
  + card(380, 560, 300, 420, -9, `${sparkle(530, 720, 30, P.gold)}`) + card(920, 580, 300, 420, 8, `${crescent(1070, 760, 56, P.gold)}`));
cover('stickers', '600 Celestial<br>Stickers', 'GoodNotes-ready · transparent PNG · 6 pastel palettes',
  [['#D9B978', 480, 620], ['#C3B8EC', 660, 560], ['#EFC3CB', 840, 620], ['#BFD4B9', 1020, 560], ['#B8D3EA', 660, 800], ['#4A5480', 840, 860]].map(([c, x, y], i) =>
    i % 2 ? `<circle cx="${x}" cy="${y}" r="70" fill="none" stroke="${c}" stroke-width="8"/>` + sparkle(x, y, 36, c)
      : crescent(x, y + 60, 64, c)).join('')
  + `<rect x="560" y="960" width="220" height="90" rx="45" fill="#E9E4F9" stroke="#C3B8EC" stroke-width="5"/><text x="670" y="1015" text-anchor="middle" font-family="'DejaVu Sans'" font-size="34" letter-spacing="4" fill="#6F63A8">TODAY</text>
  <rect x="820" y="960" width="220" height="90" rx="20" fill="#D9B978"/><text x="930" y="1015" text-anchor="middle" font-family="'DejaVu Sans'" font-size="34" letter-spacing="4" fill="#fff">GOALS</text>`);
cover('phone-wallpapers', '200 Phone<br>Wallpapers', '50 designs · lock + home · dark + light · 1290×2796', (() => {
  const ph = (x, y, rot, dark2) => `<g transform="rotate(${rot} ${x + 130} ${y + 280})">
    <rect x="${x}" y="${y}" width="260" height="560" rx="40" fill="${dark2 ? P.navy : P.paper}" stroke="${dark2 ? P.lineDark : P.line}" stroke-width="3"/>
    ${crescent(x + 130, y + 260, 48, dark2 ? P.goldSoft : P.gold)}${sparkle(x + 190, y + 160, 16, P.lav)}</g>`;
  return ph(420, 500, -8, true) + ph(950, 500, 8, false) + ph(680, 460, 0, true);
})(), true);
cover('desktop-wallpapers', 'Desktop<br>Wallpapers', 'MacBook · Windows · Ultrawide · iPad — light & dark',
  `<rect x="440" y="540" width="720" height="440" rx="20" fill="${P.navy}" stroke="${P.lineDark}" stroke-width="3"/>
  ${moonPhase(800, 700, 70, 0.72, P.goldSoft, P.goldSoft, 2.4)}${dotStars(40, 680, 400, 3, '#C9D0EE', 1.6, 0.6).replace(/<circle /g, '<circle transform="translate(460,560)" ')}
  <rect x="740" y="980" width="120" height="16" rx="8" fill="${P.line}"/><rect x="640" y="996" width="320" height="14" rx="7" fill="${P.line}"/>
  <rect x="1080" y="700" width="240" height="330" rx="24" fill="${P.paper}" stroke="${P.line}" stroke-width="3"/>${crescent(1200, 840, 40, P.gold)}`);
cover('wall-art', 'Printable<br>Wall Art', '6 designs · 2:3 · 3:4 · 4:5 · A4 · A3 — print-shop ready',
  `<rect x="470" y="500" width="330" height="470" fill="${P.white}" stroke="${P.line}" stroke-width="3"/>
  ${[0, 1, 2, 3].map(i => moonPhase(635, 580 + i * 100, 34, [0.05, 0.25, 0.5, 0.75][i], P.gold, P.gold, 2)).join('')}
  <rect x="850, " y="500" width="330" height="470" fill="${P.white}" stroke="${P.line}" stroke-width="3"/>
  <rect x="850" y="500" width="330" height="470" fill="${P.white}" stroke="${P.line}" stroke-width="3"/>
  ${constellation(890, 600, 250, 200, 5, P.navy, 6, 5, 2)}
  <text x="1015" y="920" text-anchor="middle" font-family="'DejaVu Sans'" font-size="16" letter-spacing="5" fill="${P.soft}">C O N S T E L L A T I O N</text>`);
cover('notion', 'Notion<br>Life OS', 'complete dashboard build guide + 12 matching icons',
  `${[['home', 560, 620], ['goals', 800, 620], ['journal', 1040, 620]].map(([n, x, y], i) => `<circle cx="${x}" cy="${y}" r="90" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>`).join('')}
  ${crescent(560, 620, 44, P.gold)}
  <circle cx="800" cy="620" r="40" fill="none" stroke="${P.gold}" stroke-width="6"/><circle cx="800" cy="620" r="22" fill="none" stroke="${P.gold}" stroke-width="6"/><circle cx="800" cy="620" r="7" fill="${P.gold}"/>
  <rect x="1006" y="580" width="70" height="84" rx="10" fill="none" stroke="${P.gold}" stroke-width="6"/><line x1="1024" y1="580" x2="1024" y2="664" stroke="${P.gold}" stroke-width="4"/>
  <rect x="480" y="800" width="640" height="200" rx="24" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <text x="800" y="880" text-anchor="middle" font-family="Georgia" font-size="36" fill="${P.ink}">✦ Today · Goals · Finance</text>
  <text x="800" y="940" text-anchor="middle" font-family="'DejaVu Sans'" font-size="20" letter-spacing="3" fill="${P.soft}">ELEVEN QUIET PAGES, ONE SYSTEM</text>`);
cover('canva-kit', 'Canva Social<br>Media Kit', '18 templates · posts · stories · pins · covers · thumbnails',
  card(440, 520, 340, 340, -6, `${sparkle(610, 660, 40, P.gold)}<text x="610" y="790" text-anchor="middle" font-family="Georgia" font-size="28" fill="${P.ink}">Post</text>`)
  + card(690, 480, 260, 460, 0, `${crescent(820, 640, 44, P.gold)}<text x="820" y="850" text-anchor="middle" font-family="Georgia" font-size="28" fill="${P.ink}">Story</text>`)
  + card(1000, 540, 300, 400, 7, `${moonPhase(1150, 680, 50, 0.72, P.gold, P.goldFaint, 2)}<text x="1150" y="860" text-anchor="middle" font-family="Georgia" font-size="28" fill="${P.ink}">Pin</text>`));
cover('journal', '365 Nights<br>of Ink', 'a year of prompts · 455-page printable journal · A5',
  card(600, 500, 400, 560, 0, `<circle cx="800" cy="680" r="70" fill="none" stroke="${P.gold}" stroke-width="3"/>
  <path d="M 795 615 A 62 62 0 1 0 788 740 A 74 74 0 0 1 795 615 Z" fill="${P.gold}"/>
  <text x="800" y="850" text-anchor="middle" font-family="Georgia" font-size="38" fill="${P.ink}">365 Nights of Ink</text>
  <text x="800" y="905" text-anchor="middle" font-family="'DejaVu Sans'" font-size="19" letter-spacing="4" fill="${P.soft}">ONE PAGE A NIGHT</text>`)
  + sparkle(520, 560, 26, P.gold) + sparkle(1090, 940, 30, '#9A8FD0'), true);
cover('cards', '365 Days<br>of Light', 'affirmation cards · print & cut · fronts + backs',
  card(480, 560, 320, 400, -8, `${sparkle(640, 700, 34, P.gold)}<text x="640" y="830" text-anchor="middle" font-family="Georgia" font-size="24" fill="${P.ink}">I am allowed to</text><text x="640" y="864" text-anchor="middle" font-family="Georgia" font-size="24" fill="${P.ink}">start small.</text>`)
  + card(800, 540, 320, 400, 6, `${moonPhase(960, 690, 44, 0.5, P.gold, P.goldFaint, 2)}<text x="960" y="820" text-anchor="middle" font-family="Georgia" font-size="24" fill="${P.ink}">Enough is a feast</text><text x="960" y="854" text-anchor="middle" font-family="Georgia" font-size="24" fill="${P.ink}">when I notice it.</text>`));
cover('bundle', 'The Everything<br>Bundle', 'all nine products · every file · save 60%',
  `${iconOnly(800, 760, 7.5, P.goldSoft)}
  ${constellation(360, 1020, 880, 120, 9, P.goldSoft, 7, 4, 1.5)}`, true);
console.log('covers done');
