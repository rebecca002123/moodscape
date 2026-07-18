// A floating glass island, grown procedurally from one memory.
// Mood decides the landscape; weather, season, hour and the journal's
// tone leave their marks. Seeded by the memory id — unique, but eternal.

import React, { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  Circle,
  Path,
  Polygon,
  Rect,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { generateIsland } from '../utils/islandGen';
import { withAlpha } from '../utils/colors';
import { makeRng } from '../utils/rng';

// ---------- tiny animated overlay pieces ----------

function IslandRain({ k, seedKey }) {
  const drops = useMemo(() => {
    const rng = makeRng(`irain-${seedKey}`);
    return Array.from({ length: 9 }, (_, i) => ({
      key: i, x: rng.range(55, 185) * k, delay: rng.int(0, 1200), dur: rng.int(850, 1250),
    }));
  }, [seedKey, k]);
  return (
    <>
      {drops.map((d) => (
        <RainDrop key={d.key} {...d} k={k} />
      ))}
    </>
  );
}

function RainDrop({ x, delay, dur, k }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(prog.value, [0, 1], [10 * k, 100 * k]) }, { rotate: '10deg' }],
    opacity: interpolate(prog.value, [0, 0.15, 1], [0, 0.55, 0.1]),
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: 0, width: 1.4 * k, height: 12 * k, borderRadius: 1, backgroundColor: '#bcd4ff' },
        style,
      ]}
    />
  );
}

function Waterfall({ k }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 168 * k,
        top: 96 * k,
        width: 12 * k,
        height: 46 * k,
        borderRadius: 6 * k,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['rgba(220,240,255,0.85)', 'rgba(160,210,255,0.25)', 'rgba(160,210,255,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {[0, 1, 2].map((i) => (
        <FallBar key={i} k={k} x={(1 + i * 4) * k} delay={i * 260} dur={820 + i * 120} />
      ))}
    </View>
  );
}

function FallBar({ k, x, delay, dur }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(prog.value, [0, 1], [-18 * k, 48 * k]) }],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: 0, width: 2 * k, height: 15 * k, borderRadius: 1, backgroundColor: 'rgba(235,248,255,0.85)' },
        style,
      ]}
    />
  );
}

function Bird({ k, top, delay, dur }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(prog.value, [0, 1], [-30 * k, 270 * k]) }],
    opacity: interpolate(prog.value, [0, 0.1, 0.9, 1], [0, 0.75, 0.75, 0]),
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: top * k }, style]}>
      <Svg width={16 * k} height={8 * k}>
        <Path d="M1 5 Q5 1 8 5 Q11 1 15 5" stroke="#3a4a72" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

function Butterfly({ k, color, cx, cy, delay }) {
  const wander = useSharedValue(0);
  const flap = useSharedValue(1);
  useEffect(() => {
    wander.value = withDelay(delay, withRepeat(withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true));
    flap.value = withDelay(delay, withRepeat(withTiming(0.3, { duration: 170 }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: 26 * k * Math.sin(wander.value * Math.PI * 2) },
      { translateY: 16 * k * Math.cos(wander.value * Math.PI * 3) },
      { scaleY: flap.value },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: cx * k, top: cy * k, width: 6 * k, height: 7 * k, borderRadius: 3 * k,
          backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 5,
        },
        style,
      ]}
    />
  );
}

function Lantern({ k, cx, cy, delay, color }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: 6200, easing: Easing.inOut(Easing.sin) }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(prog.value, [0, 1], [0, -52 * k]) }],
    opacity: interpolate(prog.value, [0, 0.25, 0.8, 1], [0, 0.95, 0.8, 0]),
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: cx * k, top: cy * k, width: 6 * k, height: 8 * k, borderRadius: 3 * k,
          backgroundColor: color, shadowColor: color, shadowOpacity: 1, shadowRadius: 8,
        },
        style,
      ]}
    />
  );
}

function FireflyDot({ k, cx, cy, delay }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * Math.abs(Math.sin(prog.value * Math.PI * 5)),
    transform: [
      { translateX: 20 * k * Math.sin(prog.value * Math.PI * 2) },
      { translateY: 14 * k * Math.cos(prog.value * Math.PI * 2.6) },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: cx * k, top: cy * k, width: 3.4 * k, height: 3.4 * k, borderRadius: 1.7 * k,
          backgroundColor: '#ffef9a', shadowColor: '#ffe27a', shadowOpacity: 1, shadowRadius: 6,
        },
        style,
      ]}
    />
  );
}

function FragmentRing({ k, fragments, color }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 26000, easing: Easing.linear }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 240 * k, height: 200 * k }, style]}>
      {fragments.map((f, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: (120 + f.r * Math.cos(f.a)) * k - 4 * k,
            top: (95 + f.r * Math.sin(f.a) * 0.55) * k - 4 * k,
            width: 8 * f.s * k,
            height: 8 * f.s * k,
            backgroundColor: color,
            opacity: 0.65,
            transform: [{ rotate: '45deg' }],
            borderRadius: 1.5,
          }}
        />
      ))}
    </Animated.View>
  );
}

function IslandFog({ k, opacity }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withRepeat(
      withSequence(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.sin) })),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(prog.value, [0, 1], [-16 * k, 16 * k]) }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: 45 * k, top: 78 * k, width: 150 * k, height: 20 * k, borderRadius: 10 * k,
          backgroundColor: `rgba(235,242,252,${opacity})`,
        },
        style,
      ]}
    />
  );
}

function IslandAurora({ k, colors }) {
  const prog = useSharedValue(0.4);
  useEffect(() => {
    prog.value = withRepeat(
      withSequence(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), withTiming(0.25, { duration: 6400, easing: Easing.inOut(Easing.sin) })),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: prog.value * 0.75,
    transform: [{ translateX: interpolate(prog.value, [0.25, 1], [-8 * k, 8 * k]) }, { rotate: '-7deg' }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 20 * k, top: 6 * k, width: 200 * k, height: 22 * k }, style]}>
      <LinearGradient
        colors={['transparent', withAlpha(colors.accent, 0.55), withAlpha(colors.glow, 0.5), 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, borderRadius: 12 * k }}
      />
    </Animated.View>
  );
}

// ---------- the island ----------

export default function Island({ memory, width = 240, zoomSV, onPress, reduceMotion, dimmed }) {
  const k = width / 240;
  const { colors, traits, mood } = useMemo(() => generateIsland(memory), [memory.id]);
  const uid = useMemo(() => String(memory.id).replace(/[^a-zA-Z0-9]/g, ''), [memory.id]);

  const floatProg = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    floatProg.value = withRepeat(
      withSequence(
        withTiming(1, { duration: traits.floatDur, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: traits.floatDur, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [reduceMotion]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reduceMotion ? 0 : interpolate(floatProg.value, [0, 1], [-7 * k, 7 * k]) },
      { rotate: reduceMotion ? '0deg' : `${interpolate(floatProg.value, [0, 1], [-0.9, 0.9])}deg` },
      { scale: traits.scale },
    ],
    opacity: dimmed ? 0.55 : 1,
  }));

  const labelStyle = useAnimatedStyle(() => {
    if (!zoomSV) return { opacity: 0 };
    return {
      opacity: interpolate(zoomSV.value, [0.55, 0.38], [0, 0.95], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(zoomSV.value, [0.55, 0.35], [0.8, 1.4], Extrapolation.CLAMP) }],
    };
  });

  const dateLabel = new Date(memory.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const fullDate = new Date(memory.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  const overlayRng = useMemo(() => makeRng(`ovl-${memory.id}`), [memory.id]);
  const overlaySeeds = useMemo(() => ({
    birdTops: [overlayRng.range(28, 50), overlayRng.range(50, 68)],
    lanternPos: [0, 1, 2, 3].map(() => ({ x: overlayRng.range(70, 170), y: overlayRng.range(90, 105) })),
    fireflyPos: [0, 1, 2, 3, 4, 5].map(() => ({ x: overlayRng.range(55, 185), y: overlayRng.range(60, 110) })),
    butterflyPos: [0, 1, 2].map(() => ({ x: overlayRng.range(80, 160), y: overlayRng.range(55, 85) })),
  }), [overlayRng]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Memory island, feeling ${mood.label}, ${fullDate}`}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.(memory);
      }}
    >
      <Animated.View style={[{ width: 240 * k, height: 200 * k }, floatStyle]}>
        <Svg width={240 * k} height={200 * k} viewBox="0 0 240 200">
          <Defs>
            <SvgLinearGradient id={`plat${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.rim} />
              <Stop offset="0.55" stopColor={colors.base} />
              <Stop offset="1" stopColor={colors.root} />
            </SvgLinearGradient>
            <SvgLinearGradient id={`root${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity="0.85" />
              <Stop offset="1" stopColor={colors.accent} stopOpacity="0.04" />
            </SvgLinearGradient>
            <SvgLinearGradient id={`water${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={withAlpha(colors.water, 0.95)} />
              <Stop offset="1" stopColor={withAlpha(colors.water, 0.55)} />
            </SvgLinearGradient>
            <RadialGradient id={`glow${uid}`} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor={colors.glow} stopOpacity={0.5 * traits.glowStrength} />
              <Stop offset="1" stopColor={colors.glow} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* aura */}
          <Ellipse cx={120} cy={96} rx={112} ry={52} fill={`url(#glow${uid})`} />

          {/* crystal root under the island */}
          <Path d="M58 98 L120 182 L182 98 Q120 124 58 98 Z" fill={`url(#root${uid})`} />
          <Path d="M96 104 L120 158 L144 104" stroke={withAlpha('#ffffff', 0.35)} strokeWidth={1.2} fill="none" />
          <Path d="M72 100 L92 138" stroke={withAlpha('#ffffff', 0.2)} strokeWidth={1} fill="none" />

          {/* glass platform */}
          <Ellipse cx={120} cy={94} rx={86} ry={31} fill={`url(#plat${uid})`} opacity={0.96} />
          <Ellipse cx={120} cy={94} rx={86} ry={31} fill="none" stroke={withAlpha('#ffffff', 0.75)} strokeWidth={1.4} />
          <Ellipse cx={120} cy={86} rx={66} ry={18} fill={withAlpha('#ffffff', 0.16)} />

          {/* snow cap */}
          {traits.snowCap && <Ellipse cx={120} cy={86} rx={68} ry={15} fill="rgba(255,255,255,0.72)" />}

          {/* lake */}
          {traits.lake && (
            <G>
              <Ellipse cx={126} cy={92} rx={36} ry={11} fill={`url(#water${uid})`} />
              <Path d="M102 91 Q114 87 126 91 T150 91" stroke={withAlpha('#ffffff', 0.6)} strokeWidth={1.1} fill="none" />
              <Path d="M110 95 Q120 92 130 95 T146 95" stroke={withAlpha('#ffffff', 0.35)} strokeWidth={1} fill="none" />
            </G>
          )}

          {/* trees */}
          {traits.trees.map((t, i) => (
            <G key={`t${i}`}>
              <Circle cx={t.x} cy={t.y - 22 * t.s} r={17 * t.s} fill={withAlpha(colors.leaf, 0.22)} />
              <Rect x={t.x - 1.4 * t.s} y={t.y - 12 * t.s} width={2.8 * t.s} height={12 * t.s} fill="#d8cfc4" rx={1.2} />
              <Polygon
                points={`${t.x},${t.y - 40 * t.s} ${t.x - 14 * t.s},${t.y - 9 * t.s} ${t.x + 14 * t.s},${t.y - 9 * t.s}`}
                fill={t.bare ? withAlpha(colors.leaf, 0.35) : withAlpha(colors.leaf, 0.9)}
                stroke={withAlpha('#ffffff', 0.5)}
                strokeWidth={0.8}
              />
              {t.bloom && (
                <Circle cx={t.x} cy={t.y - 26 * t.s} r={9 * t.s} fill={withAlpha(colors.accent, 0.85)} />
              )}
            </G>
          ))}

          {/* crystals */}
          {traits.crystals.map((c, i) => (
            <G key={`c${i}`}>
              <Circle cx={c.x} cy={c.y - 12 * c.s} r={13 * c.s} fill={withAlpha(colors.accent, 0.2)} />
              <Polygon
                points={`${c.x},${c.y - 26 * c.s} ${c.x - 7 * c.s},${c.y} ${c.x},${c.y + 4 * c.s} ${c.x + 7 * c.s},${c.y}`}
                fill={withAlpha(colors.accent, 0.85)}
                stroke={withAlpha('#ffffff', 0.65)}
                strokeWidth={0.9}
              />
              {c.tower && (
                <Polygon
                  points={`${c.x + 10 * c.s},${c.y - 34 * c.s} ${c.x + 5 * c.s},${c.y} ${c.x + 10 * c.s},${c.y + 3 * c.s} ${c.x + 15 * c.s},${c.y}`}
                  fill={withAlpha(colors.glow, 0.7)}
                  stroke={withAlpha('#ffffff', 0.5)}
                  strokeWidth={0.8}
                />
              )}
              {c.broken && (
                <Path d={`M${c.x - 3 * c.s} ${c.y - 16 * c.s} L${c.x + 2 * c.s} ${c.y - 8 * c.s} L${c.x - 2 * c.s} ${c.y - 2 * c.s}`} stroke={withAlpha('#ffffff', 0.8)} strokeWidth={0.9} fill="none" />
              )}
            </G>
          ))}

          {/* flowers */}
          {traits.flowers.map((f, i) => (
            <G key={`f${i}`}>
              {[0, 1, 2, 3, 4].map((p) => (
                <Circle
                  key={p}
                  cx={f.x + 3.2 * f.s * Math.cos((p * Math.PI * 2) / 5)}
                  cy={f.y + 3.2 * f.s * Math.sin((p * Math.PI * 2) / 5)}
                  r={2 * f.s}
                  fill={withAlpha(f.c, 0.9)}
                />
              ))}
              <Circle cx={f.x} cy={f.y} r={1.5 * f.s} fill="#fff8d6" />
            </G>
          ))}
        </Svg>

        {/* animated overlays */}
        {!reduceMotion && (
          <>
            {traits.rain && <IslandRain k={k} seedKey={memory.id} />}
            {traits.waterfall && <Waterfall k={k} />}
            {traits.fog && <IslandFog k={k} opacity={0.22} />}
            {traits.mist && <IslandFog k={k} opacity={0.3} />}
            {traits.aurora && <IslandAurora k={k} colors={colors} />}
            {traits.fragments.length > 0 && <FragmentRing k={k} fragments={traits.fragments} color={withAlpha(colors.accent, 0.8)} />}
            {Array.from({ length: traits.birds }).map((_, i) => (
              <Bird key={`b${i}`} k={k} top={overlaySeeds.birdTops[i % 2]} delay={i * 4200} dur={16000 + i * 5000} />
            ))}
            {Array.from({ length: traits.butterflies }).map((_, i) => (
              <Butterfly key={`bf${i}`} k={k} color={i % 2 ? colors.accent : '#ffd9ec'} cx={overlaySeeds.butterflyPos[i].x} cy={overlaySeeds.butterflyPos[i].y} delay={i * 2600} />
            ))}
            {Array.from({ length: traits.lanterns }).map((_, i) => (
              <Lantern key={`l${i}`} k={k} cx={overlaySeeds.lanternPos[i].x} cy={overlaySeeds.lanternPos[i].y} delay={i * 1600} color="#ffd98a" />
            ))}
            {Array.from({ length: traits.fireflies }).map((_, i) => (
              <FireflyDot key={`ff${i}`} k={k} cx={overlaySeeds.fireflyPos[i].x} cy={overlaySeeds.fireflyPos[i].y} delay={i * 900} />
            ))}
          </>
        )}

        {/* time-travel label */}
        <Animated.View style={[{ position: 'absolute', top: -30 * k, left: 0, right: 0, alignItems: 'center' }, labelStyle]} pointerEvents="none">
          <Text
            style={{
              color: '#ffffff',
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 1,
              textShadowColor: 'rgba(10,15,40,0.6)',
              textShadowRadius: 6,
            }}
          >
            {mood.emoji} {dateLabel}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
