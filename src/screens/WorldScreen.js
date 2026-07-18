// The world itself: an endless sky, drifting clouds, and your islands.
// Pan to wander. Pinch out to time-travel. Double-tap to come home.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Ellipse, Rect, Circle } from 'react-native-svg';

import Sky from '../components/Sky';
import Clouds from '../components/Clouds';
import Particles from '../components/Particles';
import WeatherOverlay from '../components/WeatherOverlay';
import Island from '../components/Island';
import SeedComposer from '../components/SeedComposer';
import IslandDetail from '../components/IslandDetail';
import CompanionOrb from '../components/CompanionOrb';
import GlassPanel from '../components/GlassPanel';
import { useMemories } from '../state/MemoryStore';
import { skyForHour, applyWeather } from '../utils/palette';
import { fetchWeather } from '../services/weather';
import { mix } from '../utils/colors';

const { width: W, height: H } = Dimensions.get('window');
const CX = W / 2;
const CY = H / 2;

// Vogel spiral — recent memories near the heart of the world,
// older ones drifting gently outward.
function posOf(index) {
  const angle = index * 2.39996;
  const r = 175 * Math.sqrt(index + 0.55);
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.72 };
}

function Mountains({ night, count }) {
  const near = mix('#6a78a8', '#1e2748', night);
  const far = mix('#8a96c0', '#262f56', night);
  return (
    <View style={{ position: 'absolute', top: H * 0.3, left: -W * 0.25 }}>
      <Svg width={W * 1.5} height={150}>
        <Path d={`M0 150 L90 55 L160 115 L250 25 L340 105 L430 50 L520 120 L620 70 L${W * 1.5} 130 L${W * 1.5} 150 Z`} fill={far} opacity={0.5} />
        <Path d={`M0 150 L70 85 L140 130 L230 55 L320 135 L410 85 L500 140 L600 100 L${W * 1.5} 150 Z`} fill={near} opacity={0.75} />
      </Svg>
      {count >= 25 && (
        <Svg width={150} height={90} style={{ position: 'absolute', left: W * 0.32, top: -58 }}>
          <Ellipse cx={75} cy={80} rx={70} ry={12} fill={near} opacity={0.85} />
          {[22, 44, 66, 88, 110].map((x, i) => (
            <Rect key={i} x={x} y={18 + (i % 3) * 12} width={14} height={60 - (i % 3) * 12} rx={4} fill={mix(near, '#ffffff', 0.12)} />
          ))}
          {[30, 52, 74, 96].map((x, i) => (
            <Circle key={i} cx={x} cy={40 + (i % 2) * 14} r={2.2} fill="#ffe9a0" opacity={0.9} />
          ))}
        </Svg>
      )}
    </View>
  );
}

export default function WorldScreen() {
  const insets = useSafeAreaInsets();
  const { memories, loaded, settings, updateSettings, weather, setWeather, setPlace, reduceMotion } = useMemories();

  const [composerOpen, setComposerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [greeted, setGreeted] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // camera
  const camX = useSharedValue(0);
  const camY = useSharedValue(0);
  const zoom = useSharedValue(1);

  // intro fade
  const intro = useSharedValue(0);
  useEffect(() => {
    if (loaded) intro.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) });
  }, [loaded]);
  const introStyle = useAnimatedStyle(() => ({ opacity: intro.value }));

  // clock tick → sky follows the hour
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 45000);
    return () => clearInterval(t);
  }, []);

  // real weather bends the light
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const w = await fetchWeather(loc.coords.latitude, loc.coords.longitude);
        if (w) setWeather(w);
        const places = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const p = places?.[0];
        if (p && (p.city || p.region)) setPlace(p.city || p.region);
      } catch {}
    })();
  }, []);

  const palette = useMemo(() => {
    const hour = now.getHours() + now.getMinutes() / 60;
    return applyWeather(skyForHour(hour), weather?.type);
  }, [now, weather]);

  // ambient soundscape
  const ambient = useAudioPlayer(require('../../assets/ambient.wav'));
  useEffect(() => {
    try {
      ambient.loop = true;
      if (settings.sound) {
        ambient.volume = 0.32;
        ambient.play();
      } else {
        ambient.pause();
      }
    } catch {}
    return () => {
      try { ambient.pause(); } catch {}
    };
  }, [settings.sound]);

  // first-visit greeting from Lumi
  useEffect(() => {
    if (loaded && !settings.greeted) {
      const t = setTimeout(() => {
        setGreeted(true);
        updateSettings({ greeted: true });
      }, 8000);
      return () => clearTimeout(t);
    }
    setGreeted(true);
  }, [loaded]);

  // ---------- gestures ----------
  const panStart = useSharedValue({ x: 0, y: 0 });
  const pinchStart = useSharedValue({ z: 1, tx: 0, ty: 0, fx: 0, fy: 0 });

  const pan = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      panStart.value = { x: camX.value, y: camY.value };
    })
    .onUpdate((e) => {
      camX.value = panStart.value.x + e.translationX;
      camY.value = panStart.value.y + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      pinchStart.value = { z: zoom.value, tx: camX.value, ty: camY.value, fx: e.focalX, fy: e.focalY };
    })
    .onUpdate((e) => {
      const s = pinchStart.value;
      const z = Math.max(0.32, Math.min(1.9, s.z * e.scale));
      zoom.value = z;
      camX.value = e.focalX - CX - (z / s.z) * (s.fx - CX - s.tx);
      camY.value = e.focalY - CY - (z / s.z) * (s.fy - CY - s.ty);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      camX.value = withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) });
      camY.value = withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) });
      zoom.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    });

  const gesture = Gesture.Simultaneous(pan, pinch, doubleTap);

  // parallax layers
  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: camX.value }, { translateY: camY.value }, { scale: zoom.value }],
  }));
  const midStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: camX.value * 0.55 },
      { translateY: camY.value * 0.55 },
      { scale: 1 + (zoom.value - 1) * 0.55 },
    ],
  }));
  const farStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: camX.value * 0.3 },
      { translateY: camY.value * 0.3 },
      { scale: 1 + (zoom.value - 1) * 0.3 },
    ],
  }));
  const zoomHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(zoom.value, [0.62, 0.45], [0, 1], Extrapolation.CLAMP),
  }));

  const flyTo = useCallback(
    (id) => {
      const idx = memories.findIndex((m) => m.id === id);
      if (idx < 0) return;
      const p = posOf(idx);
      const z = 1.18;
      camX.value = withTiming(-p.x * z, { duration: 1500, easing: Easing.inOut(Easing.cubic) });
      camY.value = withTiming(-p.y * z + 30, { duration: 1500, easing: Easing.inOut(Easing.cubic) });
      zoom.value = withTiming(z, { duration: 1500, easing: Easing.inOut(Easing.cubic) });
    },
    [memories]
  );

  const today = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const showGreeting = loaded && !settings.greeted && !greeted;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.root}>
        <Sky palette={palette} reduceMotion={reduceMotion} />

        {/* far layer: mountains & the distant city */}
        {memories.length >= 5 && (
          <Animated.View style={[StyleSheet.absoluteFill, farStyle]} pointerEvents="none">
            <Mountains night={palette.night} count={memories.length} />
          </Animated.View>
        )}

        {/* mid layer: clouds */}
        <Animated.View style={[StyleSheet.absoluteFill, midStyle]} pointerEvents="none">
          <Clouds night={palette.night} reduceMotion={reduceMotion} />
        </Animated.View>

        {/* the world of islands */}
        <Animated.View style={[StyleSheet.absoluteFill, introStyle]} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, worldStyle]} pointerEvents="box-none">
            {memories.map((m, i) => {
              const p = posOf(i);
              return (
                <View key={m.id} style={{ position: 'absolute', left: CX + p.x - 120, top: CY + p.y - 100 }} pointerEvents="box-none">
                  <Island memory={m} zoomSV={zoom} onPress={setSelected} reduceMotion={reduceMotion} />
                </View>
              );
            })}
          </Animated.View>
        </Animated.View>

        {/* ambience layers */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Particles fireflies={memories.length >= 10} reduceMotion={reduceMotion} />
        </View>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <WeatherOverlay type={weather?.type} reduceMotion={reduceMotion} />
        </View>

        {/* HUD */}
        <Animated.View style={[styles.hud, { top: insets.top + 12 }, introStyle]} pointerEvents="box-none">
          <GlassPanel intensity={34} radius={20} style={styles.hudChip}>
            <Text style={styles.hudText}>
              {today} · {palette.label}{weather ? ` · ${weather.emoji}` : ''}
            </Text>
          </GlassPanel>
          <GlassPanel intensity={34} radius={20} style={styles.hudChip}>
            <Text style={styles.hudText}>🏝 {memories.length}</Text>
          </GlassPanel>
        </Animated.View>

        {/* time travel hint */}
        <Animated.View style={[styles.zoomHint, { bottom: insets.bottom + 108 }, zoomHintStyle]} pointerEvents="none">
          <GlassPanel intensity={30} radius={18} style={styles.hudChip}>
            <Text style={styles.hudText}>🕰 Time travel — double-tap to come home</Text>
          </GlassPanel>
        </Animated.View>

        {/* empty sky */}
        {loaded && memories.length === 0 && (
          <View style={styles.emptyWrap} pointerEvents="none">
            <GlassPanel intensity={36} radius={26} style={{ paddingHorizontal: 24, paddingVertical: 18 }}>
              <Text style={styles.emptyText}>Your sky is waiting.{'\n'}Tap + to grow your first island. 🌱</Text>
            </GlassPanel>
          </View>
        )}

        {/* + button */}
        <Animated.View style={[styles.plusWrap, { bottom: insets.bottom + 26 }, introStyle]}>
          <Pressable
            accessibilityLabel="Plant a new memory"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              setComposerOpen(true);
            }}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <GlassPanel intensity={40} radius={34} style={styles.plus}>
              <Text style={styles.plusText}>＋</Text>
            </GlassPanel>
          </Pressable>
        </Animated.View>

        {/* Lumi */}
        <Animated.View style={[styles.orbWrap, { bottom: insets.bottom + 30 }, introStyle]}>
          <CompanionOrb onFlyTo={flyTo} />
        </Animated.View>

        {/* Lumi's greeting */}
        {showGreeting && (
          <View style={[styles.greeting, { bottom: insets.bottom + 102 }]} pointerEvents="none">
            <GlassPanel intensity={38} radius={20} style={{ paddingHorizontal: 16, paddingVertical: 12, maxWidth: 240 }}>
              <Text style={styles.greetingText}>
                Hi, I'm Lumi ✨ I live in your world. Three sample islands are drifting here — make them yours, or tap + to plant a new one.
              </Text>
            </GlassPanel>
          </View>
        )}

        {/* modals */}
        {composerOpen && <SeedComposer onClose={() => setComposerOpen(false)} />}
        {selected && <IslandDetail memory={selected} onClose={() => setSelected(null)} />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1026' },
  hud: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudChip: { paddingHorizontal: 14, paddingVertical: 9 },
  hudText: { color: '#fff', fontSize: 12.5, fontWeight: '600', letterSpacing: 0.3, textShadowColor: 'rgba(0,0,20,0.3)', textShadowRadius: 3 },
  zoomHint: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  emptyWrap: { position: 'absolute', left: 0, right: 0, top: H * 0.42, alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 15.5, fontWeight: '500', textAlign: 'center', lineHeight: 23, letterSpacing: 0.3 },
  plusWrap: { position: 'absolute', alignSelf: 'center', left: 0, right: 0, alignItems: 'center' },
  plus: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  plusText: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -2, textShadowColor: 'rgba(120,180,255,0.8)', textShadowRadius: 12 },
  orbWrap: { position: 'absolute', left: 22 },
  greeting: { position: 'absolute', left: 22 },
  greetingText: { color: '#fff', fontSize: 13, lineHeight: 19 },
});
