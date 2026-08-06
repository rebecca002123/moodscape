// MoonMuse Studio brand assets: logos, icon, favicon, palette & type sheets,
// hero/banners, store icons, mockup. Guidelines PDF handled in mm-guidelines.js.
const M = require('./mm.js');
const { P, sparkle, crescent, moonPhase, dotStars, constellation, ringedPlanet, sunMark, sky, logo, iconOnly, page } = M;

// --- logo lockups ---
page('brand-logo-light', 2400, 1400, `${sky(2400, 1400, 'light', 'g1')}
  ${dotStars(40, 2400, 700, 5, P.gold, 1.4, 0.35)}
  ${logo(860, 700, 3.2)}`, '', P.cream);
page('brand-logo-dark', 2400, 1400, `${sky(2400, 1400, 'dark', 'g2')}
  ${dotStars(70, 2400, 900, 6, P.goldSoft, 1.4, 0.5)}
  ${logo(860, 700, 3.2, true)}`, '', P.navy);
page('brand-logo-stacked', 1600, 1600, `${sky(1600, 1600, 'light', 'g3')}
  ${iconOnly(800, 620, 4.4)}
  <text x="800" y="960" text-anchor="middle" font-family="Georgia" font-size="86" letter-spacing="22" fill="${P.ink}">MOONMUSE</text>
  <text x="800" y="1040" text-anchor="middle" font-family="'DejaVu Sans'" font-size="30" letter-spacing="26" fill="${P.soft}">S T U D I O</text>`);
// --- icons & favicon ---
page('brand-icon-navy', 1024, 1024, `<rect width="1024" height="1024" rx="228" fill="${P.navy}"/>
  ${dotStars(24, 1024, 1024, 9, P.goldSoft, 1.6, 0.4)}
  ${iconOnly(512, 512, 9, P.goldSoft)}`);
page('brand-icon-cream', 1024, 1024, `<rect width="1024" height="1024" rx="228" fill="${P.cream}"/>
  ${iconOnly(512, 512, 9, P.gold)}`);
page('brand-favicon', 256, 256, `<rect width="256" height="256" rx="60" fill="${P.navy}"/>
  ${crescent(122, 128, 62, P.goldSoft)}${sparkle(186, 84, 18, P.goldSoft)}`);
// --- palette sheet ---
{
  const sw = (x, y, hex, name, dark) => `<rect x="${x}" y="${y}" width="300" height="220" rx="24" fill="${hex}" stroke="${P.line}" stroke-width="${hex === P.white || hex === P.paper ? 1 : 0}"/>
    <text x="${x + 24}" y="${y + 268}" font-family="'DejaVu Sans'" font-size="22" fill="${P.ink}">${name}</text>
    <text x="${x + 24}" y="${y + 298}" font-family="'DejaVu Sans'" font-size="19" fill="${P.soft}">${hex}</text>`;
  page('brand-palette', 1600, 2000, `<rect width="1600" height="2000" fill="${P.paper}"/>
    ${logo(120, 130, 1.6)}
    <text x="120" y="290" font-family="Georgia" font-size="52" fill="${P.ink}">Colour</text>
    <text x="120" y="336" font-family="'DejaVu Sans'" font-size="20" fill="${P.soft}">A quiet sky: cream days, navy nights, gold light, lavender air.</text>
    ${sw(120, 420, P.navy, 'Midnight Navy', 1)} ${sw(480, 420, P.navy2, 'Deep Night', 1)} ${sw(840, 420, P.navy3, 'Twilight', 1)} ${sw(1200, 420, P.ink, 'Ink', 1)}
    ${sw(120, 780, P.gold, 'Warm Gold')} ${sw(480, 780, P.goldSoft, 'Soft Gold')} ${sw(840, 780, P.goldFaint, 'Faint Gold')} ${sw(1200, 780, P.soft, 'Slate')}
    ${sw(120, 1140, P.lav, 'Lavender')} ${sw(480, 1140, P.lavSoft, 'Soft Lavender')} ${sw(840, 1140, P.lavFaint, 'Faint Lavender')} ${sw(1200, 1140, P.line, 'Hairline')}
    ${sw(120, 1500, P.cream, 'Soft Cream')} ${sw(480, 1500, P.paper, 'Paper')} ${sw(840, 1500, P.white, 'White')}
    <text x="120" y="1930" font-family="'DejaVu Sans'" font-size="18" fill="${P.soft}">Ratio guide — 60% cream/paper · 25% navy · 10% gold · 5% lavender. Gold is light, never paint.</text>`);
}
// --- typography sheet ---
page('brand-typography', 1600, 2000, `<rect width="1600" height="2000" fill="${P.paper}"/>
  ${logo(120, 130, 1.6)}
  <text x="120" y="290" font-family="Georgia" font-size="52" fill="${P.ink}">Typography</text>
  <line x1="120" y1="360" x2="1480" y2="360" stroke="${P.line}" stroke-width="1"/>
  <text x="120" y="470" font-family="Georgia" font-size="30" fill="${P.gold}">Display — Serif (Georgia / Playfair Display)</text>
  <text x="120" y="600" font-family="Georgia" font-size="88" fill="${P.ink}">Plan by moonlight.</text>
  <text x="120" y="700" font-family="Georgia" font-size="42" fill="${P.soft}" font-style="italic">Quiet luxury, generous whitespace.</text>
  <line x1="120" y1="800" x2="1480" y2="800" stroke="${P.line}" stroke-width="1"/>
  <text x="120" y="900" font-family="Georgia" font-size="30" fill="${P.gold}">Body &amp; UI — Sans (DejaVu Sans / Inter)</text>
  <text x="120" y="990" font-family="'DejaVu Sans'" font-size="30" fill="${P.ink}">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp</text>
  <text x="120" y="1050" font-family="'DejaVu Sans'" font-size="22" fill="${P.soft}">Body copy sits at 16–18px with 1.7 line height. Never bold headlines; let size and space carry weight.</text>
  <line x1="120" y1="1140" x2="1480" y2="1140" stroke="${P.line}" stroke-width="1"/>
  <text x="120" y="1240" font-family="Georgia" font-size="30" fill="${P.gold}">Labels — letterspaced caps</text>
  <text x="120" y="1330" font-family="'DejaVu Sans'" font-size="26" letter-spacing="10" fill="${P.ink}">M O N T H L Y &nbsp; R E V I E W</text>
  <text x="120" y="1400" font-family="'DejaVu Sans'" font-size="18" letter-spacing="6" fill="${P.soft}">SMALL LABELS AT 12–14PX, +6 TRACKING, SLATE OR GOLD</text>
  <line x1="120" y1="1500" x2="1480" y2="1500" stroke="${P.line}" stroke-width="1"/>
  <text x="120" y="1600" font-family="Georgia" font-size="30" fill="${P.gold}">Pairing in the wild</text>
  <text x="120" y="1700" font-family="Georgia" font-size="54" fill="${P.ink}">October</text>
  <text x="122" y="1745" font-family="'DejaVu Sans'" font-size="17" letter-spacing="5" fill="${P.soft}">NEW MOON · OCT 2 &nbsp;&nbsp; FULL MOON · OCT 17</text>
  <text x="120" y="1930" font-family="'DejaVu Sans'" font-size="18" fill="${P.soft}">Free substitutes when selling editable files: Playfair Display + Inter (both SIL OFL, commercial-safe).</text>`);
// --- shopify hero / banners / email header / profile ---
page('brand-hero-shopify', 2400, 1000, `${sky(2400, 1000, 'dark', 'g5')}
  ${dotStars(120, 2400, 1000, 11, P.goldSoft, 1.5, 0.5)}
  ${moonPhase(1980, 300, 130, 0.72, P.goldSoft, P.goldSoft, 2.4)}
  ${constellation(1500, 620, 620, 200, 13, P.goldSoft, 6, 3, 1.2)}`,
  `<div style="position:absolute;left:150px;top:50%;transform:translateY(-50%);">
    <div class="sans" style="letter-spacing:12px;font-size:24px;color:${P.lav};">M O O N M U S E &nbsp; S T U D I O</div>
    <div style="font-size:88px;color:${P.cream};margin-top:24px;line-height:1.1;">Plan by moonlight.</div>
    <div class="sans" style="font-size:26px;color:#B9C0DE;margin-top:26px;">Premium celestial planners, wallpapers &amp; art — instant downloads.</div>
  </div>`);
page('brand-banner-web', 2400, 800, `${sky(2400, 800, 'light', 'g6')}
  ${dotStars(50, 2400, 800, 15, P.gold, 1.3, 0.3)}
  ${moonPhase(2020, 400, 150, 0.5, P.gold, P.goldFaint, 2)}
  ${sparkle(1780, 210, 20, P.gold)} ${sparkle(2230, 620, 14, P.lav)}`,
  `<div style="position:absolute;left:150px;top:50%;transform:translateY(-50%);">
    <div class="sans" style="letter-spacing:10px;font-size:22px;color:${P.gold};">M O O N M U S E &nbsp; S T U D I O</div>
    <div style="font-size:72px;color:${P.ink};margin-top:20px;">A quieter kind of organised.</div>
  </div>`);
page('brand-email-header', 1200, 400, `${sky(1200, 400, 'dark', 'g7')}
  ${dotStars(50, 1200, 400, 17, P.goldSoft, 1.3, 0.5)}
  ${logo(340, 200, 1.9, true)}`);
page('brand-social-profile', 1024, 1024, `<rect width="1024" height="1024" fill="${P.navy}"/>
  ${dotStars(30, 1024, 1024, 19, P.goldSoft, 1.6, 0.4)}
  ${iconOnly(512, 470, 8.4, P.goldSoft)}
  <text x="512" y="850" text-anchor="middle" font-family="Georgia" font-size="64" letter-spacing="12" fill="${P.cream}">MOONMUSE</text>`);
// --- store category icons (6) ---
const cats = [
  ['icon-planner', `<rect x="156" y="128" width="200" height="256" rx="26" fill="none" stroke="${P.gold}" stroke-width="7"/><line x1="196" y1="208" x2="316" y2="208" stroke="${P.gold}" stroke-width="7" stroke-linecap="round"/><line x1="196" y1="268" x2="316" y2="268" stroke="${P.gold}" stroke-width="7" stroke-linecap="round"/><line x1="196" y1="328" x2="276" y2="328" stroke="${P.gold}" stroke-width="7" stroke-linecap="round"/>${sparkle(340, 150, 26, P.lav)}`],
  ['icon-stickers', `${crescent(226, 256, 90, P.gold)}${sparkle(330, 170, 30, P.lav)}${sparkle(350, 320, 20, P.gold)}<circle cx="180" cy="150" r="10" fill="${P.lav}"/>`],
  ['icon-wallpapers', `<rect x="176" y="108" width="160" height="296" rx="34" fill="none" stroke="${P.gold}" stroke-width="7"/>${crescent(256, 236, 44, P.gold)}${sparkle(306, 168, 16, P.lav)}`],
  ['icon-wallart', `<rect x="136" y="128" width="240" height="256" rx="10" fill="none" stroke="${P.gold}" stroke-width="7"/><rect x="172" y="164" width="168" height="184" fill="none" stroke="${P.gold}" stroke-width="4" opacity="0.6"/>${moonPhase(256, 256, 52, 0.72, P.gold, P.gold, 5)}`],
  ['icon-journal', `<rect x="156" y="118" width="200" height="276" rx="20" fill="none" stroke="${P.gold}" stroke-width="7"/><line x1="256" y1="118" x2="256" y2="394" stroke="${P.gold}" stroke-width="4" opacity="0.55"/>${sparkle(216, 220, 22, P.lav)}<line x1="286" y1="200" x2="330" y2="200" stroke="${P.gold}" stroke-width="6" stroke-linecap="round"/><line x1="286" y1="250" x2="330" y2="250" stroke="${P.gold}" stroke-width="6" stroke-linecap="round"/>`],
  ['icon-cards', `<rect x="150" y="140" width="160" height="230" rx="20" fill="none" stroke="${P.gold}" stroke-width="7" transform="rotate(-8 230 255)"/><rect x="210" y="146" width="160" height="230" rx="20" fill="${P.cream}" stroke="${P.gold}" stroke-width="7" transform="rotate(7 290 261)"/>${sparkle(292, 258, 30, P.gold)}`],
];
for (const [name, art] of cats) page(`brand-${name}`, 512, 512, `<circle cx="256" cy="256" r="248" fill="${P.cream}"/>${art}`);
// --- product mockup ---
page('brand-mockup', 1600, 1600, `${sky(1600, 1600, 'light', 'g8')}
  ${dotStars(40, 1600, 900, 21, P.gold, 1.4, 0.3)}
  <rect x="240" y="470" width="540" height="760" rx="30" fill="${P.white}" stroke="${P.line}" stroke-width="1.5"/>
  <rect x="240" y="470" width="540" height="760" rx="30" fill="${P.navy}" opacity="0.03"/>
  ${moonPhase(510, 700, 90, 0.72, P.gold, P.goldFaint, 2)}
  <text x="510" y="880" text-anchor="middle" font-family="Georgia" font-size="42" fill="${P.ink}">Ultimate Planner</text>
  <text x="510" y="930" text-anchor="middle" font-family="'DejaVu Sans'" font-size="18" letter-spacing="6" fill="${P.soft}">M O O N M U S E</text>
  <rect x="850" y="330" width="380" height="770" rx="52" fill="${P.navy}" stroke="${P.lineDark}" stroke-width="2"/>
  ${dotStars(30, 320, 700, 23, P.goldSoft, 1.5, 0.5).replace(/<circle /g, '<circle transform="translate(880,370)" ')}
  ${crescent(1040, 640, 70, P.goldSoft)}
  ${sparkle(1140, 500, 22, P.lav)}
  <rect x="1090" y="1010" width="360" height="360" rx="24" fill="${P.white}" stroke="${P.line}" stroke-width="1.5" transform="rotate(-6 1270 1190)"/>
  ${sparkle(1265, 1150, 34, P.gold)}
  <text x="1268" y="1265" text-anchor="middle" font-family="Georgia" font-size="26" fill="${P.ink}" transform="rotate(-6 1270 1190)">I move like the moon —</text>
  <text x="1268" y="1300" text-anchor="middle" font-family="Georgia" font-size="26" fill="${P.ink}" transform="rotate(-6 1270 1190)">quietly, and in phases.</text>`,
  `<div class="sans" style="position:absolute;top:120px;width:100%;text-align:center;letter-spacing:10px;font-size:26px;color:${P.gold};">M O O N M U S E &nbsp; S T U D I O</div>
   <div style="position:absolute;top:170px;width:100%;text-align:center;font-size:56px;color:${P.ink};">The Celestial Collection</div>`);
console.log('brand pages done');
