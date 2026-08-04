// The Nest itself: settings, the screenshot inbox, every card, every folder.
// All of it lives in AsyncStorage on your phone. No account, no cloud —
// your screenshots' secrets stay exactly where they started.

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';
import { buildCard } from '../brain/nestBrain';
import { SAMPLE_BY_ID } from '../brain/samples';
import { monthKey, dayStart, weekStart, relativeDay } from '../utils/dates';

const KEYS = {
  settings: 'snapnest.settings.v1',
  inbox: 'snapnest.inbox.v1',
  cards: 'snapnest.cards.v1',
  nests: 'snapnest.nests.v1',
};

export const FREE_SCANS_PER_MONTH = 30;

const DEFAULT_SETTINGS = {
  name: '',
  interests: [],
  onboarded: false,
  plus: false,
  scanMonth: monthKey(),
  scansUsed: 0,
};

const newId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const NestContext = createContext(null);

function usePersistedSlice(key, initial) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        setValue(raw === null ? initial : { ...initial, ...JSON.parse(raw) });
      } catch {
        setValue(initial);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (value !== null) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value]);
  return [value, setValue];
}

function usePersistedList(key) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        setValue(raw === null ? [] : JSON.parse(raw));
      } catch {
        setValue([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (value !== null) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value]);
  return [value, setValue];
}

// Turn a Brain draft + its source into a card that can live in the Nest.
function draftToCard(draft, source) {
  return {
    id: newId('card'),
    type: draft.type,
    title: draft.title,
    subtitle: draft.subtitle,
    fields: draft.fields || {},
    why: draft.why || [],
    sourceText: source.text || '',
    kind: source.kind || 'text',
    sampleId: source.sampleId || null,
    uri: source.uri || null,
    nestId: source.nestId || null,
    createdAt: Date.now(),
    done: false,
    doneAt: null,
  };
}

export function cardFromSample(sampleId) {
  const sample = SAMPLE_BY_ID[sampleId];
  if (!sample) return null;
  const draft = buildCard(sample.text);
  return draftToCard(draft, { text: sample.text, kind: 'sample', sampleId });
}

export function NestProvider({ children }) {
  const [settings, setSettings] = usePersistedSlice(KEYS.settings, DEFAULT_SETTINGS);
  const [inbox, setInbox] = usePersistedList(KEYS.inbox);
  const [cards, setCards] = usePersistedList(KEYS.cards);
  const [nests, setNests] = usePersistedList(KEYS.nests);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => sub?.remove?.();
  }, []);

  const loaded = settings !== null && inbox !== null && cards !== null && nests !== null;

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...(prev || DEFAULT_SETTINGS), ...patch }));
  }, [setSettings]);

  // Finishing onboarding may seed the first Nest: five samples become cards
  // (scanned live by the Brain) and one more waits in the inbox, so the home
  // screen has something friendly to say from its very first morning.
  const completeOnboarding = useCallback(({ name, interests, seedSampleIds = [], inboxSampleIds = [] }) => {
    if (seedSampleIds.length) {
      const seeded = seedSampleIds.map((sid) => cardFromSample(sid)).filter(Boolean);
      setCards((prev) => [...(prev || []), ...seeded]);
    }
    if (inboxSampleIds.length) {
      setInbox((prev) => ([
        ...(prev || []),
        ...inboxSampleIds.map((sid) => ({ id: newId('shot'), kind: 'sample', sampleId: sid, addedAt: Date.now() })),
      ]));
    }
    setSettings((prev) => ({ ...(prev || DEFAULT_SETTINGS), name: name.trim(), interests, onboarded: true }));
  }, [setCards, setInbox, setSettings]);

  const addSampleToInbox = useCallback((sampleId) => {
    const item = { id: newId('shot'), kind: 'sample', sampleId, addedAt: Date.now() };
    setInbox((prev) => [...(prev || []), item]);
    return item;
  }, [setInbox]);

  const addPhotosToInbox = useCallback((assets) => {
    const items = assets.map((a) => ({
      id: newId('shot'),
      kind: 'photo',
      uri: a.uri,
      width: a.width,
      height: a.height,
      addedAt: Date.now(),
    }));
    setInbox((prev) => [...(prev || []), ...items]);
    return items;
  }, [setInbox]);

  const removeFromInbox = useCallback((id) => {
    setInbox((prev) => (prev || []).filter((i) => i.id !== id));
  }, [setInbox]);

  // A scan that becomes a card: count it, file it, clear it from the inbox.
  const saveCard = useCallback((draft, source) => {
    const card = draftToCard(draft, source);
    setCards((prev) => [...(prev || []), card]);
    if (source.inboxId) setInbox((prev) => (prev || []).filter((i) => i.id !== source.inboxId));
    setSettings((prev) => {
      const s = prev || DEFAULT_SETTINGS;
      const mk = monthKey();
      const sameMonth = s.scanMonth === mk;
      return { ...s, scanMonth: mk, scansUsed: (sameMonth ? s.scansUsed : 0) + 1 };
    });
    return card;
  }, [setCards, setInbox, setSettings]);

  const updateCard = useCallback((cardId, patch) => {
    setCards((prev) => (prev || []).map((c) => (c.id === cardId ? { ...c, ...patch } : c)));
  }, [setCards]);

  const toggleDone = useCallback((cardId) => {
    setCards((prev) => (prev || []).map((c) => (
      c.id === cardId ? { ...c, done: !c.done, doneAt: !c.done ? Date.now() : null } : c
    )));
  }, [setCards]);

  const deleteCard = useCallback((cardId) => {
    setCards((prev) => (prev || []).filter((c) => c.id !== cardId));
  }, [setCards]);

  const createNest = useCallback((name, emoji) => {
    const nest = { id: newId('nest'), name: name.trim(), emoji, createdAt: Date.now() };
    setNests((prev) => [...(prev || []), nest]);
    return nest;
  }, [setNests]);

  const deleteNest = useCallback((nestId) => {
    setNests((prev) => (prev || []).filter((n) => n.id !== nestId));
    setCards((prev) => (prev || []).map((c) => (c.nestId === nestId ? { ...c, nestId: null } : c)));
  }, [setNests, setCards]);

  const resetEverything = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setInbox([]);
    setCards([]);
    setNests([]);
  }, [setSettings, setInbox, setCards, setNests]);

  const value = useMemo(() => {
    const s = settings || DEFAULT_SETTINGS;
    const allCards = cards || [];
    const live = allCards.filter((c) => !c.done);
    const now = Date.now();
    const soonCutoff = now + 14 * 24 * 3600 * 1000;

    // The Today strip: what the nest thinks deserves a gentle nudge.
    const today = [];
    for (const c of live.filter((c) => c.type === 'event' && c.fields.when && c.fields.when >= dayStart(now) && c.fields.when <= soonCutoff)
      .sort((a, b) => a.fields.when - b.fields.when)) {
      today.push({ id: `t-${c.id}`, emoji: '🎟', label: `${c.title} — ${relativeDay(c.fields.when)}`, cardId: c.id });
    }
    for (const c of live.filter((c) => c.type === 'job' && c.fields.deadline && c.fields.deadline >= dayStart(now) && c.fields.deadline <= soonCutoff)) {
      today.push({ id: `t-${c.id}`, emoji: '💼', label: `${c.title} — apply ${relativeDay(c.fields.deadline)}`, cardId: c.id });
    }
    for (const c of live.filter((c) => c.type === 'message')) {
      today.push({ id: `t-${c.id}`, emoji: '💬', label: c.title, cardId: c.id });
    }
    for (const c of live.filter((c) => c.type === 'product' && c.fields.wasPrice && c.fields.price && c.fields.wasPrice > c.fields.price)) {
      const dropped = Math.round(c.fields.wasPrice - c.fields.price);
      today.push({ id: `t-${c.id}`, emoji: '📉', label: `${c.title} — £${dropped} off`, cardId: c.id });
    }

    const counts = {};
    for (const c of allCards) counts[c.type] = (counts[c.type] || 0) + 1;

    const ws = weekStart(now);
    const weekly = {
      saved: allCards.filter((c) => c.createdAt >= ws).length,
      done: allCards.filter((c) => c.doneAt && c.doneAt >= ws).length,
      drops: live.filter((c) => c.type === 'product' && c.fields.wasPrice > c.fields.price).length,
    };

    const scansLeft = s.plus ? Infinity : Math.max(0, FREE_SCANS_PER_MONTH - (s.scanMonth === monthKey() ? s.scansUsed : 0));

    return {
      loaded,
      settings: s,
      inbox: inbox || [],
      cards: allCards,
      nests: nests || [],
      reduceMotion,
      today: today.slice(0, 8),
      counts,
      weekly,
      scansLeft,
      updateSettings,
      completeOnboarding,
      addSampleToInbox,
      addPhotosToInbox,
      removeFromInbox,
      saveCard,
      updateCard,
      toggleDone,
      deleteCard,
      createNest,
      deleteNest,
      resetEverything,
    };
  }, [
    loaded, settings, inbox, cards, nests, reduceMotion,
    updateSettings, completeOnboarding, addSampleToInbox, addPhotosToInbox,
    removeFromInbox, saveCard, updateCard, toggleDone, deleteCard,
    createNest, deleteNest, resetEverything,
  ]);

  return <NestContext.Provider value={value}>{children}</NestContext.Provider>;
}

export function useNest() {
  const ctx = useContext(NestContext);
  if (!ctx) throw new Error('useNest must be used inside NestProvider');
  return ctx;
}
