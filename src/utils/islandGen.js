// Procedural island generation.
// Mood, weather, season, hour and the feeling inside the journal
// all shape what grows on the glass. No two islands are ever alike.

import { makeRng } from './rng';
import { moodFor } from './moods';
import { shiftHue, lighten, darken } from './colors';

const FLOWER_COLORS = ['#ffd9ec', '#fff6bf', '#c9f2ff', '#e4d4ff', '#c8ffd9'];

function seasonOf(ts) {
  const m = new Date(ts).getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

export function generateIsland(memory) {
  const rng = makeRng(`island:${memory.id}`);
  const mood = moodFor(memory.mood);
  const hue = rng.range(-14, 14);
  const sentiment = memory.sentiment?.score ?? 0;
  const season = seasonOf(memory.createdAt);
  const hour = new Date(memory.createdAt).getHours();
  const isNight = hour >= 20 || hour <= 5;
  const weather = memory.weather?.type || 'clear';

  const colors = {
    base: shiftHue(mood.base, hue),
    accent: shiftHue(mood.accent, hue),
    glow: mood.glow,
    leaf: shiftHue(mood.leaf, hue),
    water: shiftHue(mood.water, hue * 0.5),
    rim: lighten(mood.base, 0.28),
    root: darken(shiftHue(mood.accent, hue), 0.05),
  };

  // ---- feature sets per mood ----
  const t = {
    scale: rng.range(0.92, 1.1),
    trees: [],
    crystals: [],
    flowers: [],
    lake: false,
    waterfall: false,
    rain: false,
    snowCap: false,
    aurora: false,
    fragments: [],
    fog: false,
    birds: 0,
    butterflies: 0,
    lanterns: 0,
    fireflies: 0,
    broken: false,
    mist: false,
    glowStrength: 0.9,
    floatDur: rng.int(3800, 5600),
  };

  const onPlatform = () => ({ x: rng.range(52, 188), y: rng.range(74, 102) });

  switch (mood.key) {
    case 'happy': {
      const n = rng.int(2, 4);
      for (let i = 0; i < n; i++) t.trees.push({ ...onPlatform(), s: rng.range(0.7, 1.15) });
      for (let i = 0; i < rng.int(4, 7); i++)
        t.flowers.push({ ...onPlatform(), s: rng.range(0.7, 1.2), c: rng.pick(FLOWER_COLORS) });
      t.butterflies = rng.int(1, 3);
      t.birds = rng.int(0, 2);
      break;
    }
    case 'excited': {
      t.waterfall = true;
      for (let i = 0; i < rng.int(2, 4); i++)
        t.crystals.push({ ...onPlatform(), s: rng.range(0.9, 1.5) });
      if (rng.chance(0.6)) t.trees.push({ ...onPlatform(), s: rng.range(0.6, 0.9) });
      for (let i = 0; i < rng.int(2, 4); i++)
        t.flowers.push({ ...onPlatform(), s: rng.range(0.6, 1), c: rng.pick(FLOWER_COLORS) });
      t.birds = rng.int(1, 2);
      break;
    }
    case 'peaceful': {
      t.lake = true;
      t.fog = true;
      for (let i = 0; i < rng.int(1, 3); i++) t.trees.push({ ...onPlatform(), s: rng.range(0.55, 0.95) });
      for (let i = 0; i < rng.int(3, 5); i++)
        t.flowers.push({ ...onPlatform(), s: rng.range(0.5, 0.9), c: rng.pick(FLOWER_COLORS) });
      t.birds = rng.int(1, 3);
      break;
    }
    case 'sad': {
      t.rain = true;
      t.broken = true;
      for (let i = 0; i < rng.int(2, 3); i++)
        t.crystals.push({ ...onPlatform(), s: rng.range(0.7, 1.2), broken: true });
      if (rng.chance(0.5)) t.trees.push({ ...onPlatform(), s: rng.range(0.5, 0.8), bare: true });
      t.glowStrength = 0.55;
      break;
    }
    case 'anxious': {
      for (let i = 0; i < rng.int(4, 6); i++)
        t.fragments.push({ a: rng.range(0, Math.PI * 2), r: rng.range(88, 118), s: rng.range(0.6, 1.3) });
      t.fog = true;
      t.mist = true;
      for (let i = 0; i < rng.int(1, 2); i++)
        t.crystals.push({ ...onPlatform(), s: rng.range(0.6, 1) });
      t.glowStrength = 0.65;
      break;
    }
    case 'inspired': {
      t.aurora = true;
      t.waterfall = rng.chance(0.7);
      t.trees.push({ ...onPlatform(), s: rng.range(1.1, 1.4), bloom: true });
      for (let i = 0; i < rng.int(2, 3); i++)
        t.crystals.push({ ...onPlatform(), s: rng.range(0.8, 1.4), tower: true });
      for (let i = 0; i < rng.int(2, 5); i++)
        t.flowers.push({ ...onPlatform(), s: rng.range(0.6, 1.1), c: rng.pick(FLOWER_COLORS) });
      t.butterflies = rng.int(0, 2);
      break;
    }
  }

  // ---- the journal's tone shapes the land ----
  if (sentiment > 0.25) {
    for (let i = 0; i < 2; i++)
      t.flowers.push({ ...onPlatform(), s: rng.range(0.6, 1), c: rng.pick(FLOWER_COLORS) });
    t.glowStrength = Math.min(1.15, t.glowStrength + 0.2);
  } else if (sentiment < -0.25) {
    t.mist = true;
    t.glowStrength = Math.max(0.45, t.glowStrength - 0.2);
  }

  // ---- weather & season leave marks ----
  if (weather === 'rain' || weather === 'drizzle' || weather === 'storm') t.rain = true;
  if (weather === 'snow' || (season === 'winter' && rng.chance(0.4))) t.snowCap = true;
  if (season === 'spring')
    for (let i = 0; i < 2; i++)
      t.flowers.push({ ...onPlatform(), s: rng.range(0.5, 0.9), c: rng.pick(FLOWER_COLORS) });
  if (season === 'autumn') colors.leaf = shiftHue('#e8a25e', hue * 0.4);

  // ---- night memories glow ----
  if (isNight) {
    t.lanterns = rng.int(2, 4);
    t.fireflies = rng.int(3, 6);
  }
  if (t.aurora && isNight) t.glowStrength = Math.min(1.2, t.glowStrength + 0.15);

  return { colors, traits: t, mood };
}
