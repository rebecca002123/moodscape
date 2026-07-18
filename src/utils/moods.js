// The six core emotions. Each one grows a different kind of island.

export const MOODS = {
  happy: {
    key: 'happy',
    emoji: '😊',
    label: 'Happy',
    base: '#ffd97a',
    accent: '#ff9ecb',
    glow: '#fff3c4',
    leaf: '#7ee8a2',
    water: '#9adfff',
    whisper: 'Sunshine bottled into glass.',
  },
  excited: {
    key: 'excited',
    emoji: '🤩',
    label: 'Excited',
    base: '#ffb36b',
    accent: '#7af2ff',
    glow: '#ffe9b0',
    leaf: '#a0f2c8',
    water: '#a8ecff',
    whisper: 'Energy crackling like falling water.',
  },
  peaceful: {
    key: 'peaceful',
    emoji: '😌',
    label: 'Peaceful',
    base: '#a8d8ff',
    accent: '#c3f0d8',
    glow: '#e8f7ff',
    leaf: '#b8e6cf',
    water: '#bfe9ff',
    whisper: 'Still water, soft light.',
  },
  sad: {
    key: 'sad',
    emoji: '😔',
    label: 'Sad',
    base: '#8fa8c8',
    accent: '#6f86b8',
    glow: '#cfe0ff',
    leaf: '#9db8d4',
    water: '#a9c4e8',
    whisper: 'Gentle rain helps things grow, too.',
  },
  anxious: {
    key: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    base: '#9a93c8',
    accent: '#8e87d8',
    glow: '#d8d2ff',
    leaf: '#aaa4d8',
    water: '#b8b2e8',
    whisper: 'Storm clouds pass. The island holds.',
  },
  inspired: {
    key: 'inspired',
    emoji: '✨',
    label: 'Inspired',
    base: '#b28dff',
    accent: '#7de3ff',
    glow: '#efe0ff',
    leaf: '#c8a8ff',
    water: '#a8e8ff',
    whisper: 'Auroras bloom where ideas live.',
  },
};

export const MOOD_LIST = Object.values(MOODS);

export function moodFor(key) {
  return MOODS[key] || MOODS.peaceful;
}
