// The mountain's measures: score bands, clamps, and calendar arithmetic.
// Pure functions only — the forecast engine and the UI both lean on these.

export const SCORE_MIN = 300;
export const SCORE_MAX = 850;

export function clampScore(s) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, s));
}

// The familiar 300–850 bands. Names and cut lines follow the ranges most
// bureaus and card apps publish; colors are Summit's own.
export const BANDS = [
  { name: 'Poor', min: 300, max: 579, color: '#f4735f' },
  { name: 'Fair', min: 580, max: 669, color: '#f5a35c' },
  { name: 'Good', min: 670, max: 739, color: '#f2d06b' },
  { name: 'Very good', min: 740, max: 799, color: '#7fd6a4' },
  { name: 'Excellent', min: 800, max: 850, color: '#5fd0c7' },
];

export function bandFor(score) {
  const s = clampScore(score);
  return BANDS.find((b) => s >= b.min && s <= b.max) || BANDS[0];
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function addMonths(ts, months) {
  const d = new Date(ts);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  // Clamp to the target month's last day so Jan 31 + 1mo lands on Feb 28, not Mar 3.
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d.getTime();
}

export function monthsBetween(fromTs, toTs) {
  return (toTs - fromTs) / (30.44 * DAY_MS);
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(ts) {
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthShort(ts) {
  const d = new Date(ts);
  return MONTHS_SHORT[d.getMonth()];
}

export function formatDate(ts) {
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "+3–7" / "−4–9" — a signed range in points, for badges and headlines.
// A range that straddles zero signs each end ("−8 to +12"): the downside
// must never be dressed up as a gain.
export function formatDelta(lo, hi) {
  const a = Math.round(lo);
  const b = Math.round(hi);
  if (a < 0 && b >= 0) return `−${Math.abs(a)} to +${b}`;
  const sign = b < 0 || (b === 0 && a < 0) ? '−' : '+';
  const x = Math.abs(sign === '−' ? b : a);
  const y = Math.abs(sign === '−' ? a : b);
  return x === y ? `${sign}${x}` : `${sign}${x}–${y}`;
}

// "Dec 15" — for tight spots like the dial's delta line.
export function formatDateShort(ts) {
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}
