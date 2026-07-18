// Lumi — the little orb of light that lives in your world.
// All insights are grown on-device from your own islands. Nothing leaves the phone.

import { moodFor } from '../utils/moods';

export const MILESTONES = [
  { count: 1, label: 'First island', desc: 'Your world has begun' },
  { count: 5, label: 'Distant mountains', desc: 'Silhouettes rise on the horizon' },
  { count: 10, label: 'Firefly swarms', desc: 'Golden lights wander the sky' },
  { count: 15, label: 'Ever-aurora', desc: 'Auroras visit even at dusk' },
  { count: 25, label: 'Floating city', desc: 'A far city of glass appears' },
  { count: 50, label: 'Crystal continent', desc: 'Your islands form a continent' },
  { count: 100, label: 'Peaks of memory', desc: 'Snow-capped giants at the edge' },
  { count: 365, label: 'A year of you', desc: 'A full orbit of feeling' },
  { count: 1000, label: 'Living continent', desc: 'An entire world, grown by hand' },
];

export function nextMilestone(count) {
  return MILESTONES.find((m) => m.count > count) || null;
}

const dayMs = 24 * 60 * 60 * 1000;

function streakOf(memories) {
  if (!memories.length) return 0;
  const days = new Set(memories.map((m) => new Date(m.createdAt).toDateString()));
  let streak = 0;
  let d = new Date();
  if (!days.has(d.toDateString())) d = new Date(d.getTime() - dayMs);
  while (days.has(d.toDateString())) {
    streak++;
    d = new Date(d.getTime() - dayMs);
  }
  return streak;
}

export function buildInsights(memories) {
  const out = [];
  const n = memories.length;

  if (n === 0) {
    out.push({
      icon: '🌱',
      title: 'An empty sky',
      body: 'Every world starts with a single feeling. Tap + and plant your first island.',
    });
    return out;
  }

  const streak = streakOf(memories);
  if (streak >= 2) {
    out.push({
      icon: '🔥',
      title: `${streak} days in a row`,
      body: 'You keep showing up for yourself. Your sky is glowing because of it.',
    });
  }

  // dominant mood, last 7 days
  const week = memories.filter((m) => Date.now() - m.createdAt < 7 * dayMs);
  if (week.length >= 2) {
    const counts = {};
    week.forEach((m) => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const mood = moodFor(top);
    out.push({
      icon: mood.emoji,
      title: `This week feels ${mood.label.toLowerCase()}`,
      body:
        top === 'sad' || top === 'anxious'
          ? `${mood.whisper} Be gentle with yourself — heavier islands still make a beautiful world.`
          : `${mood.whisper} Notice what has been feeding it, and keep a little of it close.`,
    });
  }

  // sentiment drift
  const withTone = memories.filter((m) => m.sentiment && m.sentiment.score !== 0).slice(0, 8);
  if (withTone.length >= 3) {
    const recent = withTone.slice(0, 4).reduce((s, m) => s + m.sentiment.score, 0) / Math.min(4, withTone.length);
    const older = withTone.slice(4).reduce((s, m) => s + m.sentiment.score, 0) / Math.max(1, withTone.length - 4);
    if (withTone.length >= 5 && recent - older > 0.25) {
      out.push({ icon: '🌤️', title: 'Your words are getting lighter', body: 'The tone of your recent entries has lifted. Whatever you are doing — it is working.' });
    } else if (withTone.length >= 5 && older - recent > 0.25) {
      out.push({ icon: '🫂', title: 'A heavier chapter', body: 'Your recent words carry more weight. That is allowed. Islands made of rain are still islands.' });
    }
  }

  // recurring themes
  const kw = {};
  memories.slice(0, 30).forEach((m) => (m.sentiment?.keywords || []).forEach((k) => { kw[k] = (kw[k] || 0) + 1; }));
  const topKw = Object.entries(kw).sort((a, b) => b[1] - a[1])[0];
  if (topKw && topKw[1] >= 2) {
    out.push({ icon: '🧵', title: `"${topKw[0]}" keeps appearing`, body: 'A thread running through your recent memories. Threads are worth following.' });
  }

  // resurface an old memory
  if (n >= 3) {
    const old = memories[memories.length - 1 - Math.floor(Math.random() * Math.min(3, n - 1))];
    const mood = moodFor(old.mood);
    const date = new Date(old.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    out.push({
      icon: '🕰️',
      title: 'A memory worth revisiting',
      body: `On ${date} you felt ${mood.label.toLowerCase()}. Want to fly back to that island?`,
      flyTo: old.id,
    });
  }

  if (out.length < 3) {
    out.push({
      icon: '🙏',
      title: 'A gentle prompt',
      body: 'Before today ends: name one small thing that went right. Even tiny light grows an island.',
    });
  }

  return out.slice(0, 4);
}
