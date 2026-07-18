// Time-of-day sky palettes. The whole world breathes with the hour:
// warm sunrise, bright afternoon, golden evening, starlit night with aurora.

import { mix } from './colors';

// keyframes through a 24h cycle
const STOPS = [
  { h: 0.0,  top: '#070b1f', mid: '#0d1533', bot: '#1a2450', night: 1.0,  orb: 0.72, orbColor: '#e9edff', label: 'Night' },
  { h: 4.5,  top: '#0a1028', mid: '#18224d', bot: '#3a3a72', night: 0.9,  orb: 0.55, orbColor: '#e9edff', label: 'Before dawn' },
  { h: 6.0,  top: '#2a3468', mid: '#c96f9b', bot: '#f7b267', night: 0.15, orb: 0.20, orbColor: '#ffd9a0', label: 'Sunrise' },
  { h: 8.0,  top: '#3d7dc4', mid: '#79b5e8', bot: '#cfe8ff', night: 0.0,  orb: 0.42, orbColor: '#fff4d6', label: 'Morning' },
  { h: 12.5, top: '#2f6fc4', mid: '#6fb3ec', bot: '#d9f0ff', night: 0.0,  orb: 0.85, orbColor: '#fff8e2', label: 'Afternoon' },
  { h: 16.5, top: '#356fb5', mid: '#8fb8e8', bot: '#e8e4ff', night: 0.0,  orb: 0.55, orbColor: '#fff2ce', label: 'Afternoon' },
  { h: 18.2, top: '#3b3f7a', mid: '#e08a8a', bot: '#ffc98a', night: 0.1,  orb: 0.24, orbColor: '#ffcf9e', label: 'Golden hour' },
  { h: 20.0, top: '#141b3d', mid: '#4a3f78', bot: '#b06a8f', night: 0.55, orb: 0.35, orbColor: '#f4e9ff', label: 'Dusk' },
  { h: 21.8, top: '#070b1f', mid: '#0d1533', bot: '#1a2450', night: 1.0,  orb: 0.62, orbColor: '#e9edff', label: 'Night' },
  { h: 24.0, top: '#070b1f', mid: '#0d1533', bot: '#1a2450', night: 1.0,  orb: 0.72, orbColor: '#e9edff', label: 'Night' },
];

const lerp = (a, b, t) => a + (b - a) * t;

export function skyForHour(hour) {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < STOPS.length - 2 && STOPS[i + 1].h <= h) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = Math.max(0, Math.min(1, (h - a.h) / (b.h - a.h || 1)));
  return {
    top: mix(a.top, b.top, t),
    mid: mix(a.mid, b.mid, t),
    bot: mix(a.bot, b.bot, t),
    night: lerp(a.night, b.night, t),
    orb: lerp(a.orb, b.orb, t),
    orbColor: mix(a.orbColor, b.orbColor, t),
    isMoon: lerp(a.night, b.night, t) > 0.4,
    label: t < 0.5 ? a.label : b.label,
  };
}

// Real weather bends the light.
export function applyWeather(pal, type) {
  if (!type) return pal;
  const p = { ...pal };
  const tintAll = (color, amt) => {
    p.top = mix(p.top, color, amt);
    p.mid = mix(p.mid, color, amt);
    p.bot = mix(p.bot, color, amt);
  };
  switch (type) {
    case 'clouds': tintAll('#8a97ad', 0.22); break;
    case 'fog':    tintAll('#aab4c4', 0.42); break;
    case 'rain':   tintAll('#5d6b85', 0.32); break;
    case 'drizzle': tintAll('#6d7b95', 0.25); break;
    case 'snow':   tintAll('#c9d6e8', 0.35); break;
    case 'storm':  tintAll('#272d42', 0.5); p.night = Math.min(1, p.night + 0.25); break;
    default: break;
  }
  return p;
}
