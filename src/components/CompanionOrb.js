// Lumi — a small orb of light that lives in your world.
// She notices patterns, resurfaces memories, and never judges.

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GlassPanel from './GlassPanel';
import { buildInsights, MILESTONES, nextMilestone } from '../services/insights';
import { useMemories } from '../state/MemoryStore';

export default function CompanionOrb({ style, onFlyTo }) {
  const { memories, settings, updateSettings } = useMemories();
  const [open, setOpen] = useState(false);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })),
      -1,
      true
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.09]) }, { translateY: interpolate(pulse.value, [0, 1], [0, -5]) }],
    shadowOpacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
  }));

  const insights = useMemo(() => buildInsights(memories), [memories, open]);
  const next = nextMilestone(memories.length);
  const hasSamples = memories.some((m) => m.sample);

  return (
    <>
      <Pressable
        style={style}
        accessibilityLabel="Lumi, your companion. Tap for insights."
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setOpen(true);
        }}
      >
        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient colors={['#e8d9ff', '#9db8ff', '#7de3ff']} style={styles.orbFill} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.9, y: 1 }} />
          <View style={styles.orbCore} />
        </Animated.View>
      </Pressable>

      {open && (
        <Modal transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
            <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} accessibilityLabel="Dismiss" />
            <GlassPanel tint="dark" intensity={48} radius={34} style={styles.sheet}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22 }}>
                <View style={styles.headerRow}>
                  <View style={styles.miniOrb}>
                    <LinearGradient colors={['#e8d9ff', '#7de3ff']} style={styles.miniOrbFill} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Lumi</Text>
                    <Text style={styles.subtitle}>keeper of your sky</Text>
                  </View>
                  <Pressable accessibilityLabel="Close" onPress={() => setOpen(false)} hitSlop={12}>
                    <Text style={styles.close}>✕</Text>
                  </Pressable>
                </View>

                {insights.map((ins, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.cardTitle}>{ins.icon} {ins.title}</Text>
                    <Text style={styles.cardBody}>{ins.body}</Text>
                    {ins.flyTo && (
                      <Pressable
                        style={styles.flyBtn}
                        onPress={() => {
                          setOpen(false);
                          onFlyTo?.(ins.flyTo);
                        }}
                        accessibilityLabel="Fly to that memory"
                      >
                        <Text style={styles.flyText}>🕊️ Fly me there</Text>
                      </Pressable>
                    )}
                  </View>
                ))}

                <Text style={styles.section}>World evolution</Text>
                <View style={styles.card}>
                  {next ? (
                    <>
                      <Text style={styles.cardTitle}>🏝️ {memories.length} islands</Text>
                      <Text style={styles.cardBody}>
                        {next.count - memories.length} more until <Text style={{ fontWeight: '700', color: '#fff' }}>{next.label}</Text> — {next.desc.toLowerCase()}.
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(100, (memories.length / next.count) * 100)}%` },
                          ]}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.cardBody}>Your world is complete — and still growing. 🌌</Text>
                  )}
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {MILESTONES.map((m) => (
                      <Text key={m.count} style={[styles.milestone, memories.length >= m.count && styles.milestoneDone]}>
                        {memories.length >= m.count ? '◆' : '◇'} {m.count} · {m.label}
                      </Text>
                    ))}
                  </View>
                </View>

                <Text style={styles.section}>Settings</Text>
                <View style={[styles.card, styles.settingRow]}>
                  <Text style={styles.cardTitle}>🔊 Ambient soundscape</Text>
                  <Switch
                    value={settings.sound}
                    onValueChange={(v) => updateSettings({ sound: v })}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(140,220,255,0.6)' }}
                    thumbColor="#fff"
                  />
                </View>
                {hasSamples && (
                  <View style={[styles.card, { alignItems: 'center' }]}>
                    <Text style={[styles.cardBody, { textAlign: 'center' }]}>
                      🌱 The first islands were planted as samples — open one and choose “let it drift away” whenever you're ready to make the sky fully yours.
                    </Text>
                  </View>
                )}
                <Text style={styles.privacy}>Everything in your world stays on this device. 🔒</Text>
              </ScrollView>
            </GlassPanel>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: '#a9c8ff',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  orbFill: { flex: 1, borderRadius: 29, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)' },
  orbCore: {
    position: 'absolute',
    top: 10,
    left: 12,
    width: 16,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    transform: [{ rotate: '-20deg' }],
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,10,26,0.35)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '78%', borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(16,22,46,0.5)', marginHorizontal: 10, marginBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  miniOrb: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  miniOrbFill: { flex: 1, borderRadius: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5, letterSpacing: 0.4 },
  close: { color: 'rgba(255,255,255,0.8)', fontSize: 18, padding: 4 },
  section: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase', marginTop: 20, marginBottom: 9 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 15,
    marginTop: 10,
  },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  cardBody: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20.5, marginTop: 5 },
  flyBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,220,255,0.6)',
    backgroundColor: 'rgba(140,200,255,0.16)',
  },
  flyText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: '#9fd8ff' },
  milestone: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  milestoneDone: { color: '#bfe6ff', fontWeight: '600' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  privacy: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginTop: 18, marginBottom: 8 },
});
