import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setHapticsEnabled } from '../utils/haptics';
import { MOODS, MOOD_ORDER, TAGS } from '../theme/moods';
import { dayKey } from '../utils/dates';

const ENTRIES_KEY = '@moodscape/entries.v2';
const SETTINGS_KEY = '@moodscape/settings.v2';

const DEFAULT_SETTINGS = { appearance: 'auto', haptics: true };

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS });
const EntriesContext = createContext({ entries: [] });

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawEntries, rawSettings] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (rawEntries) setEntries(JSON.parse(rawEntries));
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

  const persistEntries = useCallback((next) => {
    setEntries(next);
    AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addEntry = useCallback(({ mood, note, tags }) => {
    const now = new Date();
    const entry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      mood,
      note: (note || '').trim(),
      tags: tags || [],
      createdAt: now.getTime(),
      day: dayKey(now),
    };
    persistEntries([entry, ...entries]);
    return entry;
  }, [entries, persistEntries]);

  const deleteEntry = useCallback((id) => {
    persistEntries(entries.filter((e) => e.id !== id));
  }, [entries, persistEntries]);

  const clearAll = useCallback(() => {
    persistEntries([]);
  }, [persistEntries]);

  const seedSample = useCallback(() => {
    persistEntries(makeSampleEntries());
  }, [persistEntries]);

  const settingsValue = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  const entriesValue = useMemo(
    () => ({ entries, ready, addEntry, deleteEntry, clearAll, seedSample }),
    [entries, ready, addEntry, deleteEntry, clearAll, seedSample],
  );

  return (
    <SettingsContext.Provider value={settingsValue}>
      <EntriesContext.Provider value={entriesValue}>
        {children}
      </EntriesContext.Provider>
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export const useEntries = () => useContext(EntriesContext);

// ---------------------------------------------------------------------------

const SAMPLE_NOTES = {
  radiant: ['Best day in ages — everything clicked.', 'Sunlit walk, good coffee, great news.'],
  happy: ['Dinner with friends, laughed way too much.', 'Finished the thing. Finally!'],
  calm: ['Quiet evening, tea and a book.', 'Long slow morning. Needed that.'],
  meh: ['Fine, I guess. Autopilot day.', 'Nothing bad, nothing great.'],
  low: ['Tired and a bit foggy all day.', 'Missed the gym, slept badly.'],
  stormy: ['Rough one. Argument at work.', 'Everything felt heavy today.'],
};

function makeSampleEntries() {
  const out = [];
  let drift = 3.8;
  for (let back = 44; back >= 0; back--) {
    drift += (Math.random() - 0.47) * 1.4;
    drift = Math.min(6, Math.max(1, drift));
    if (Math.random() < 0.16 && back !== 0) continue; // the occasional missed day
    const score = Math.round(Math.min(6, Math.max(1, drift + (Math.random() - 0.5))));
    const mood = MOOD_ORDER.find((k) => MOODS[k].score === score) || 'calm';
    const d = new Date();
    d.setDate(d.getDate() - back);
    d.setHours(9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60), 0, 0);
    const notes = SAMPLE_NOTES[mood];
    out.push({
      id: `sample-${back}-${Math.random().toString(36).slice(2, 8)}`,
      mood,
      note: Math.random() < 0.7 ? notes[Math.floor(Math.random() * notes.length)] : '',
      tags: TAGS.filter(() => Math.random() < 0.14).slice(0, 3),
      createdAt: d.getTime(),
      day: dayKey(d),
    });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}
