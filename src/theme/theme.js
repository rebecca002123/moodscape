import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '../state/store';

// Liquid Glass material tokens. Every translucent surface in the app is
// built from these: a blur, a whisper of fill, a bright specular top edge
// and a soft outer shadow that lifts the pane off the background.

const dark = {
  scheme: 'dark',
  bg: '#070B1A',
  bgSoft: '#0B1126',
  text: '#F4F6FF',
  textSecondary: 'rgba(232,236,255,0.62)',
  textTertiary: 'rgba(232,236,255,0.38)',
  separator: 'rgba(255,255,255,0.08)',
  glass: {
    blurTint: 'dark',
    intensity: 44,
    fill: 'rgba(148,164,255,0.075)',
    fillStrong: 'rgba(148,164,255,0.13)',
    stroke: 'rgba(255,255,255,0.14)',
    specular: 'rgba(255,255,255,0.55)',
    shadow: '#000000',
    shadowOpacity: 0.45,
  },
  aurora: [
    { color: '#3D2E8F', opacity: 0.55 },
    { color: '#1E4FA3', opacity: 0.45 },
    { color: '#7C3AA6', opacity: 0.34 },
    { color: '#0E6B72', opacity: 0.30 },
  ],
  input: 'rgba(255,255,255,0.06)',
  danger: '#FF7A8A',
};

const light = {
  scheme: 'light',
  bg: '#E9EEFB',
  bgSoft: '#F3F6FF',
  text: '#111528',
  textSecondary: 'rgba(24,30,58,0.60)',
  textTertiary: 'rgba(24,30,58,0.38)',
  separator: 'rgba(20,28,60,0.08)',
  glass: {
    blurTint: 'light',
    intensity: 52,
    fill: 'rgba(255,255,255,0.42)',
    fillStrong: 'rgba(255,255,255,0.62)',
    stroke: 'rgba(255,255,255,0.85)',
    specular: 'rgba(255,255,255,0.95)',
    shadow: '#2A3567',
    shadowOpacity: 0.16,
  },
  aurora: [
    { color: '#AEB8FF', opacity: 0.75 },
    { color: '#9FD4FF', opacity: 0.65 },
    { color: '#E3B8FF', opacity: 0.50 },
    { color: '#A8F0E0', opacity: 0.45 },
  ],
  input: 'rgba(255,255,255,0.55)',
  danger: '#E5484D',
};

// An SF-flavoured type scale (system font renders SF on iOS).
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: 0.2 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.2 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.1 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.3 },
};

export const radius = {
  card: 28,
  control: 18,
  capsule: 999,
};

const ThemeContext = createContext(dark);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const { settings } = useSettings();
  const scheme = settings.appearance === 'auto' ? (system ?? 'dark') : settings.appearance;
  const value = useMemo(() => (scheme === 'light' ? light : dark), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
