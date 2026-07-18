// The clearing: forest, fire, fireflies, and the choice to begin.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useHearth } from '../state/HearthStore';
import ForestBackdrop from '../components/ForestBackdrop';
import Campfire from '../components/Campfire';
import Fireflies from '../components/Fireflies';
import HearthStats from '../components/HearthStats';

const DURATIONS = [10, 25, 50];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function HearthScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { sessions, addSession, totalMinutes, todayMinutes, streak, reduceMotion } = useHearth();

  const [phase, setPhase] = useState('idle'); // idle | burning | done
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const endsAtRef = useRef(null);

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: phase === 'burning' ? 1 : 0,
      duration: phase === 'burning' ? 1200 : 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [phase, glow]);

  // The countdown is anchored to a wall-clock end time, so returning from
  // the background never loses a second of the fire's honesty.
  useEffect(() => {
    if (phase !== 'burning') return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        addSession(minutes);
        setPhase('done');
      }
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [phase, minutes, addSession]);

  useEffect(() => {
    if (phase !== 'done') return;
    const timer = setTimeout(() => setPhase('idle'), 4000);
    return () => clearTimeout(timer);
  }, [phase]);

  const light = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    endsAtRef.current = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60);
    setPhase('burning');
  };

  const extinguish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPhase('idle');
  };

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.11] });

  return (
    <View style={{ flex: 1, backgroundColor: '#05070f' }}>
      <ForestBackdrop width={width} height={height} glow={glowOpacity} />
      <Fireflies sessions={sessions} width={width} height={height * 0.9} reduceMotion={reduceMotion} />

      <View style={[styles.header, { top: insets.top + 14 }]}>
        <View>
          <Text style={styles.title}>Ember</Text>
          <Text style={styles.subtitle}>a fire for your focus</Text>
        </View>
        <Pressable onPress={() => setStatsOpen(true)} style={styles.streakChip} accessibilityRole="button">
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </Pressable>
      </View>

      <View style={styles.fireArea}>
        <Campfire burning={phase === 'burning'} streak={streak} reduceMotion={reduceMotion} />
      </View>

      <View style={[styles.controls, { bottom: insets.bottom + 26 }]}>
        {phase === 'idle' && (
          <>
            <View style={styles.durationRow}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setMinutes(d)}
                  style={[styles.durationChip, minutes === d && styles.durationChipActive]}
                >
                  <Text style={[styles.durationText, minutes === d && styles.durationTextActive]}>
                    {d} min
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={light} style={styles.lightBtn} accessibilityRole="button">
              <Text style={styles.lightText}>Light the fire</Text>
            </Pressable>
          </>
        )}

        {phase === 'burning' && (
          <>
            <Text style={styles.timer}>{formatTime(remaining)}</Text>
            <Text style={styles.burningHint}>The fire is holding your focus.</Text>
            <Pressable onPress={extinguish} style={styles.ghostBtn} accessibilityRole="button">
              <Text style={styles.ghostText}>Let it go out</Text>
            </Pressable>
          </>
        )}

        {phase === 'done' && (
          <View style={styles.doneBox}>
            <Text style={styles.doneText}>The fire settles.</Text>
            <Text style={styles.doneSub}>A firefly rises into the clearing. ✦</Text>
          </View>
        )}
      </View>

      <HearthStats
        visible={statsOpen}
        onClose={() => setStatsOpen(false)}
        sessions={sessions}
        totalMinutes={totalMinutes}
        todayMinutes={todayMinutes}
        streak={streak}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    left: 22,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#ffe9c8', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,233,200,0.5)', fontSize: 13, marginTop: 2 },
  streakChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,157,77,0.3)',
  },
  streakText: { color: '#ffd9a0', fontSize: 15, fontWeight: '700' },
  fireArea: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170 },
  controls: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,233,200,0.2)',
  },
  durationChipActive: { backgroundColor: 'rgba(255,140,59,0.2)', borderColor: '#ff8c3b' },
  durationText: { color: 'rgba(255,233,200,0.6)', fontSize: 14 },
  durationTextActive: { color: '#ffd9a0', fontWeight: '700' },
  lightBtn: {
    backgroundColor: '#ff8c3b',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 22,
  },
  lightText: { color: '#1c1206', fontSize: 17, fontWeight: '800' },
  timer: { color: '#ffe9c8', fontSize: 52, fontWeight: '800', fontVariant: ['tabular-nums'] },
  burningHint: { color: 'rgba(255,233,200,0.5)', fontSize: 14, marginTop: 4 },
  ghostBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 10 },
  ghostText: { color: 'rgba(255,233,200,0.45)', fontSize: 14 },
  doneBox: { alignItems: 'center', paddingVertical: 20 },
  doneText: { color: '#ffe9c8', fontSize: 20, fontWeight: '700' },
  doneSub: { color: 'rgba(255,233,200,0.6)', fontSize: 14, marginTop: 6 },
});
