// The heart of the world: every memory is stored on-device (AsyncStorage).
// No account, no cloud — your sky belongs to you.

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';
import { analyzeSentiment } from '../utils/sentiment';

const MEM_KEY = 'moodscape.memories.v2';
const SET_KEY = 'moodscape.settings.v2';

const MemoryContext = createContext(null);

const dayMs = 24 * 60 * 60 * 1000;

function sampleMemories() {
  const now = Date.now();
  const mk = (id, daysAgo, mood, journal, weatherType, weatherLabel, weatherEmoji) => ({
    id,
    createdAt: now - daysAgo * dayMs - 3600000 * 5,
    mood,
    journal,
    tags: [],
    weather: { type: weatherType, label: weatherLabel, emoji: weatherEmoji },
    photo: null,
    voice: null,
    place: null,
    sample: true,
    sentiment: analyzeSentiment(journal),
  });
  return [
    mk(
      'sample-inspired', 1, 'inspired',
      'Stayed up sketching ideas for the app I want to build. Tired but my head is full of light. This might actually become something beautiful.',
      'clear', 'Clear', '🌤️'
    ),
    mk(
      'sample-peaceful', 3, 'peaceful',
      'Slow morning. Tea, open window, birds somewhere outside. No plans and for once that felt like enough.',
      'clear', 'Clear', '☀️'
    ),
    mk(
      'sample-happy', 6, 'happy',
      'Called an old friend and we laughed for an hour about nothing. Grateful for people who feel like sunshine.',
      'clouds', 'Cloudy', '☁️'
    ),
  ];
}

export function MemoryProvider({ children }) {
  const [memories, setMemories] = useState(null);
  const [settings, setSettings] = useState({ sound: true, greeted: false });
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawMem, rawSet] = await Promise.all([
          AsyncStorage.getItem(MEM_KEY),
          AsyncStorage.getItem(SET_KEY),
        ]);
        if (rawMem === null) {
          setMemories(sampleMemories());
        } else {
          setMemories(JSON.parse(rawMem));
        }
        if (rawSet) setSettings((s) => ({ ...s, ...JSON.parse(rawSet) }));
      } catch {
        setMemories(sampleMemories());
      }
    })();
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    if (memories !== null) {
      AsyncStorage.setItem(MEM_KEY, JSON.stringify(memories)).catch(() => {});
    }
  }, [memories]);

  useEffect(() => {
    AsyncStorage.setItem(SET_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const addMemory = useCallback((memory) => {
    setMemories((prev) => [memory, ...(prev || [])]);
  }, []);

  const deleteMemory = useCallback((id) => {
    setMemories((prev) => (prev || []).filter((m) => m.id !== id));
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      memories: memories || [],
      loaded: memories !== null,
      addMemory,
      deleteMemory,
      settings,
      updateSettings,
      weather,
      setWeather,
      place,
      setPlace,
      reduceMotion,
    }),
    [memories, settings, weather, place, reduceMotion, addMemory, deleteMemory, updateSettings]
  );

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>;
}

export function useMemories() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemories must be used inside MemoryProvider');
  return ctx;
}
