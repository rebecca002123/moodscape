import { MOODS } from '../theme/moods';
import { daysAgoKey } from './dates';

// Average mood score per day, as a map of dayKey → score.
export function dailyAverages(entries) {
  const sums = {};
  for (const e of entries) {
    const s = MOODS[e.mood]?.score ?? 3;
    if (!sums[e.day]) sums[e.day] = { total: 0, n: 0 };
    sums[e.day].total += s;
    sums[e.day].n += 1;
  }
  const out = {};
  for (const k of Object.keys(sums)) out[k] = sums[k].total / sums[k].n;
  return out;
}

// Consecutive days with at least one entry, counting back from today
// (a streak survives until a full day is actually missed).
export function currentStreak(entries) {
  const days = new Set(entries.map((e) => e.day));
  let streak = 0;
  let i = days.has(daysAgoKey(0)) ? 0 : 1;
  while (days.has(daysAgoKey(i))) {
    streak += 1;
    i += 1;
  }
  return streak;
}

// Series of the last `n` days for the mood curve: [{ key, score|null }].
export function recentSeries(entries, n) {
  const avg = dailyAverages(entries);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = daysAgoKey(i);
    out.push({ key, score: avg[key] ?? null });
  }
  return out;
}

export function averageScore(entries) {
  if (!entries.length) return null;
  const total = entries.reduce((acc, e) => acc + (MOODS[e.mood]?.score ?? 3), 0);
  return total / entries.length;
}

export function moodDistribution(entries) {
  const counts = {};
  for (const e of entries) counts[e.mood] = (counts[e.mood] || 0) + 1;
  return counts;
}

export function topTags(entries, limit = 6) {
  const counts = {};
  for (const e of entries) {
    for (const t of e.tags || []) counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export function entriesSince(entries, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((e) => e.createdAt >= cutoff);
}
