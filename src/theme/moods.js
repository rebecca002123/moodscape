// The emotional palette. Each mood is a piece of liquid glass: a gradient,
// a glow, and a score used for charts and streak math.

export const MOODS = {
  radiant: {
    key: 'radiant',
    label: 'Radiant',
    score: 6,
    gradient: ['#FFE08A', '#FF9E64'],
    glow: '#FFC46B',
    tint: '#FFB35C',
  },
  happy: {
    key: 'happy',
    label: 'Happy',
    score: 5,
    gradient: ['#7CF29C', '#2BC8A5'],
    glow: '#4FE3B0',
    tint: '#35D3A2',
  },
  calm: {
    key: 'calm',
    label: 'Calm',
    score: 4,
    gradient: ['#8AD8FF', '#6E8BFF'],
    glow: '#7FB5FF',
    tint: '#6E9BFF',
  },
  meh: {
    key: 'meh',
    label: 'Meh',
    score: 3,
    gradient: ['#D7DEEA', '#9AA7BD'],
    glow: '#B9C3D6',
    tint: '#A3AFC4',
  },
  low: {
    key: 'low',
    label: 'Low',
    score: 2,
    gradient: ['#9BB0EF', '#5F74C9'],
    glow: '#7D90DD',
    tint: '#6C7FD2',
  },
  stormy: {
    key: 'stormy',
    label: 'Stormy',
    score: 1,
    gradient: ['#A78BFA', '#5B4B9E'],
    glow: '#8A70D6',
    tint: '#7B63C4',
  },
};

export const MOOD_ORDER = ['radiant', 'happy', 'calm', 'meh', 'low', 'stormy'];

export const TAGS = [
  'Work', 'Friends', 'Family', 'Love', 'Health', 'Sleep',
  'Exercise', 'Food', 'Weather', 'Music', 'Travel', 'Study',
];

const clamp01 = (t) => Math.min(1, Math.max(0, t));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function lerpColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const k = clamp01(t);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// Continuous score → color, blending through the mood anchors (1..6).
const SCALE = MOOD_ORDER.slice().reverse().map((k) => MOODS[k].tint);

export function scoreColor(score) {
  const s = Math.min(6, Math.max(1, score)) - 1; // 0..5
  const i = Math.min(SCALE.length - 2, Math.floor(s));
  return lerpColor(SCALE[i], SCALE[i + 1], s - i);
}

export function moodForScore(score) {
  let best = MOOD_ORDER[0];
  let dist = Infinity;
  for (const key of MOOD_ORDER) {
    const d = Math.abs(MOODS[key].score - score);
    if (d < dist) { dist = d; best = key; }
  }
  return MOODS[best];
}
