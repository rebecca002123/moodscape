// Little time words. Cards remember exact moments; people prefer
// "tomorrow" and "in 12 days" — this file does the translating.

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function monthKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function prettyDate(ts, { withYear = 'auto' } = {}) {
  const d = new Date(ts);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  const showYear = withYear === true || (withYear === 'auto' && d.getFullYear() !== new Date().getFullYear());
  return showYear ? `${base} ${d.getFullYear()}` : base;
}

export function prettyTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes();
  const half = h >= 12 ? 'pm' : 'am';
  h = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h}${half}` : `${h}:${String(m).padStart(2, '0')}${half}`;
}

// "today", "tomorrow", "this Friday", "in 12 days", "3 days ago"
export function relativeDay(ts, now = Date.now()) {
  const days = Math.round((dayStart(ts) - dayStart(now)) / DAY_MS);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 1 && days < 7) return `this ${WEEKDAYS[new Date(ts).getDay()]}`;
  if (days >= 7) return `in ${days} days`;
  return `${-days} days ago`;
}

export function timeAgo(ts, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return prettyDate(ts);
}

export function greeting(now = Date.now()) {
  const h = new Date(now).getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Weeks start on Monday here — SnapNest keeps UK time in its bones.
export function weekStart(ts = Date.now()) {
  const d = new Date(dayStart(ts));
  const shift = (d.getDay() + 6) % 7;
  return d.getTime() - shift * DAY_MS;
}
