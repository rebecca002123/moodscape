// The Nest Brain 🧠🪺 — a tiny reader that lives entirely on your phone.
// Hand it the text of a screenshot and it works out what you saved
// (a product? a gig? tonight's dinner?) and pulls out the useful bits:
// prices, dates, ingredients, salaries, senders. No cloud, no account —
// just patient little regexes doing their best, and telling you why.
//
// Pure JavaScript on purpose: no React, no native imports. It can be
// exercised straight from node, and it never sends a word anywhere.

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const MONTH_RE = MONTH_NAMES.map((m) => `${m.slice(0, 3)}(?:${m.slice(3)})?`).join('|');
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAY_RE = WEEKDAY_NAMES.map((w) => `${w.slice(0, 3)}(?:${w.slice(3)})?`).join('|');

const PRICE_RE = /([£$€])\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d{2})?/g;
const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/gi;
const POSTCODE_RE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/gi;
const URL_RE = /https?:\/\/[^\s]+|\b[a-z0-9][a-z0-9-]*\.(?:com|co\.uk|org\.uk|uk|net|org|io|app|shop|store)(?:\/[^\s]*)?\b/gi;
const DURATION_RE = /\b(\d+)\s?(?:hours?|hrs?|h)\b(?:\s?(\d+)\s?(?:minutes?|mins?|m)\b)?|\b(\d+)\s?(?:minutes?|mins?)\b/gi;
const QTY_LINE_RE = /^\s*\d+(?:\.\d+)?\s?(?:g|kg|ml|l|tbsp|tsp|cups?|oz|cloves?|slices?|handfuls?)\b/i;
const SERVES_RE = /\bserves?\s?(\d{1,2})\b/i;
const NIGHTS_RE = /\b(\d{1,2})\s?nights?\b/i;

// Lines that are screenshot furniture, not meaning: clocks, battery, nav chrome.
const JUNK_LINE_RE = /^\s*(?:[<‹◀←]\s*(?:back)?|back|menu|share|home|search|\d{1,2}:\d{2}(?:\s?(?:am|pm))?|100%|\d{1,3}\s?%|[🔋📶✕✖×]+)\s*$/i;

const CLOTHING_NOUNS = [
  'dress', 'trainers', 'sneakers', 'jacket', 'skirt', 'jeans', 'trousers', 'top',
  'heels', 'boots', 'coat', 'blouse', 'knit', 'jumper', 'cardigan', 'shirt',
  'tee', 't-shirt', 'bag', 'handbag', 'scarf', 'hoodie', 'shorts', 'sandals', 'loafers',
];

const FOOD_WORDS = [
  'pasta', 'spaghetti', 'noodles', 'rice', 'chicken', 'garlic', 'onion', 'lemon',
  'butter', 'cream', 'cheese', 'parmesan', 'basil', 'tomato', 'sauce', 'soup',
  'salad', 'curry', 'tofu', 'egg', 'eggs', 'flour', 'sugar', 'chocolate', 'cake',
  'bread', 'dough', 'salmon', 'prawns', 'mushroom', 'spinach', 'chilli', 'ginger',
];

// Each type's vocabulary. A hit is worth its weight; structure adds more below.
const BANKS = {
  product: {
    2: ['add to bag', 'add to basket', 'add to cart', 'free returns', 'in stock', 'checkout', 'rrp', 'free delivery'],
    1: ['buy', 'order', 'sale', 'delivery', 'returns', 'stock', 'size', 'colour', 'color', 'wishlist', 'reviews', 'rated', 'shop', 'basket'],
  },
  event: {
    2: ['tickets from', 'on sale', 'presale', 'doors', 'tour dates', 'live at', 'general admission', 'go on sale'],
    1: ['tickets', 'ticket', 'tour', 'gig', 'concert', 'festival', 'venue', 'live', 'seated', 'standing', 'support', 'lineup', 'line-up', 'arena', 'academy', 'dome', 'stadium'],
  },
  recipe: {
    2: ['ingredients', 'method', 'prep time', 'cook time', 'preheat'],
    1: ['recipe', 'serves', 'oven', 'simmer', 'bake', 'whisk', 'stir', 'chop', 'season', 'tbsp', 'tsp', 'garnish', 'drain', 'toss', 'cook', 'minutes'],
  },
  job: {
    2: ['apply by', 'apply now', 'per annum', 'full-time', 'part-time', 'cover letter', 'now hiring'],
    1: ['apply', 'salary', 'hiring', 'role', 'position', 'remote', 'hybrid', 'on-site', 'experience', 'cv', 'portfolio', 'interview', 'benefits', 'vacancy', 'junior', 'senior', 'designer', 'engineer', 'assistant', 'manager'],
  },
  outfit: {
    2: ['outfit', 'ootd', 'fit check', 'styling', 'style board', 'lookbook', 'capsule wardrobe'],
    1: ['look', 'style', 'wear', 'wardrobe', 'fashion', 'aesthetic', 'paired', 'layered'],
  },
  place: {
    2: ['opening hours', 'get directions', 'saved place'],
    1: ['address', 'road', 'street', 'avenue', 'lane', 'directions', 'open until', 'cafe', 'café', 'restaurant', 'bar', 'park', 'garden centre', 'near'],
  },
  message: {
    2: ['reply', 'message', 'last seen', 'typing…', 'typing...'],
    1: ['sent', 'delivered', 'read', 'online', 'chat', 'says', 'texted', 'dm'],
  },
  travel: {
    2: ['check-in', 'check in', 'city break', 'per person', 'return flight', 'boarding'],
    1: ['flight', 'flights', 'hotel', 'hostel', 'nights', 'airport', 'getaway', 'trip', 'holiday', 'itinerary', 'beach', 'old town', 'tram', 'stay', 'travel'],
  },
  idea: {
    2: ['moodboard', 'mood board', 'inspo', 'inspiration'],
    1: ['quote', 'aesthetic', 'wallpaper', 'vibes', 'ideas', 'dream', 'manifest', 'journal', 'caption'],
  },
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findBankHits(lower, bank) {
  const hits = [];
  let score = 0;
  for (const weight of [2, 1]) {
    for (const phrase of bank[weight] || []) {
      const re = new RegExp(`(?:^|[^a-z])${escapeRe(phrase)}(?:[^a-z]|$)`, 'i');
      if (re.test(lower)) {
        hits.push(phrase);
        score += weight;
      }
    }
  }
  return { score, hits };
}

// ---------------------------------------------------------------------------
// Signals: everything the Brain can point at while explaining itself.
// ---------------------------------------------------------------------------

export function extractSignals(text, { now = Date.now() } = {}) {
  const raw = String(text || '');
  const lower = raw.toLowerCase();
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !JUNK_LINE_RE.test(l));

  // Prices — every £/$/€ amount, with position so ranges can be spotted.
  const prices = [];
  for (const m of raw.matchAll(PRICE_RE)) {
    const value = parseFloat(m[2].replace(/,/g, '') + (m[3] || ''));
    prices.push({ currency: m[1], value, raw: m[0].trim(), index: m.index });
  }

  // A salary range is two big prices holding hands: "£26,000 – £30,000".
  let salaryRange = null;
  for (let i = 0; i + 1 < prices.length; i++) {
    const a = prices[i];
    const b = prices[i + 1];
    const between = raw.slice(a.index + a.raw.length, b.index);
    if (a.value >= 1000 && b.value > a.value && between.length <= 8 && /[-–—]|to/i.test(between)) {
      salaryRange = { min: a.value, max: b.value, raw: `${a.raw} – ${b.raw}` };
      break;
    }
  }

  const perPerson = /\dpp\b|\bper person\b/i.test(raw);
  const priceFromMatch = /\bfrom\s+([£$€]\s?[\d,.]+)/i.exec(raw);

  const dates = parseDates(raw, now);
  const times = [];
  for (const m of raw.matchAll(TIME_RE)) {
    if (m[3]) times.push({ hours: (parseInt(m[1], 10) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0), minutes: parseInt(m[2] || '0', 10), index: m.index, raw: m[0] });
    else times.push({ hours: parseInt(m[4], 10), minutes: parseInt(m[5], 10), index: m.index, raw: m[0] });
  }

  let duration = null;
  const dm = DURATION_RE.exec(raw);
  DURATION_RE.lastIndex = 0;
  if (dm) duration = dm[3] ? parseInt(dm[3], 10) : parseInt(dm[1], 10) * 60 + parseInt(dm[2] || '0', 10);

  const postcodes = [];
  for (const m of raw.matchAll(POSTCODE_RE)) postcodes.push(`${m[1].toUpperCase()} ${m[2].toUpperCase()}`);

  const urls = [];
  for (const m of raw.matchAll(URL_RE)) urls.push(m[0]);

  const quantityLines = lines.filter((l) => QTY_LINE_RE.test(l));
  const servesMatch = SERVES_RE.exec(raw);
  const nightsMatch = NIGHTS_RE.exec(raw);

  const clothing = CLOTHING_NOUNS.filter((n) => new RegExp(`\\b${escapeRe(n)}s?\\b`, 'i').test(lower));
  const foods = FOOD_WORDS.filter((n) => new RegExp(`\\b${escapeRe(n)}\\b`, 'i').test(lower));

  // Chat shape: sender lines ("sophie:"), question bubbles, lowercase chatter.
  const senderLines = lines.filter((l) => /^[A-Z][a-zA-Z]{1,14}(\s[A-Z][a-zA-Z]{1,14})?\s?[:💬]/.test(l));
  const questionLines = lines.filter((l) => /\?\s*$|\?\?/.test(l));
  const casualLines = lines.filter((l) => /^[a-z]/.test(l) && l.length < 60);
  const chatScore =
    (senderLines.length ? 2 : 0) +
    (questionLines.length ? 1 : 0) +
    (casualLines.length >= 2 ? 2 : casualLines.length ? 1 : 0) +
    (/\bsent\b|\bdelivered\b|\bread\b|typing/i.test(lower) ? 1 : 0);

  const quoted = /[“"']([^”"']{12,140})[”"']/.exec(raw);

  return {
    raw, lower, lines, prices, salaryRange, perPerson,
    priceFrom: priceFromMatch ? priceFromMatch[1].replace(/\s/g, '') : null,
    dates, times, duration, postcodes, urls, quantityLines,
    serves: servesMatch ? parseInt(servesMatch[1], 10) : null,
    nights: nightsMatch ? parseInt(nightsMatch[1], 10) : null,
    clothing, foods, chatScore, senderLines, questionLines,
    quoted: quoted ? quoted[1].trim() : null,
  };
}

// ---------------------------------------------------------------------------
// Dates: "18 August", "Aug 18", "18/08", "tomorrow", "friday" — resolved to a
// real timestamp, rolling forward a year when the date has already slipped by.
// ---------------------------------------------------------------------------

function resolveYear(monthIdx, day, now) {
  const nowD = new Date(now);
  let year = nowD.getFullYear();
  const candidate = new Date(year, monthIdx, day).getTime();
  // Two weeks of grace for "just happened"; older than that means next year.
  if (candidate < now - 14 * 24 * 3600 * 1000) year += 1;
  return new Date(year, monthIdx, day).getTime();
}

function monthIndex(name) {
  const three = name.slice(0, 3).toLowerCase();
  return MONTH_NAMES.findIndex((m) => m.startsWith(three));
}

export function parseDates(raw, now = Date.now()) {
  const found = [];
  const push = (ts, rawStr, index) => {
    if (ts && !Number.isNaN(ts)) found.push({ ts, raw: rawStr.trim(), index, hasTime: false });
  };

  // "18 August" / "18th Aug"
  for (const m of raw.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+(${MONTH_RE})\\b(?:\\s+(\\d{4}))?`, 'gi'))) {
    const day = parseInt(m[1], 10);
    const mi = monthIndex(m[2]);
    if (day >= 1 && day <= 31 && mi >= 0) {
      const ts = m[3] ? new Date(parseInt(m[3], 10), mi, day).getTime() : resolveYear(mi, day, now);
      push(ts, m[0], m.index);
    }
  }
  // "August 18"
  for (const m of raw.matchAll(new RegExp(`\\b(${MONTH_RE})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(\\d{4}))?`, 'gi'))) {
    const mi = monthIndex(m[1]);
    const day = parseInt(m[2], 10);
    if (day >= 1 && day <= 31 && mi >= 0 && !found.some((f) => Math.abs(f.index - m.index) < 6)) {
      const ts = m[3] ? new Date(parseInt(m[3], 10), mi, day).getTime() : resolveYear(mi, day, now);
      push(ts, m[0], m.index);
    }
  }
  // "18/08" or "18/08/2026" (UK day-first)
  for (const m of raw.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) {
    const day = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    if (day >= 1 && day <= 31 && mo >= 0 && mo <= 11) {
      let ts;
      if (m[3]) {
        let y = parseInt(m[3], 10);
        if (y < 100) y += 2000;
        ts = new Date(y, mo, day).getTime();
      } else ts = resolveYear(mo, day, now);
      push(ts, m[0], m.index);
    }
  }
  // today / tonight / tomorrow
  const dayMs = 24 * 3600 * 1000;
  for (const m of raw.matchAll(/\b(today|tonight|tomorrow)\b/gi)) {
    const base = new Date(now); base.setHours(0, 0, 0, 0);
    push(base.getTime() + (m[1].toLowerCase() === 'tomorrow' ? dayMs : 0), m[0], m.index);
  }
  // bare weekday: "friday", "this sunday" → next occurrence
  for (const m of raw.matchAll(new RegExp(`\\b(?:this\\s+|next\\s+)?(${WEEKDAY_RE})\\b`, 'gi'))) {
    if (found.some((f) => m.index >= f.index - 12 && m.index <= f.index + f.raw.length + 2)) continue;
    const target = WEEKDAY_NAMES.findIndex((w) => w.startsWith(m[1].slice(0, 3).toLowerCase()));
    if (target < 0) continue;
    const base = new Date(now); base.setHours(0, 0, 0, 0);
    let shift = (target - base.getDay() + 7) % 7;
    if (shift === 0) shift = 7;
    push(base.getTime() + shift * dayMs, m[0], m.index);
  }

  found.sort((a, b) => a.index - b.index);
  return found;
}

// Marry the first sensible date to a nearby time so "18 Aug · doors 7pm"
// becomes one honest moment.
function attachTime(dateHit, signals) {
  if (!dateHit) return null;
  const sameLineTime = signals.times.find((t) => Math.abs(t.index - dateHit.index) < 90);
  if (!sameLineTime) return { ts: dateHit.ts, hasTime: false, raw: dateHit.raw };
  const d = new Date(dateHit.ts);
  d.setHours(sameLineTime.hours, sameLineTime.minutes, 0, 0);
  return { ts: d.getTime(), hasTime: true, raw: `${dateHit.raw} · ${sameLineTime.raw}` };
}

// ---------------------------------------------------------------------------
// Classification: every type pleads its case, the best story wins.
// ---------------------------------------------------------------------------

export function classify(text, providedSignals) {
  const signals = providedSignals || extractSignals(text);
  const { lower } = signals;
  const scores = {};
  const hits = {};

  for (const type of Object.keys(BANKS)) {
    const r = findBankHits(lower, BANKS[type]);
    scores[type] = r.score;
    hits[type] = r.hits;
  }

  // Structure speaks louder than vocabulary.
  if (signals.prices.length && !signals.salaryRange) scores.product += 2;
  if (signals.salaryRange) scores.job += 3;
  if (signals.quantityLines.length >= 2) scores.recipe += 3;
  else if (signals.quantityLines.length === 1) scores.recipe += 1;
  if (signals.foods.length >= 2) scores.recipe += 2;
  else if (signals.foods.length === 1) scores.recipe += 1;
  if (signals.serves) scores.recipe += 1;
  if (signals.dates.length && scores.event > 0) scores.event += 2;
  if (signals.nights) scores.travel += 3;
  if (signals.perPerson) scores.travel += 2;
  if (signals.postcodes.length) scores.place += 3;
  if (signals.chatScore >= 3) scores.message += 3;
  else if (signals.chatScore === 2) scores.message += 1;
  if (signals.clothing.length) {
    scores.outfit += Math.min(signals.clothing.length, 2);
    scores.product += 1;
  }
  if (signals.quoted && signals.lines.length <= 4) scores.idea += 2;

  // A shop page about a dress is a product; a collage of looks is an outfit.
  if (scores.outfit > 0 && scores.product > scores.outfit && signals.prices.length) {
    scores.outfit = Math.max(0, scores.outfit - 1);
  }

  const ranked = Object.entries(scores)
    .map(([type, score]) => ({ type, score }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1] || { score: 0 };
  const confident = top.score >= 2;
  const type = confident ? top.type : 'idea';
  const confidence = !confident
    ? 0.25
    : Math.max(0.35, Math.min(0.97, 0.5 + (top.score - second.score) * 0.12 + top.score * 0.02));

  return { type, confidence, ranked, hits, signals };
}

// ---------------------------------------------------------------------------
// Titles: the line that sounds most like a name, not a price or a clock.
// ---------------------------------------------------------------------------

const tidyTitle = (line) => {
  let t = line
    .replace(PRICE_RE, '').replace(/\s{2,}/g, ' ')
    .replace(/[·|•]\s*$/, '').replace(/^[-–—·•\s]+|[-–—·•\s]+$/g, '')
    .trim();
  PRICE_RE.lastIndex = 0;
  if (t.length > 2 && t === t.toUpperCase()) {
    t = t.toLowerCase().replace(/(^|\s|-)([a-z])/g, (s) => s.toUpperCase());
  }
  return t;
};

function pickTitle(signals, type) {
  const candidates = signals.lines
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => {
      const stripped = line.replace(PRICE_RE, '').trim();
      PRICE_RE.lastIndex = 0;
      return /[a-zA-Z]{3}/.test(stripped);
    });
  if (!candidates.length) return null;

  let best = null;
  let bestScore = -Infinity;
  for (const { line, i } of candidates) {
    let s = 0;
    s -= i * 1.2; // earlier lines usually carry the headline
    const len = line.length;
    if (len >= 8 && len <= 48) s += 3;
    else if (len < 5 || len > 80) s -= 2;
    if (/^[A-Z]/.test(line)) s += 1.5;
    if (/^[a-z]/.test(line)) s -= 1;
    if (/\?\s*$/.test(line)) s -= 2;
    if (/^(ingredients|method|apply|sent|delivered)\b/i.test(line)) s -= 3;
    if (type === 'recipe' && FOOD_WORDS.some((f) => line.toLowerCase().includes(f))) s += 2;
    if (type === 'event' && /tour|live|presents/i.test(line)) s += 1;
    if (s > bestScore) { bestScore = s; best = line; }
  }
  return best ? tidyTitle(best) : null;
}

const fmtMoney = (p) => (p ? `${p.currency}${p.value % 1 === 0 && p.value >= 1000 ? p.value.toLocaleString('en-GB') : p.value.toFixed(p.value % 1 ? 2 : 0)}` : null);

const shortDate = (ts, withTime, hasTime) => {
  const d = new Date(ts);
  let s = `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 1).toUpperCase()}${MONTH_NAMES[d.getMonth()].slice(1, 3)}`;
  if (withTime && hasTime) {
    let h = d.getHours(); const m = d.getMinutes();
    const half = h >= 12 ? 'pm' : 'am'; h = h % 12 === 0 ? 12 : h % 12;
    s += `, ${m ? `${h}:${String(m).padStart(2, '0')}` : h}${half}`;
  }
  return s;
};

// ---------------------------------------------------------------------------
// buildCard: the whole trick, end to end. Text in → a warm little card out.
// ---------------------------------------------------------------------------

export function buildCard(text, { hintType = null, now = Date.now() } = {}) {
  const signals = extractSignals(text, { now });
  const cls = classify(text, signals);
  const type = hintType || cls.type;
  const why = [];
  const fields = {};

  const futureDates = signals.dates.filter((d) => d.ts >= now - 24 * 3600 * 1000);
  const bestDate = attachTime(futureDates[0] || signals.dates[0] || null, signals);
  const mainPrice = !signals.salaryRange && signals.prices.length
    ? signals.prices.reduce((a, b) => (b.value < a.value ? b : a))
    : null;

  let title = pickTitle(signals, type);
  let subtitle = null;

  switch (type) {
    case 'product': {
      fields.price = mainPrice ? mainPrice.value : null;
      fields.currency = mainPrice ? mainPrice.currency : '£';
      fields.priceRaw = fmtMoney(mainPrice);
      const was = /\b(?:was|rrp)\s*[£$€]?\s?([\d,]+\.?\d*)/i.exec(signals.raw);
      fields.wasPrice = was ? parseFloat(was[1].replace(/,/g, '')) : null;
      subtitle = [fields.priceRaw, signals.urls[0] ? 'link saved' : null].filter(Boolean).join(' · ') || 'Saved to wishlist';
      if (mainPrice) why.push({ emoji: '💰', text: `Found a price — ${fields.priceRaw}` });
      break;
    }
    case 'event': {
      if (bestDate) { fields.when = bestDate.ts; fields.whenHasTime = bestDate.hasTime; }
      const venueLine = signals.lines.find((l) => /\b(dome|arena|hall|theatre|theater|academy|stadium|club|room|chapel|pavilion|palace|forum)\b/i.test(l) && tidyTitle(l) !== title);
      fields.venue = venueLine ? tidyTitle(venueLine) : null;
      fields.priceFrom = signals.priceFrom || fmtMoney(mainPrice);
      subtitle = [bestDate ? shortDate(bestDate.ts, true, bestDate.hasTime) : null, fields.venue].filter(Boolean).join(' · ') || 'Event spotted';
      if (bestDate) why.push({ emoji: '📅', text: `Spotted a date — ${shortDate(bestDate.ts, true, bestDate.hasTime)}` });
      if (fields.venue) why.push({ emoji: '📍', text: `Looks like it's at ${fields.venue}` });
      break;
    }
    case 'recipe': {
      fields.minutes = signals.duration;
      fields.serves = signals.serves;
      const list = [...signals.quantityLines];
      const idx = signals.lines.findIndex((l) => /^ingredients\b/i.test(l));
      if (idx >= 0) {
        for (const l of signals.lines.slice(idx + 1, idx + 9)) {
          if (/^(method|steps|instructions)\b/i.test(l)) break;
          if (!list.includes(l) && l.length < 44) list.push(l);
        }
      }
      fields.ingredients = list.slice(0, 8);
      subtitle = [fields.minutes ? `${fields.minutes} minutes` : null, fields.serves ? `Serves ${fields.serves}` : null].filter(Boolean).join(' · ') || 'Recipe kept';
      if (fields.ingredients.length) why.push({ emoji: '🥣', text: `${fields.ingredients.length} ingredient${fields.ingredients.length === 1 ? '' : 's'} spotted` });
      if (fields.minutes) why.push({ emoji: '⏲️', text: `Ready in ${fields.minutes} minutes` });
      break;
    }
    case 'job': {
      fields.salary = signals.salaryRange ? signals.salaryRange.raw : (mainPrice && mainPrice.value >= 1000 ? fmtMoney(mainPrice) : null);
      const locLine = signals.lines.find((l) => /\b(hybrid|remote|on-site|onsite)\b/i.test(l));
      fields.location = locLine
        ? tidyTitle(locLine.replace(/\b(hybrid|remote|on-site|onsite)\b/gi, '').replace(/[·|,]/g, ' ')) || null
        : (signals.postcodes[0] || null);
      fields.workStyle = locLine ? (locLine.match(/\b(hybrid|remote|on-site|onsite)\b/i) || [])[0] : null;
      const applyBy = /apply\s+by\s+([^\n]+)/i.exec(signals.raw);
      if (applyBy) {
        const dl = parseDates(applyBy[1], now)[0];
        if (dl) { fields.deadline = dl.ts; why.push({ emoji: '⏳', text: `Apply by ${shortDate(dl.ts)}` }); }
      }
      subtitle = [fields.location, fields.workStyle, signals.salaryRange ? signals.salaryRange.raw : fields.salary].filter(Boolean).join(' · ') || 'Role spotted';
      if (signals.salaryRange) why.push({ emoji: '💷', text: `Salary ${signals.salaryRange.raw}` });
      break;
    }
    case 'outfit': {
      fields.pieces = signals.clothing.slice(0, 5);
      fields.priceRaw = fmtMoney(mainPrice);
      subtitle = fields.pieces.length ? fields.pieces.join(' · ') : 'Pinned to your style board';
      if (fields.pieces.length) why.push({ emoji: '👗', text: `Pieces: ${fields.pieces.join(', ')}` });
      break;
    }
    case 'place': {
      const addrLine = signals.lines.find((l) => /\b(road|street|avenue|lane|rd|st|ave)\b/i.test(l) || POSTCODE_RE.test(l));
      POSTCODE_RE.lastIndex = 0;
      fields.address = addrLine ? tidyTitle(addrLine) : null;
      fields.postcode = signals.postcodes[0] || null;
      subtitle = [fields.address, fields.postcode].filter(Boolean).join(' · ') || 'Place saved';
      if (fields.postcode) why.push({ emoji: '📮', text: `Postcode ${fields.postcode}` });
      break;
    }
    case 'message': {
      const sender = signals.senderLines[0]
        ? signals.senderLines[0].replace(/[:💬].*$/, '').trim()
        : (signals.lines[0] && signals.lines[0].length <= 20 ? tidyTitle(signals.lines[0]).replace(/[^\w\s'-]/g, '').trim() : null);
      fields.from = sender || 'someone lovely';
      const bubble = signals.questionLines[0] || signals.lines.find((l) => /^[a-z]/.test(l)) || signals.lines[1] || '';
      fields.preview = bubble.length > 90 ? `${bubble.slice(0, 87)}…` : bubble;
      title = `Reply to ${fields.from}`;
      subtitle = fields.preview ? `“${fields.preview}”` : 'Waiting for a reply';
      why.push({ emoji: '💬', text: `Sounds like ${fields.from} is waiting on you` });
      break;
    }
    case 'travel': {
      fields.nights = signals.nights;
      fields.priceFrom = signals.priceFrom || fmtMoney(mainPrice);
      if (bestDate) { fields.when = bestDate.ts; fields.whenHasTime = bestDate.hasTime; }
      subtitle = [fields.nights ? `${fields.nights} night${fields.nights === 1 ? '' : 's'}` : null, fields.priceFrom ? `from ${fields.priceFrom}${signals.perPerson ? 'pp' : ''}` : null].filter(Boolean).join(' · ') || 'Dream trip filed';
      if (fields.nights) why.push({ emoji: '🌙', text: `${fields.nights} nights away` });
      if (fields.priceFrom) why.push({ emoji: '💰', text: `From ${fields.priceFrom}${signals.perPerson ? ' per person' : ''}` });
      break;
    }
    default: {
      fields.quote = signals.quoted || null;
      if (fields.quote && (!title || title.length < 6)) title = `“${fields.quote.slice(0, 42)}${fields.quote.length > 42 ? '…' : ''}”`;
      subtitle = 'Tucked on your mood board';
      break;
    }
  }

  if (signals.urls.length) fields.url = signals.urls[0];

  // Explain the verdict with the words that convinced us.
  const topHits = (cls.hits[type] || []).slice(0, 3);
  if (topHits.length && type !== 'message') {
    why.push({ emoji: '🔍', text: `Heard: ${topHits.map((h) => `“${h}”`).join(', ')}` });
  }
  if (!hintType && cls.confidence < 0.45) {
    why.push({ emoji: '🤏', text: 'Not fully sure — tap another type if I guessed wrong' });
  }

  return {
    type,
    confidence: hintType ? 1 : cls.confidence,
    ranked: cls.ranked,
    title: title || 'Untitled snap',
    subtitle,
    fields,
    why,
  };
}

// Search across everything a card knows. Used by Ask My Screenshots.
const TYPE_SYNONYMS = {
  product: ['product', 'products', 'buy', 'wishlist', 'shopping', 'shop'],
  event: ['event', 'events', 'gig', 'gigs', 'concert', 'concerts', 'tickets', 'festival'],
  recipe: ['recipe', 'recipes', 'cook', 'cooking', 'dinner', 'food', 'meal'],
  job: ['job', 'jobs', 'work', 'role', 'roles', 'career', 'vacancy', 'hiring'],
  outfit: ['outfit', 'outfits', 'style', 'clothes', 'clothing', 'fashion', 'wear'],
  place: ['place', 'places', 'address', 'cafe', 'restaurant', 'spot'],
  message: ['message', 'messages', 'reply', 'replies', 'chat', 'text', 'texts'],
  travel: ['trip', 'trips', 'travel', 'holiday', 'holidays', 'flight', 'flights', 'getaway'],
  idea: ['idea', 'ideas', 'quote', 'quotes', 'inspo', 'inspiration', 'moodboard'],
};

export function searchCards(cards, query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter((t) => t.length > 1 && !['the', 'my', 'in', 'for', 'a', 'an', 'me', 'show', 'what', 'was', 'that', 'find', 'any', 'i', 'saved'].includes(t));
  if (!tokens.length) return [];

  const typeFilter = new Set();
  const textTokens = [];
  for (const t of tokens) {
    const hit = Object.keys(TYPE_SYNONYMS).find((k) => TYPE_SYNONYMS[k].includes(t));
    if (hit) typeFilter.add(hit);
    else textTokens.push(t);
  }

  const scored = [];
  for (const card of cards) {
    const hay = [
      card.title, card.subtitle, card.sourceText,
      Object.values(card.fields || {}).flat().filter((v) => typeof v === 'string').join(' '),
    ].join(' ').toLowerCase();
    let score = 0;
    if (typeFilter.size) score += typeFilter.has(card.type) ? 4 : -3;
    for (const t of textTokens) {
      if (hay.includes(t)) score += t.length >= 4 ? 3 : 2;
      else if (t.length >= 5 && hay.includes(t.slice(0, 4))) score += 1;
    }
    if (textTokens.length === 0 && typeFilter.size && typeFilter.has(card.type)) score += 1;
    if (score > (typeFilter.size && textTokens.length ? 4 : 2)) scored.push({ card, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.card);
}
