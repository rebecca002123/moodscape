import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Svg, {
  Circle, Defs, Ellipse, LinearGradient as SvgLinearGradient,
  Path, RadialGradient, Stop,
} from 'react-native-svg';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withSpring, withTiming,
} from 'react-native-reanimated';
import { MOODS } from '../theme/moods';

// A little glass sphere with a face. The mouth's curve follows the mood
// score, the highlight sells the "liquid glass ball" illusion.
export function OrbGraphic({ mood, size, face = true }) {
  const m = MOODS[mood];
  const s = size;
  const c = s / 2;
  const curl = (m.score - 3.2) / 3; // -0.73 … 0.93
  const mouthW = s * 0.30;
  const mouthY = c + s * 0.16;
  const mouthLift = -curl * s * 0.13;
  const eyeY = c - s * 0.04;
  const eyeDX = s * 0.14;
  const eyeR = Math.max(1.6, s * 0.045);

  return (
    <Svg width={s} height={s}>
      <Defs>
        <SvgLinearGradient id="body" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={m.gradient[0]} />
          <Stop offset="1" stopColor={m.gradient[1]} />
        </SvgLinearGradient>
        <RadialGradient id="sheen" cx="0.32" cy="0.25" r="0.5">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="rim" cx="0.5" cy="1" r="0.65">
          <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={c - 1} fill="url(#body)" />
      <Circle cx={c} cy={c} r={c - 1} fill="url(#rim)" />
      <Ellipse cx={c - s * 0.14} cy={c - s * 0.22} rx={s * 0.22} ry={s * 0.14} fill="url(#sheen)" />
      <Circle cx={c} cy={c} r={c - 1} stroke="rgba(255,255,255,0.55)" strokeWidth={1} fill="none" />
      {face && (
        <>
          <Circle cx={c - eyeDX} cy={eyeY} r={eyeR} fill="rgba(20,24,48,0.78)" />
          <Circle cx={c + eyeDX} cy={eyeY} r={eyeR} fill="rgba(20,24,48,0.78)" />
          <Path
            d={`M ${c - mouthW / 2} ${mouthY} Q ${c} ${mouthY + mouthLift * 2} ${c + mouthW / 2} ${mouthY}`}
            stroke="rgba(20,24,48,0.78)"
            strokeWidth={Math.max(1.6, s * 0.035)}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}

// Selectable orb for the picker row.
export function MoodOrb({ mood, size = 52, selected, onPress }) {
  const m = MOODS[mood];
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(selected ? 1 : 0, { damping: 12, stiffness: 220 });
  }, [selected, lift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * (1 + lift.value * 0.18) },
      { translateY: lift.value * -6 },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Mood: ${m.label}`}
      accessibilityState={{ selected: !!selected }}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 16, stiffness: 380 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
    >
      <Animated.View
        style={[
          style,
          selected && {
            shadowColor: m.glow, shadowOpacity: 0.9, shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 }, elevation: 10,
          },
        ]}
      >
        <OrbGraphic mood={mood} size={size} />
      </Animated.View>
    </Pressable>
  );
}

// The big breathing orb shown once a mood is chosen.
export function HeroOrb({ mood, size = 150 }) {
  const still = useReducedMotion();
  const breath = useSharedValue(0);
  const pop = useSharedValue(0.6);

  useEffect(() => {
    pop.value = 0.6;
    pop.value = withSpring(1, { damping: 11, stiffness: 160 });
  }, [mood, pop]);

  useEffect(() => {
    if (still) return;
    breath.value = withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [still, breath]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: pop.value * (1 + breath.value * 0.035) },
      { translateY: breath.value * -5 },
    ],
  }));

  const m = MOODS[mood];
  return (
    <View
      style={{
        shadowColor: m.glow, shadowOpacity: 0.8, shadowRadius: 34,
        shadowOffset: { width: 0, height: 12 }, elevation: 14,
      }}
    >
      <Animated.View style={style}>
        <OrbGraphic mood={mood} size={size} />
      </Animated.View>
    </View>
  );
}
