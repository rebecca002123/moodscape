import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '../state/store';

// Prism's Liquid Glass material. Every translucent pane is built from the
// same recipe: a real blur, a whisper of fill, a hairline stroke, a bright
// specular top edge, and a soft shadow that lifts it off the light field.
// Prism's signature is the spectrum: thin rainbow refractions on hero glass.

export const SPECTRUM = ['#22D3EE', '#818CF8', '#E879F9', '#FB7185', '#FBBF24'];

const dark = {
  scheme: 'dark',
  bg: '#05070F',
  bgSoft: '#0A0E1E',
  text: '#F3F5FF',
  textSecondary: 'rgba(230,235,255,0.62)',
  textTertiary: 'rgba(230,235,255,0.38)',
  glass: {
    blurTint: 'dark',
    intensity: 46,
    fill: 'rgba(140,160,255,0.07)',
    fillStrong: 'rgba(140,160,255,0.13)',
    stroke: 'rgba(255,255,255,0.13)',
    specular: 'rgba(255,255,255,0.55)',
    shadow: '#000000',
    shadowOpacity: 0.5,
  },
  beams: [
    { color: '#22D3EE', opacity: 0.30 },
    { color: '#8B5CF6', opacity: 0.34 },
    { color: '#EC4899', opacity: 0.22 },
    { color: '#F59E0B', opacity: 0.16 },
  ],
  input: 'rgba(255,255,255,0.06)',
  ringTrack: 'rgba(255,255,255,0.10)',
  danger: '#FF7A8A',
};

const light = {
  scheme: 'light',
  bg: '#EDF0FA',
  bgSoft: '#F6F8FF',
  text: '#0F1326',
  textSecondary: 'rgba(20,26,54,0.60)',
  textTertiary: 'rgba(20,26,54,0.38)',
  glass: {
    blurTint: 'light',
    intensity: 54,
    fill: 'rgba(255,255,255,0.44)',
    fillStrong: 'rgba(255,255,255,0.64)',
    stroke: 'rgba(255,255,255,0.9)',
    specular: 'rgba(255,255,255,0.98)',
    shadow: '#26305C',
    shadowOpacity: 0.16,
  },
  beams: [
    { color: '#67E8F9', opacity: 0.55 },
    { color: '#C4B5FD', opacity: 0.60 },
    { color: '#F9A8D4', opacity: 0.45 },
    { color: '#FDE68A', opacity: 0.40 },
  ],
  input: 'rgba(255,255,255,0.6)',
  ringTrack: 'rgba(20,26,54,0.10)',
  danger: '#E5484D',
};

// SF-flavoured type scale (system font renders SF on iOS).
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: 0.2 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.2 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.4 },
};

export const radius = {
  card: 26,
  control: 16,
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

export const useTheme = () => useContext(ThemeContext);
