import { isDone, isScheduled } from '../state/store';
import { dayKey, daysAgo, todayKey } from './dates';

// Current streak: consecutive scheduled days completed, counting back from
// today. An unfinished *today* doesn't break the streak — it's still pending.
export function currentStreak(habit, completions) {
  let streak = 0;
  for (let back = 0; back < 1000; back++) {
    const key = dayKey(daysAgo(back));
    if (key < dayKey(habit.createdAt)) break;
    if (!isScheduled(habit, key)) continue;
    if (isDone(completions, habit.id, key)) streak += 1;
    else if (back === 0) continue;
    else break;
  }
  return streak;
}

export function bestStreak(habit, completions) {
  let best = 0;
  let run = 0;
  for (let back = 400; back >= 0; back--) {
    const key = dayKey(daysAgo(back));
    if (key < dayKey(habit.createdAt) || !isScheduled(habit, key)) continue;
    if (isDone(completions, habit.id, key)) {
      run += 1;
      best = Math.max(best, run);
    } else if (back !== 0) {
      run = 0;
    }
  }
  return best;
}

// Fraction of scheduled habits completed on a day, or null if none scheduled.
export function dayProgress(habits, completions, key) {
  let scheduled = 0;
  let done = 0;
  for (const h of habits) {
    if (!isScheduled(h, key)) continue;
    scheduled += 1;
    if (isDone(completions, h.id, key)) done += 1;
  }
  return scheduled === 0 ? null : done / scheduled;
}

// Completion rate for one habit over the last `n` days.
export function habitRate(habit, completions, n = 30) {
  let scheduled = 0;
  let done = 0;
  for (let back = 0; back < n; back++) {
    const key = dayKey(daysAgo(back));
    if (!isScheduled(habit, key)) continue;
    // today only counts once completed, so an early check doesn't sting
    if (back === 0 && !isDone(completions, habit.id, key)) continue;
    scheduled += 1;
    if (isDone(completions, habit.id, key)) done += 1;
  }
  return scheduled === 0 ? null : done / scheduled;
}

export function perfectDays(habits, completions, n = 30) {
  let count = 0;
  for (let back = 0; back < n; back++) {
    const p = dayProgress(habits, completions, dayKey(daysAgo(back)));
    if (p === 1) count += 1;
  }
  return count;
}

export function totalCompletions(completions, n = 30) {
  let count = 0;
  for (let back = 0; back < n; back++) {
    const map = completions[dayKey(daysAgo(back))];
    if (map) count += Object.keys(map).length;
  }
  return count;
}

// Grid for the trailing heatmap: `weeks` columns × 7 rows, ending today.
export function heatmapWeeks(habits, completions, weeks = 12) {
  const today = new Date();
  const tail = 6 - today.getDay();
  const totalDays = weeks * 7 - tail;
  const cells = [];
  for (let back = totalDays - 1; back >= 0; back--) {
    const key = dayKey(daysAgo(back));
    cells.push({
      key,
      progress: dayProgress(habits, completions, key),
      isToday: key === todayKey(),
    });
  }
  for (let i = 0; i < tail; i++) cells.push({ key: `pad-${i}`, pad: true });
  const cols = [];
  for (let w = 0; w < weeks; w++) cols.push(cells.slice(w * 7, w * 7 + 7));
  return cols;
}
