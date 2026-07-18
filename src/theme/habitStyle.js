// The palette a habit can wear: gradient glass in eight hues,
// plus the icon set drawn in src/components/icons.js.

export const HABIT_COLORS = {
  aqua: { key: 'aqua', gradient: ['#5EEAD4', '#0EA5E9'], glow: '#2DD4BF' },
  sky: { key: 'sky', gradient: ['#7DD3FC', '#3B82F6'], glow: '#60A5FA' },
  violet: { key: 'violet', gradient: ['#C4B5FD', '#7C3AED'], glow: '#A78BFA' },
  pink: { key: 'pink', gradient: ['#F9A8D4', '#DB2777'], glow: '#F472B6' },
  rose: { key: 'rose', gradient: ['#FDA4AF', '#E11D48'], glow: '#FB7185' },
  amber: { key: 'amber', gradient: ['#FDE68A', '#F59E0B'], glow: '#FBBF24' },
  lime: { key: 'lime', gradient: ['#BEF264', '#16A34A'], glow: '#84CC16' },
  slate: { key: 'slate', gradient: ['#CBD5E1', '#64748B'], glow: '#94A3B8' },
};

export const COLOR_ORDER = ['aqua', 'sky', 'violet', 'pink', 'rose', 'amber', 'lime', 'slate'];

export const ICON_ORDER = [
  'water', 'run', 'walk', 'gym', 'read', 'write', 'code', 'music',
  'meditate', 'sleep', 'sun', 'leaf', 'heart', 'money', 'nophone', 'clean',
];

export const habitColor = (key) => HABIT_COLORS[key] || HABIT_COLORS.aqua;

// Starter habits offered on the empty state.
export const PRESETS = [
  { name: 'Drink water', icon: 'water', color: 'aqua' },
  { name: 'Move 30 minutes', icon: 'run', color: 'amber' },
  { name: 'Read 10 pages', icon: 'read', color: 'violet' },
  { name: 'Meditate', icon: 'meditate', color: 'sky' },
  { name: 'Lights out by 11', icon: 'sleep', color: 'pink' },
  { name: 'Touch grass', icon: 'leaf', color: 'lime' },
];
