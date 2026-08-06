// The route ahead: Summit's forecast engine.
//
// Everything here is an honest estimate built from two things only:
//   1. The trail behind you — the trend in the scores you've logged.
//   2. Widely-published scoring patterns with predictable timing — hard
//      inquiries stop counting after ~12 months, new-account drag lifts
//      after ~6, late payments sting less at 1–2 years and fall off a
//      report near 7, and a clean payment streak lifts slowly all along.
//
// It is deliberately NOT a bureau's formula (those are proprietary), so
// every number is a range, every range widens with distance, and the app
// says so out loud. Pure functions, no imports from React — testable anywhere.

import { clampScore, addMonths, monthsBetween, formatMonth, formatDate, formatDelta, DAY_MS } from './scoreMath';

export const HORIZON_MONTHS = 12;

// ── The trail behind you ────────────────────────────────────────────────

// Weighted least-squares slope (points per month) over the last few logged
// scores. Recent entries weigh more; a slope needs at least 3 entries over
// 3+ weeks to be trusted at all, and is clamped to ±10 pts/month.
export function trendPerMonth(entries, now) {
  const recent = entries.slice(-6);
  if (recent.length < 3) return null;
  const spanMs = recent[recent.length - 1].ts - recent[0].ts;
  if (spanMs < 21 * DAY_MS) return null;

  let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  recent.forEach((e, i) => {
    const x = monthsBetween(now, e.ts); // negative: months ago
    const y = e.score;
    const w = 1 + i * 0.5; // newer entries count more
    sw += w; sx += w * x; sy += w * y; sxx += w * x * x; sxy += w * x * y;
  });
  const denom = sw * sxx - sx * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const slope = (sw * sxy - sx * sy) / denom;
  return Math.max(-10, Math.min(10, slope));
}

// A momentum trend can't be extrapolated for a year. Its influence decays
// geometrically: month k contributes slope × 0.78^k, so the total effect of
// any trend is bounded (~3.5 months' worth) no matter the horizon.
function decayedTrendMonths(m) {
  let total = 0;
  for (let k = 1; k <= m; k++) total += Math.pow(0.78, k);
  return total;
}

// ── The slow, structural climb (or slide) ───────────────────────────────

// Passive drift per month from the shape of the file itself: a clean,
// aging file drifts gently up; fresh dents drag it down. Returned as a
// [lo, hi] range in points per month.
export function structuralDrift(factors, now) {
  let lo = 0;
  let hi = 0;
  const lates = factors.lates || [];
  const inquiries = factors.inquiries || [];
  const newAccounts = factors.newAccounts || [];

  const lateWithinYear = lates.some((l) => monthsBetween(l.ts, now) < 12);
  if (!lateWithinYear) {
    // On-time history + accounts aging: the quiet engine of every climb.
    lo += 0.3;
    hi += 1.1;
  } else {
    // A recent late mutes the passive climb but time still helps a little.
    hi += 0.4;
  }

  if (factors.utilization != null) {
    if (factors.utilization <= 10) hi += 0.2;
    if (factors.utilization >= 75) { lo -= 0.4; hi -= 0.1; }
  }

  const freshAccounts = newAccounts.filter((a) => monthsBetween(a.ts, now) < 6).length;
  const freshInquiries = inquiries.filter((q) => monthsBetween(q.ts, now) < 12).length;
  if (freshAccounts > 0 || freshInquiries > 2) {
    lo -= 0.3;
    hi -= 0.1;
  }

  return { lo, hi };
}

// ── Waypoints: dated events with predictable timing ─────────────────────

// Each returns { id, ts, title, detail, deltaLo, deltaHi, kind }.
// Only waypoints inside (now, now + horizon] make the list.
export function buildWaypoints(factors, now) {
  const events = [];
  const horizonEnd = addMonths(now, HORIZON_MONTHS);
  const inWindow = (ts) => ts > now && ts <= horizonEnd;

  (factors.inquiries || []).forEach((q) => {
    const t = addMonths(q.ts, 12);
    if (inWindow(t)) {
      events.push({
        id: `wp-inq-${q.id}`,
        ts: t,
        deltaLo: 3,
        deltaHi: 7,
        kind: 'gain',
        title: 'Hard inquiry stops counting',
        detail: `The inquiry from ${formatMonth(q.ts)} no longer affects your score after about a year.`,
      });
    }
  });

  (factors.newAccounts || []).forEach((a) => {
    const t = addMonths(a.ts, 6);
    if (inWindow(t)) {
      events.push({
        id: `wp-new-${a.id}`,
        ts: t,
        deltaLo: 2,
        deltaHi: 6,
        kind: 'gain',
        title: 'New-account drag lifts',
        detail: `The account opened in ${formatMonth(a.ts)} stops reading as "new credit" around the six-month mark.`,
      });
    }
  });

  (factors.lates || []).forEach((l) => {
    const oneYear = addMonths(l.ts, 12);
    const twoYears = addMonths(l.ts, 24);
    const sevenYears = addMonths(l.ts, 84);
    if (inWindow(oneYear)) {
      events.push({
        id: `wp-late1-${l.id}`,
        ts: oneYear,
        deltaLo: 4,
        deltaHi: 10,
        kind: 'gain',
        title: 'Late payment hurts less',
        detail: `The late mark from ${formatMonth(l.ts)} loses much of its weight once it's a year old.`,
      });
    }
    if (inWindow(twoYears)) {
      events.push({
        id: `wp-late2-${l.id}`,
        ts: twoYears,
        deltaLo: 3,
        deltaHi: 8,
        kind: 'gain',
        title: 'Late payment fades further',
        detail: `Two years on, the ${formatMonth(l.ts)} late mark matters far less than fresh history.`,
      });
    }
    if (inWindow(sevenYears)) {
      events.push({
        id: `wp-late7-${l.id}`,
        ts: sevenYears,
        deltaLo: 10,
        deltaHi: 30,
        kind: 'gain',
        title: 'Late payment falls off your report',
        detail: `Roughly seven years after ${formatMonth(l.ts)}, the mark is removed entirely.`,
      });
    }
  });

  events.sort((a, b) => a.ts - b.ts);
  return events;
}

// ── Levers: gains that wait on a choice, not the calendar ───────────────

// These never enter the projection (the projection assumes you change
// nothing). They're shown separately as "paths you could take".
export function buildLevers(factors) {
  const levers = [];
  const u = factors.utilization;

  if (u == null) {
    levers.push({
      id: 'lever-util-unknown',
      title: 'Log your card utilization',
      detail: 'Utilization is the biggest fast-moving factor. Add yours and the route gets a firmer footing.',
      deltaLo: null,
      deltaHi: null,
    });
  } else if (u > 50) {
    levers.push({
      id: 'lever-util-high',
      title: `Pay balances down below 30%`,
      detail: `You're at ~${Math.round(u)}%. High utilization is usually the heaviest fast-moving weight — paying below 30% often shows up within one or two statement cycles (about 30–60 days).`,
      deltaLo: 15,
      deltaHi: 40,
    });
  } else if (u > 30) {
    levers.push({
      id: 'lever-util-mid',
      title: 'Bring utilization under 30%',
      detail: `You're at ~${Math.round(u)}%. Crossing under 30% typically helps within a statement cycle or two.`,
      deltaLo: 8,
      deltaHi: 20,
    });
  } else if (u > 10) {
    levers.push({
      id: 'lever-util-low',
      title: 'Nudge utilization under 10%',
      detail: `You're at ~${Math.round(u)}%. The scoring sweet spot sits below 10% — a smaller lift, but a real one.`,
      deltaLo: 3,
      deltaHi: 10,
    });
  }

  return levers;
}

// ── The projection itself ───────────────────────────────────────────────

// Base uncertainty: a cone that starts a few points wide and opens with
// distance, because a year is a long time on any mountain. Knowing your
// utilization removes real variance, so the cone narrows a little.
function uncertainty(m, factors) {
  if (m === 0) return 0;
  const scale = factors && factors.utilization != null ? 0.85 : 1;
  return (3 + 1.9 * m) * scale;
}

// Builds { points, waypoints, levers, verdict, goalEta } from logged
// entries, report factors, and an optional goal score. Returns null until
// at least one score is logged.
export function buildForecast({ entries, factors, goal, now = Date.now() }) {
  const sorted = [...(entries || [])].sort((a, b) => a.ts - b.ts);
  if (!sorted.length) return null;
  const f = factors || {};

  const current = clampScore(sorted[sorted.length - 1].score);
  const trend = trendPerMonth(sorted, now);
  const drift = structuralDrift(f, now);
  const waypoints = buildWaypoints(f, now);
  const levers = buildLevers(f);

  const points = [];
  let cumLo = 0;
  let cumHi = 0;
  for (let m = 0; m <= HORIZON_MONTHS; m++) {
    const ts = addMonths(now, m);
    if (m > 0) {
      // Drift is re-read for each projected month, so a dent that ages out
      // mid-horizon (a late crossing the one-year mark, say) stops muting
      // the climb from that month on.
      const dm = structuralDrift(f, addMonths(now, m - 1));
      cumLo += dm.lo;
      cumHi += dm.hi;
    }
    let evLo = 0;
    let evHi = 0;
    waypoints.forEach((w) => {
      if (w.ts <= ts) { evLo += w.deltaLo; evHi += w.deltaHi; }
    });
    const trendPart = trend != null ? trend * decayedTrendMonths(m) : 0;
    const u = uncertainty(m, f);
    const rawLo = current + trendPart + cumLo + evLo - u;
    const rawHi = current + trendPart + cumHi + evHi + u;
    const lo = clampScore(rawLo);
    const hi = clampScore(rawHi);
    const mid = clampScore((rawLo + rawHi) / 2);
    points.push({ ts, lo: Math.round(lo), mid: Math.round(mid), hi: Math.round(hi) });
  }

  const at = (m) => points[Math.min(m, points.length - 1)];
  const d3 = { lo: at(3).lo - current, hi: at(3).hi - current, mid: at(3).mid - current };
  const d12 = { lo: at(12).lo - current, hi: at(12).hi - current, mid: at(12).mid - current };

  let direction = 'flat';
  if (at(3).mid - current > 2) direction = 'up';
  else if (at(3).mid - current < -2) direction = 'down';

  // Why: the strongest forces at work, in plain words.
  const reasons = [];
  if (trend != null && Math.abs(trend) >= 1) {
    reasons.push(trend > 0
      ? `your logged scores are already climbing about ${Math.abs(trend).toFixed(0)} pts a month`
      : `your logged scores have been slipping about ${Math.abs(trend).toFixed(0)} pts a month`);
  }
  const latesRecent = (f.lates || []).some((l) => monthsBetween(l.ts, now) < 12);
  if (!latesRecent && drift.hi > 0.5) reasons.push('a clean payment streak keeps lifting you a little every month');
  if (latesRecent) reasons.push('a recent late payment is muting the climb for now');
  if (waypoints.length) {
    const next = waypoints[0];
    reasons.push(`${next.title.charAt(0).toLowerCase()}${next.title.slice(1)} around ${formatMonth(next.ts)} (${formatDelta(next.deltaLo, next.deltaHi)} pts)`);
  }
  if (f.utilization != null && f.utilization >= 75) reasons.push('very high utilization is dragging while balances stay up');

  // The headline quotes the central estimate; the stat tiles beside it carry
  // the full honest range, downside included.
  let headline;
  if (direction === 'up') {
    headline = `Climbing — on pace for about +${Math.max(1, d3.mid)} pts by ${formatMonth(at(3).ts)}`;
  } else if (direction === 'down') {
    headline = `Losing altitude — on pace for about −${Math.max(1, -d3.mid)} pts by ${formatMonth(at(3).ts)}`;
  } else {
    headline = `Holding steady — little change expected by ${formatMonth(at(3).ts)}`;
  }

  // Goal ETA: the first month the middle of the cone crosses the goal.
  let goalEta = null;
  if (goal != null && goal > current) {
    const hit = points.find((p) => p.mid >= goal);
    if (hit) {
      const m = points.indexOf(hit);
      goalEta = { ts: hit.ts, months: m, reachable: true };
    } else {
      goalEta = { ts: null, months: null, reachable: false };
    }
  } else if (goal != null && goal <= current) {
    goalEta = { ts: now, months: 0, reachable: true };
  }

  return {
    current,
    now,
    trend,
    drift,
    points,
    waypoints,
    levers,
    verdict: { direction, d3, d12, headline, reasons },
    goalEta,
  };
}
