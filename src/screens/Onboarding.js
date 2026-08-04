// Six little screens between a chaotic camera roll and an organised life.
// Welcome → the mess → the magic → what you love → your privacy → first Nest.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Animated, Easing,
  KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { palette, INTERESTS, TYPES, radii, softShadow, type } from '../theme';
import { useNest, cardFromSample } from '../state/NestStore';
import { SAMPLES, SAMPLE_BY_ID, FIRST_NEST_IDS } from '../brain/samples';
import { makeRng } from '../utils/rng';
import CameraBuddy from '../components/mascots/CameraBuddy';
import LockHug from '../components/mascots/LockHug';
import Nesty from '../components/mascots/Nesty';
import SampleShot from '../components/SampleShot';
import RoseButton from '../components/RoseButton';
import Bouncy from '../components/Bouncy';

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function StepShell({ children, stepKey, reduceMotion }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    if (reduceMotion) { anim.setValue(1); return; }
    Animated.timing(anim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [stepKey, anim, reduceMotion]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Dots({ count, active }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

// Step 2's mess: sample screenshots tumble from the sky into a crooked pile.
function FallingPile({ reduceMotion }) {
  const anims = useRef(SAMPLES.map(() => new Animated.Value(0))).current;
  const layout = useMemo(() => SAMPLES.map((s, i) => {
    const rng = makeRng(`pile-${s.id}`);
    return {
      x: rng.range(-92, 92),
      y: rng.range(-16, 26),
      rot: rng.range(-16, 16),
      delay: i * 190,
    };
  }), []);

  const fall = () => {
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(
      170,
      anims.map((a) => Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 5, bounciness: 7 }))
    ).start();
  };

  useEffect(() => {
    if (reduceMotion) { anims.forEach((a) => a.setValue(1)); return; }
    fall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Bouncy onPress={reduceMotion ? undefined : fall} haptic={false} style={styles.pileArea} accessibilityLabel="A messy pile of screenshots — tap to shuffle">
      {SAMPLES.map((s, i) => (
        <Animated.View
          key={s.id}
          style={{
            position: 'absolute',
            opacity: anims[i].interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
            transform: [
              { translateX: layout[i].x },
              { translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [-260, layout[i].y] }) },
              { rotate: `${layout[i].rot}deg` },
            ],
          }}
        >
          <SampleShot sample={s} width={74} style={softShadow} />
        </Animated.View>
      ))}
    </Bouncy>
  );
}

// Step 3's trick: one screenshot breathes out three tidy cards, on repeat.
const MAGIC_CARDS = [
  { sid: 'gig', emoji: '🎟️' },
  { sid: 'trainers', emoji: '🛍️' },
  { sid: 'pasta', emoji: '🍜' },
];

function MagicDemo({ reduceMotion }) {
  const master = useRef(new Animated.Value(0)).current;
  const cards = useMemo(() => MAGIC_CARDS.map(({ sid }) => {
    const c = cardFromSample(sid);
    const meta = TYPES[c.type];
    const accent = c.type === 'event' ? '18 August' : c.type === 'product' ? '£54.99' : '25 minutes';
    return { id: sid, title: c.title, accent, meta };
  }), []);

  useEffect(() => {
    if (reduceMotion) { master.setValue(1); return undefined; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(master, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2100),
        Animated.timing(master, { toValue: 0, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(350),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [master, reduceMotion]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View
        style={{
          transform: [
            { scale: master.interpolate({ inputRange: [0, 1], outputRange: [1, 0.84] }) },
            { translateY: master.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
          ],
        }}
      >
        <SampleShot sample={SAMPLE_BY_ID.gig} width={128} style={softShadow} />
      </Animated.View>
      <View style={{ marginTop: 14, alignSelf: 'stretch', gap: 9 }}>
        {cards.map((c, i) => {
          const start = 0.25 + i * 0.22;
          const clamped = master.interpolate({
            inputRange: [0, start, Math.min(start + 0.22, 1), 1],
            outputRange: [0, 0, 1, 1],
          });
          return (
            <Animated.View
              key={c.id}
              style={[
                styles.magicCard,
                { backgroundColor: c.meta.bg },
                {
                  opacity: clamped,
                  transform: [
                    { translateY: clamped.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
                    { scale: clamped.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                  ],
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{c.meta.emoji}</Text>
              <Text numberOfLines={1} style={styles.magicTitle}>{c.title}</Text>
              <Text style={[styles.magicAccent, { color: c.meta.deep }]}>{c.accent}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// Step 6: five screenshots sort themselves into folders, one by one, for real.
function FirstNestSorter({ running, onAllSorted }) {
  const [sorted, setSorted] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    if (sorted >= FIRST_NEST_IDS.length) { onAllSorted(); return undefined; }
    const t = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setSorted((n) => n + 1);
    }, sorted === 0 ? 500 : 620);
    return () => clearTimeout(t);
  }, [running, sorted, onAllSorted]);

  return (
    <View style={{ gap: 9, alignSelf: 'stretch' }}>
      {FIRST_NEST_IDS.map((sid, i) => {
        const sample = SAMPLE_BY_ID[sid];
        const card = i < sorted ? cardFromSample(sid) : null;
        const meta = card ? TYPES[card.type] : null;
        return (
          <SortRow key={sid} sample={sample} meta={meta} visible={i < sorted} />
        );
      })}
    </View>
  );
}

function SortRow({ sample, meta, visible }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 11 }).start();
  }, [visible, pop]);
  return (
    <View style={styles.sortRow}>
      <SampleShot sample={sample} width={44} />
      <Text style={{ fontSize: 13, color: palette.inkFaint }}>✨</Text>
      {visible && meta ? (
        <Animated.View
          style={[
            styles.sortChip,
            { backgroundColor: meta.bg, opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] },
          ]}
        >
          <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
          <Text style={[styles.sortChipText, { color: meta.deep }]}>{meta.nest}</Text>
        </Animated.View>
      ) : (
        <View style={[styles.sortChip, { backgroundColor: 'rgba(70,59,85,0.05)' }]}>
          <Text style={[styles.sortChipText, { color: palette.inkFaint }]}>…</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { completeOnboarding, reduceMotion } = useNest();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState([]);
  const [sortPhase, setSortPhase] = useState('waiting'); // waiting | sorting | done

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleInterest = (key) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const finish = (withSamples) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    completeOnboarding({
      name,
      interests: picked,
      seedSampleIds: withSamples ? FIRST_NEST_IDS : [],
      inboxSampleIds: withSamples ? ['lisbon'] : [],
    });
  };

  const compact = height < 720;

  return (
    <LinearGradient colors={[palette.cream, palette.lavender]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: insets.top + 18, paddingHorizontal: 26, paddingBottom: insets.bottom + 18 }}>
          <StepShell stepKey={step} reduceMotion={reduceMotion}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 0 && (
                <View style={styles.center}>
                  <CameraBuddy width={compact ? 200 : 236} />
                  <Text style={[type.h1, styles.centerText, { marginTop: 22 }]}>Your screenshots{'\n'}deserve better.</Text>
                  <Text style={[type.soft, styles.centerText, { marginTop: 10, lineHeight: 21 }]}>
                    Turn forgotten screenshots into plans,{'\n'}reminders and collections.
                  </Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="What should we call you? (Becca?)"
                    placeholderTextColor={palette.inkFaint}
                    value={name}
                    onChangeText={setName}
                    maxLength={20}
                    returnKeyType="done"
                  />
                </View>
              )}

              {step === 1 && (
                <View style={styles.center}>
                  <FallingPile reduceMotion={reduceMotion} />
                  <Text style={[type.h1, styles.centerText, { fontSize: 26 }]}>
                    Your camera roll is full of things you meant to remember.
                  </Text>
                  <Text style={[type.soft, styles.centerText, { marginTop: 10 }]}>
                    SnapNest finds the useful stuff for you.
                  </Text>
                </View>
              )}

              {step === 2 && (
                <View style={styles.center}>
                  <MagicDemo reduceMotion={reduceMotion} />
                  <Text style={[type.h1, styles.centerText, { fontSize: 26, marginTop: 20 }]}>
                    One screenshot.{'\n'}Instantly organised.
                  </Text>
                </View>
              )}

              {step === 3 && (
                <View style={styles.center}>
                  <Text style={[type.h1, styles.centerText, { fontSize: 26 }]}>What do you save{'\n'}the most?</Text>
                  <Text style={[type.soft, styles.centerText, { marginTop: 8 }]}>Pick a few — your Nest shapes itself around them.</Text>
                  <View style={styles.bubbleWrap}>
                    {INTERESTS.map((it) => {
                      const on = picked.includes(it.key);
                      return (
                        <Bouncy
                          key={it.key}
                          onPress={() => toggleInterest(it.key)}
                          haptic={false}
                          style={[styles.bubble, on && styles.bubbleOn]}
                          accessibilityLabel={`${it.label}${on ? ', selected' : ''}`}
                        >
                          <Text style={{ fontSize: 17 }}>{it.emoji}</Text>
                          <Text style={[styles.bubbleText, on && { color: '#fff' }]}>{it.label}</Text>
                        </Bouncy>
                      );
                    })}
                  </View>
                </View>
              )}

              {step === 4 && (
                <View style={styles.center}>
                  <LockHug width={compact ? 180 : 208} />
                  <Text style={[type.h1, styles.centerText, { fontSize: 26, marginTop: 18 }]}>
                    Your screenshots{'\n'}stay private.
                  </Text>
                  <Text style={[type.soft, styles.centerText, { marginTop: 10, lineHeight: 21 }]}>
                    Choose exactly which photos SnapNest can see.{'\n'}
                    Everything is read right here on your phone —{'\n'}
                    nothing is ever uploaded, to anyone.
                  </Text>
                </View>
              )}

              {step === 5 && (
                <View style={styles.center}>
                  {sortPhase === 'done' ? (
                    <>
                      <Nesty size={110} />
                      <Text style={[type.h1, styles.centerText, { fontSize: 27, marginTop: 8 }]}>Your first Nest{'\n'}is ready! 🪺</Text>
                      <Text style={[type.soft, styles.centerText, { marginTop: 8 }]}>
                        Five screenshots, sorted by the Nest Brain —{'\n'}and one more is waiting in your inbox.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[type.h1, styles.centerText, { fontSize: 26 }]}>
                        {sortPhase === 'sorting' ? 'The Nest Brain is reading…' : 'Watch five screenshots\nfind their homes.'}
                      </Text>
                      <Text style={[type.soft, styles.centerText, { marginTop: 8, marginBottom: 16 }]}>
                        Sorted on your phone, the moment they arrive.
                      </Text>
                    </>
                  )}
                  {sortPhase !== 'done' && (
                    <FirstNestSorter
                      running={sortPhase === 'sorting'}
                      onAllSorted={() => setSortPhase('done')}
                    />
                  )}
                </View>
              )}
            </ScrollView>
          </StepShell>

          {/* controls */}
          <View style={{ gap: 12 }}>
            {step === 0 && <RoseButton label="Start organising" onPress={next} />}
            {step === 1 && <RoseButton label="Show me the magic" onPress={next} />}
            {step === 2 && <RoseButton label="Ooh. Continue" onPress={next} />}
            {step === 3 && <RoseButton label={picked.length ? `Lovely — that's ${picked.length}` : 'Continue'} onPress={next} />}
            {step === 4 && <RoseButton label="Sounds fair" onPress={next} />}
            {step === 5 && sortPhase === 'waiting' && (
              <>
                <RoseButton label="Import 5 sample screenshots" onPress={() => setSortPhase('sorting')} />
                <RoseButton ghost label="Start with an empty Nest instead" onPress={() => finish(false)} />
              </>
            )}
            {step === 5 && sortPhase === 'done' && (
              <RoseButton label="Open my Nest" onPress={() => finish(true)} />
            )}

            <View style={styles.controlsRow}>
              {step > 0 && sortPhase !== 'sorting' ? (
                <Bouncy onPress={back} haptic={false} style={styles.backBtn} accessibilityLabel="Back">
                  <Text style={{ color: palette.inkFaint, fontSize: 14, fontWeight: '600' }}>‹ back</Text>
                </Bouncy>
              ) : (
                <View style={styles.backBtn} />
              )}
              <Dots count={6} active={step} />
              <View style={styles.backBtn} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 12 },
  centerText: { textAlign: 'center' },
  nameInput: {
    marginTop: 26,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: radii.chip + 2,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15.5,
    color: palette.ink,
    ...softShadow,
    shadowOpacity: 0.07,
  },
  pileArea: { height: 240, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  magicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.chip + 2,
    paddingVertical: 11,
    paddingHorizontal: 14,
    ...softShadow,
    shadowOpacity: 0.08,
  },
  magicTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: palette.ink },
  magicAccent: { fontSize: 14.5, fontWeight: '800' },
  bubbleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#fff',
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
    ...softShadow,
    shadowOpacity: 0.07,
  },
  bubbleOn: { backgroundColor: palette.rose },
  bubbleText: { fontSize: 14.5, fontWeight: '700', color: palette.ink },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sortChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.chip,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sortChipText: { fontSize: 14, fontWeight: '800' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  dotsRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(70,59,85,0.16)' },
  dotActive: { backgroundColor: palette.rose, width: 20 },
  backBtn: { width: 54, paddingVertical: 8 },
});
