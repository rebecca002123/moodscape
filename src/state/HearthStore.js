// The hearth's memory: every finished focus session is stored on-device
// (AsyncStorage). No account, no cloud — your fire belongs to you.

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';

const SESSIONS_KEY = 'ember.sessions.v1';

const HearthContext = createContext(null);

function dayStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeStreak(sessions, now = Date.now()) {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map((s) => dayStart(s.endedAt)));
  const dayMs = 24 * 60 * 60 * 1000;
  // A streak counts back from today — or from yesterday, so it isn't
  // broken just because tonight's fire hasn't been lit yet.
  let cursor = dayStart(now);
  if (!days.has(cursor)) cursor -= dayMs;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= dayMs;
  }
  return streak;
}

export function HearthProvider({ children }) {
  const [sessions, setSessions] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSIONS_KEY);
        setSessions(raw === null ? [] : JSON.parse(raw));
      } catch {
        setSessions([]);
      }
    })();
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    if (sessions !== null) {
      AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)).catch(() => {});
    }
  }, [sessions]);

  const addSession = useCallback((minutes) => {
    const session = {
      id: `fire-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      endedAt: Date.now(),
      minutes,
    };
    setSessions((prev) => [...(prev || []), session]);
    return session;
  }, []);

  const value = useMemo(() => {
    const list = sessions || [];
    const today = list.filter((s) => dayStart(s.endedAt) === dayStart(Date.now()));
    return {
      sessions: list,
      loaded: sessions !== null,
      addSession,
      totalMinutes: list.reduce((sum, s) => sum + s.minutes, 0),
      todayMinutes: today.reduce((sum, s) => sum + s.minutes, 0),
      streak: computeStreak(list),
      reduceMotion,
    };
  }, [sessions, reduceMotion, addSession]);

  return <HearthContext.Provider value={value}>{children}</HearthContext.Provider>;
}

export function useHearth() {
  const ctx = useContext(HearthContext);
  if (!ctx) throw new Error('useHearth must be used inside HearthProvider');
  return ctx;
}
