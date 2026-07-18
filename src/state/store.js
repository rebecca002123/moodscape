import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setHapticsEnabled } from '../utils/haptics';
import { dayKey, daysAgo, weekdayOf } from '../utils/dates';
import { PRESETS } from '../theme/habitStyle';

const HABITS_KEY = '@prism/habits.v1';
const DONE_KEY = '@prism/completions.v1';
const SETTINGS_KEY = '@prism/settings.v1';

const DEFAULT_SETTINGS = { appearance: 'auto', haptics: true };
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS });
const HabitsContext = createContext({ habits: [], completions: {} });

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawHabits, rawDone, rawSettings] = await Promise.all([
          AsyncStorage.getItem(HABITS_KEY),
          AsyncStorage.getItem(DONE_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (rawHabits) setHabits(JSON.parse(rawHabits));
        if (rawDone) setCompletions(JSON.parse(rawDone));
        if (rawSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) });
      } catch (e) {
        // A corrupt store should never brick the app — start fresh.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  const persistHabits = useCallback((next) => {
    setHabits(next);
    AsyncStorage.setItem(HABITS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistDone = useCallback((next) => {
    setCompletions(next);
    AsyncStorage.setItem(DONE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addHabit = useCallback(({ name, icon, color, days }) => {
    const habit = {
      id: newId(),
      name: name.trim(),
      icon,
      color,
      days: days && days.length ? [...days].sort() : ALL_DAYS,
      createdAt: Date.now(),
    };
    persistHabits([...habits, habit]);
    return habit;
  }, [habits, persistHabits]);

  const updateHabit = useCallback((id, patch) => {
    persistHabits(habits.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, [habits, persistHabits]);

  const deleteHabit = useCallback((id) => {
    persistHabits(habits.filter((h) => h.id !== id));
    const scrubbed = {};
    for (const [day, map] of Object.entries(completions)) {
      const { [id]: _gone, ...rest } = map;
      if (Object.keys(rest).length) scrubbed[day] = rest;
    }
    persistDone(scrubbed);
  }, [habits, completions, persistHabits, persistDone]);

  const toggleCompletion = useCallback((habitId, key) => {
    const dayMap = { ...(completions[key] || {}) };
    let nowDone;
    if (dayMap[habitId]) {
      delete dayMap[habitId];
      nowDone = false;
    } else {
      dayMap[habitId] = Date.now();
      nowDone = true;
    }
    const next = { ...completions };
    if (Object.keys(dayMap).length) next[key] = dayMap;
    else delete next[key];
    persistDone(next);
    return nowDone;
  }, [completions, persistDone]);

  const clearAll = useCallback(() => {
    persistHabits([]);
    persistDone({});
  }, [persistHabits, persistDone]);

  const seedSample = useCallback(() => {
    const sample = PRESETS.slice(0, 4).map((preset, i) => ({
      id: `sample-${i}-${newId()}`,
      ...preset,
      days: i === 3 ? [1, 2, 3, 4, 5] : ALL_DAYS,
      createdAt: daysAgo(55).getTime(),
    }));
    const done = {};
    const rates = [0.85, 0.7, 0.6, 0.75];
    for (let back = 55; back >= 1; back--) {
      const d = daysAgo(back);
      const key = dayKey(d);
      sample.forEach((h, i) => {
        if (!h.days.includes(d.getDay())) return;
        // habits get easier to keep as they settle in
        const drift = Math.min(0.12, back / 460);
        if (Math.random() < rates[i] - drift) {
          if (!done[key]) done[key] = {};
          done[key][h.id] = d.getTime();
        }
      });
    }
    persistHabits(sample);
    persistDone(done);
  }, [persistHabits, persistDone]);

  const settingsValue = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  const habitsValue = useMemo(() => ({
    habits, completions, ready,
    addHabit, updateHabit, deleteHabit, toggleCompletion, clearAll, seedSample,
  }), [habits, completions, ready, addHabit, updateHabit, deleteHabit, toggleCompletion, clearAll, seedSample]);

  return (
    <SettingsContext.Provider value={settingsValue}>
      <HabitsContext.Provider value={habitsValue}>
        {children}
      </HabitsContext.Provider>
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export const useHabits = () => useContext(HabitsContext);

// A habit is "scheduled" on a given day if that weekday is in its list and
// the day isn't before the habit existed.
export function isScheduled(habit, key) {
  if (!habit.days.includes(weekdayOf(key))) return false;
  return key >= dayKey(habit.createdAt);
}

export const isDone = (completions, habitId, key) => !!completions[key]?.[habitId];
