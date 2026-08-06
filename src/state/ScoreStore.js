// The climb's ledger: every score you log and everything your report knows,
// stored on-device (AsyncStorage). No account, no cloud — Summit never sees
// your actual credit report, only what you tell it.

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, AppState } from 'react-native';
import { buildForecast } from '../utils/forecast';

const STORE_KEY = 'summit.state.v1';

const EMPTY_STATE = {
  entries: [],       // { id, ts, score, source }
  factors: {
    utilization: null,   // percent, 0–200 (over-limit happens)
    inquiries: [],       // { id, ts } — hard pulls
    newAccounts: [],     // { id, ts } — accounts opened
    lates: [],           // { id, ts } — late-payment marks
  },
  goal: null,
};

const ScoreContext = createContext(null);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function withDefaults(raw) {
  return {
    ...EMPTY_STATE,
    ...raw,
    factors: { ...EMPTY_STATE.factors, ...(raw?.factors || {}) },
  };
}

export function ScoreProvider({ children }) {
  const [state, setState] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  // If hydration ever fails, never auto-persist over the stored ledger — a
  // transient read error must not erase the real data underneath. The guard
  // lifts on the first deliberate user mutation.
  const hydrationFailed = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        setState(raw === null ? EMPTY_STATE : withDefaults(JSON.parse(raw)));
      } catch {
        hydrationFailed.current = true;
        setState(EMPTY_STATE);
      }
    })();
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    // Re-anchor "now" whenever the app returns to the foreground, so a
    // session left open for days doesn't render a stale forecast.
    const appSub = AppState.addEventListener?.('change', (s) => {
      if (s === 'active') setNowTick(Date.now());
    });
    return () => { sub?.remove?.(); appSub?.remove?.(); };
  }, []);

  useEffect(() => {
    if (state !== null && !hydrationFailed.current) {
      AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state]);

  const mutate = useCallback((fn) => {
    hydrationFailed.current = false;
    setState((prev) => (prev ? fn(prev) : prev));
  }, []);

  const addEntry = useCallback((score, ts, source) => {
    mutate((prev) => ({
      ...prev,
      entries: [...prev.entries, { id: makeId('score'), ts, score, source: source || null }],
    }));
  }, [mutate]);

  const removeEntry = useCallback((id) => {
    mutate((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  }, [mutate]);

  const setUtilization = useCallback((value) => {
    mutate((prev) => ({ ...prev, factors: { ...prev.factors, utilization: value } }));
  }, [mutate]);

  // kind: 'inquiries' | 'newAccounts' | 'lates'
  const addMark = useCallback((kind, ts) => {
    mutate((prev) => ({
      ...prev,
      factors: { ...prev.factors, [kind]: [...prev.factors[kind], { id: makeId(kind), ts }] },
    }));
  }, [mutate]);

  const removeMark = useCallback((kind, id) => {
    mutate((prev) => ({
      ...prev,
      factors: { ...prev.factors, [kind]: prev.factors[kind].filter((m) => m.id !== id) },
    }));
  }, [mutate]);

  const setGoal = useCallback((value) => {
    mutate((prev) => ({ ...prev, goal: value }));
  }, [mutate]);

  const value = useMemo(() => {
    const s = state || EMPTY_STATE;
    const sorted = [...s.entries].sort((a, b) => a.ts - b.ts);
    const latest = sorted.length ? sorted[sorted.length - 1] : null;
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const forecast = sorted.length
      ? buildForecast({ entries: sorted, factors: s.factors, goal: s.goal, now: Math.max(nowTick, Date.now()) })
      : null;
    return {
      loaded: state !== null,
      entries: sorted,
      factors: s.factors,
      goal: s.goal,
      latest,
      previous,
      forecast,
      reduceMotion,
      addEntry,
      removeEntry,
      setUtilization,
      addMark,
      removeMark,
      setGoal,
    };
  }, [state, reduceMotion, nowTick, addEntry, removeEntry, setUtilization, addMark, removeMark, setGoal]);

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScore() {
  const ctx = useContext(ScoreContext);
  if (!ctx) throw new Error('useScore must be used inside ScoreProvider');
  return ctx;
}
