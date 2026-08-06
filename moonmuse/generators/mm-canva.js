// MoonMuse Canva Social Media Kit (18 native-size templates) + Notion icon set (12).
const M = require('./mm.js');
const { P, sparkle, crescent, moonPhase, dotStars, constellation, sky, logo, iconOnly, page } = M;

const wm = (x, y, dark, size = 22) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'DejaVu Sans'" font-size="${size}" letter-spacing="8" fill="${dark ? P.lav : P.gold}">M O O N M U S E</text>`;

// --- Instagram posts (1080x1080) x3
page('cv-igpost-quote', 1080, 1080, `${sky(1080, 1080, 'dark', 'c1')}${dotStars(90, 1080, 1080, 41, '#C9D0EE', 1.5, 0.5)}
  ${moonPhase(540, 300, 90, 0.72, P.goldSoft, P.goldSoft, 2.6)}`,
  `<div style="position:absolute;top:460px;width:100%;text-align:center;padding:0 110px;">
    <div style="font-size:64px;color:${P.cream};line-height:1.3;">Your quote goes<br>right here.</div>
    <div class="sans" style="font-size:22px;color:${P.lav};margin-top:34px;letter-spacing:6px;">SWAP THIS LINE FOR A CAPTION</div>
  </div>
  <div class="sans" style="position:absolute;bottom:70px;width:100%;text-align:center;letter-spacing:8px;font-size:22px;color:${P.lav};">M O O N M U S E</div>`);
page('cv-igpost-product', 1080, 1080, `${sky(1080, 1080, 'light', 'c2')}${dotStars(40, 1080, 500, 43, P.gold, 1.3, 0.3)}
  <rect x="290" y="240" width="500" height="620" rx="28" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  ${moonPhase(540, 430, 80, 0.5, P.gold, P.goldFaint, 2.2)}
  <text x="540" y="600" text-anchor="middle" font-family="Georgia" font-size="40" fill="${P.ink}">Product name</text>
  <text x="540" y="650" text-anchor="middle" font-family="'DejaVu Sans'" font-size="20" letter-spacing="4" fill="${P.soft}">REPLACE WITH YOUR MOCKUP</text>`,
  `<div style="position:absolute;top:100px;width:100%;text-align:center;">
    <div class="sans" style="letter-spacing:8px;font-size:22px;color:${P.gold};">NEW IN THE SHOP</div>
  </div>
  <div class="sans" style="position:absolute;bottom:80px;width:100%;text-align:center;font-size:24px;color:${P.soft};">yourstore.com · link in bio</div>`);
page('cv-igpost-carousel', 1080, 1080, `${sky(1080, 1080, 'light', 'c3')}
  ${constellation(160, 700, 760, 180, 45, P.gold, 6, 4, 1.4)}`,
  `<div style="position:absolute;top:150px;left:120px;right:120px;">
    <div class="sans" style="letter-spacing:6px;font-size:20px;color:${P.gold};">01 / TIP</div>
    <div style="font-size:70px;color:${P.ink};margin-top:26px;line-height:1.25;">Headline for a<br>carousel slide</div>
    <div class="sans" style="font-size:26px;color:${P.soft};margin-top:30px;line-height:1.6;">Body copy placeholder — keep it to two calm sentences per slide.</div>
  </div>`);
// --- IG stories x2
page('cv-story-launch', 1080, 1920, `${sky(1080, 1920, 'dark', 'c4')}${dotStars(130, 1080, 1920, 47, '#C9D0EE', 1.6, 0.55)}
  ${moonPhase(540, 500, 120, 0.25, P.goldSoft, P.goldSoft, 2.8)}`,
  `<div style="position:absolute;top:760px;width:100%;text-align:center;padding:0 120px;">
    <div class="sans" style="letter-spacing:8px;font-size:24px;color:${P.lav};">LAUNCHING SOON</div>
    <div style="font-size:76px;color:${P.cream};margin-top:30px;line-height:1.2;">Your launch<br>headline</div>
    <div style="margin-top:60px;"><span class="sans" style="background:${P.goldSoft};color:${P.navy};font-size:28px;padding:20px 48px;border-radius:999px;">Swipe up / tap link</span></div>
  </div>
  <div class="sans" style="position:absolute;bottom:100px;width:100%;text-align:center;letter-spacing:8px;font-size:22px;color:${P.lav};">M O O N M U S E</div>`);
page('cv-story-testimonial', 1080, 1920, `${sky(1080, 1920, 'light', 'c5')}${dotStars(50, 1080, 800, 49, P.gold, 1.4, 0.3)}
  <rect x="120" y="560" width="840" height="700" rx="36" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  ${sparkle(540, 660, 26, P.gold)}`,
  `<div style="position:absolute;top:730px;width:100%;text-align:center;padding:0 190px;">
    <div style="font-size:44px;color:${P.ink};line-height:1.45;font-style:italic;">“Paste a lovely customer quote here — two lines is plenty.”</div>
    <div class="sans" style="font-size:22px;color:${P.soft};margin-top:40px;letter-spacing:4px;">— CUSTOMER NAME</div>
  </div>`);
// --- Pinterest pins x2
page('cv-pin-product', 1000, 1500, `${sky(1000, 1500, 'light', 'c6')}
  <rect x="150" y="220" width="700" height="820" rx="30" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  ${moonPhase(500, 500, 110, 0.72, P.gold, P.goldFaint, 2.4)}
  <text x="500" y="740" text-anchor="middle" font-family="Georgia" font-size="46" fill="${P.ink}">Pin title area</text>
  <text x="500" y="800" text-anchor="middle" font-family="'DejaVu Sans'" font-size="22" letter-spacing="3" fill="${P.soft}">REPLACE WITH PRODUCT SHOT</text>`,
  `<div style="position:absolute;bottom:220px;width:100%;text-align:center;">
    <span class="sans" style="background:${P.navy};color:${P.cream};font-size:26px;padding:18px 44px;border-radius:999px;">yourstore.com</span>
  </div>
  <div class="sans" style="position:absolute;bottom:90px;width:100%;text-align:center;letter-spacing:8px;font-size:20px;color:${P.gold};">M O O N M U S E</div>`);
page('cv-pin-list', 1000, 1500, `${sky(1000, 1500, 'dark', 'c7')}${dotStars(90, 1000, 1500, 51, '#C9D0EE', 1.5, 0.5)}
  ${crescent(500, 260, 90, P.goldSoft)}`,
  `<div style="position:absolute;top:420px;width:100%;padding:0 130px;">
    <div style="font-size:64px;color:${P.cream};text-align:center;line-height:1.25;">5 ways to<br>use this pin</div>
    ${[1, 2, 3, 4, 5].map(i => `<div class="sans" style="display:flex;gap:24px;align-items:center;margin-top:44px;"><span style="min-width:52px;height:52px;border:2px solid ${P.goldSoft};border-radius:50%;color:${P.goldSoft};display:inline-flex;align-items:center;justify-content:center;font-size:24px;">${i}</span><span style="font-size:26px;color:#C9D0EE;">List item placeholder text</span></div>`).join('')}
  </div>`);
// --- TikTok cover
page('cv-tiktok-cover', 1080, 1920, `${sky(1080, 1920, 'dark', 'c8')}${dotStars(120, 1080, 1920, 53, '#C9D0EE', 1.6, 0.5)}
  ${constellation(200, 1400, 680, 200, 55, P.goldSoft, 6, 4, 1.4)}`,
  `<div style="position:absolute;top:44%;width:100%;text-align:center;padding:0 100px;transform:translateY(-50%);">
    <div style="font-size:92px;color:${P.cream};line-height:1.15;">BIG HOOK<br>TEXT HERE</div>
  </div>
  <div class="sans" style="position:absolute;bottom:120px;width:100%;text-align:center;letter-spacing:8px;font-size:24px;color:${P.lav};">@ Y O U R H A N D L E</div>`);
// --- YouTube thumbnails x2
page('cv-yt-thumb-dark', 1280, 720, `${sky(1280, 720, 'dark', 'c9')}${dotStars(70, 1280, 720, 57, '#C9D0EE', 1.5, 0.5)}
  ${moonPhase(1050, 200, 95, 0.72, P.goldSoft, P.goldSoft, 2.6)}`,
  `<div style="position:absolute;left:90px;top:50%;transform:translateY(-50%);">
    <div class="sans" style="letter-spacing:6px;font-size:20px;color:${P.lav};">EPISODE 01</div>
    <div style="font-size:78px;color:${P.cream};margin-top:16px;line-height:1.15;">Video title,<br>two lines max</div>
  </div>`);
page('cv-yt-thumb-light', 1280, 720, `${sky(1280, 720, 'light', 'c10')}
  <rect x="820" y="120" width="360" height="480" rx="24" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  ${sparkle(1000, 300, 40, P.gold)}
  <text x="1000" y="450" text-anchor="middle" font-family="'DejaVu Sans'" font-size="18" letter-spacing="3" fill="${P.soft}">IMAGE AREA</text>`,
  `<div style="position:absolute;left:90px;top:50%;transform:translateY(-50%);">
    <div style="font-size:72px;color:${P.ink};line-height:1.18;">A calmer kind<br>of tutorial</div>
    <div class="sans" style="font-size:24px;color:${P.soft};margin-top:22px;">Subtitle placeholder</div>
  </div>`);
// --- Highlight covers x6
const HL = [['planner', c => `<rect x="-70" y="-90" width="140" height="180" rx="20" fill="none" stroke="${c}" stroke-width="7"/><line x1="-40" y1="-30" x2="40" y2="-30" stroke="${c}" stroke-width="7" stroke-linecap="round"/><line x1="-40" y1="10" x2="40" y2="10" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`],
  ['moon', c => crescent(0, 0, 80, c)],
  ['shop', c => `<path d="M -70 -40 h 140 l -14 120 h -112 Z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><path d="M -34 -40 a 34 34 0 0 1 68 0" fill="none" stroke="${c}" stroke-width="7"/>`],
  ['reviews', c => sparkle(0, 0, 70, c)],
  ['faq', c => `<text y="38" text-anchor="middle" font-family="Georgia" font-size="130" fill="${c}">?</text>`],
  ['about', c => `<circle cy="-30" r="34" fill="none" stroke="${c}" stroke-width="7"/><path d="M -60 80 a 60 60 0 0 1 120 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`]];
HL.forEach(([name, fn]) => page(`cv-highlight-${name}`, 1080, 1080, `${sky(1080, 1080, 'dark', 'ch' + name)}${dotStars(40, 1080, 1080, 61, '#C9D0EE', 1.4, 0.4)}
  <circle cx="540" cy="540" r="330" fill="none" stroke="${P.goldSoft}" stroke-width="3" opacity="0.6"/>
  <g transform="translate(540,540)">${fn(P.goldSoft)}</g>`));
// --- story backgrounds x2
page('cv-storybg-dark', 1080, 1920, `${sky(1080, 1920, 'dark', 'c11')}${dotStars(140, 1080, 1920, 63, '#C9D0EE', 1.6, 0.5)}${crescent(880, 220, 70, P.goldSoft)}`);
page('cv-storybg-light', 1080, 1920, `${sky(1080, 1920, 'light', 'c12')}${dotStars(60, 1080, 1920, 65, P.gold, 1.4, 0.3)}${sparkle(880, 240, 30, P.gold)}${sparkle(160, 1700, 24, '#9A8FD0')}`);

// --- Notion icon set (12, 560px, cream circle on transparent)
const NI = [
  ['home', c => crescent(0, 0, 60, c)],
  ['daily', c => sparkle(0, 0, 62, c)],
  ['goals', c => `<circle r="58" fill="none" stroke="${c}" stroke-width="7"/><circle r="34" fill="none" stroke="${c}" stroke-width="7"/><circle r="10" fill="${c}"/>`],
  ['projects', c => `<rect x="-58" y="-44" width="116" height="96" rx="16" fill="none" stroke="${c}" stroke-width="7"/><path d="M -58 -44 v -10 a 14 14 0 0 1 14 -14 h 30 l 14 16" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>`],
  ['finance', c => `<text y="42" text-anchor="middle" font-family="Georgia" font-size="130" fill="${c}">£</text>`],
  ['reading', c => `<path d="M 0 -50 q -34 -16 -62 -6 v 96 q 28 -10 62 6 q 34 -16 62 -6 v -96 q -28 -10 -62 6 Z M 0 -50 v 96" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>`],
  ['movies', c => `<rect x="-62" y="-46" width="124" height="92" rx="14" fill="none" stroke="${c}" stroke-width="7"/><path d="M -18 -20 l 44 24 l -44 24 Z" fill="${c}"/>`],
  ['travel', c => `<path d="M 0 -62 c 30 34 46 56 46 78 a 46 46 0 0 1 -92 0 c 0 -22 16 -44 46 -78 Z" fill="none" stroke="${c}" stroke-width="7" transform="rotate(40)"/>`],
  ['wishlist', c => `<path d="M 0 52 C -52 16 -60 -14 -44 -32 a 28 28 0 0 1 44 4 a 28 28 0 0 1 44 -4 c 16 18 8 48 -44 84 Z" fill="none" stroke="${c}" stroke-width="7"/>`],
  ['journal', c => `<rect x="-52" y="-62" width="104" height="124" rx="14" fill="none" stroke="${c}" stroke-width="7"/><line x1="-24" y1="-62" x2="-24" y2="62" stroke="${c}" stroke-width="5"/>`],
  ['habits', c => `<path d="M -54 10 L -16 44 L 54 -36" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`],
  ['calendar', c => `<rect x="-58" y="-46" width="116" height="100" rx="16" fill="none" stroke="${c}" stroke-width="7"/><line x1="-58" y1="-16" x2="58" y2="-16" stroke="${c}" stroke-width="7"/><line x1="-30" y1="-60" x2="-30" y2="-38" stroke="${c}" stroke-width="7" stroke-linecap="round"/><line x1="30" y1="-60" x2="30" y2="-38" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`],
];
NI.forEach(([name, fn]) => page(`ni-${name}`, 560, 560, `<circle cx="280" cy="280" r="264" fill="${P.cream}"/><g transform="translate(280,280)">${fn(P.gold)}</g>`, '', 'transparent'));
console.log('canva + notion pages done');
