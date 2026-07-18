import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/theme';

const { width: W, height: H } = Dimensions.get('window');

// A soft radial blob of light. The SVG paints the falloff; Reanimated
// drifts the whole view slowly so the glass above always has something
// moving underneath it to refract.
function Blob({ color, opacity, size, x, y, dx, dy, duration, delayFactor, still }) {
  const p = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    p.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [still, duration, p]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + p.value * dx },
      { translateY: y + p.value * dy },
      { scale: 1 + p.value * 0.14 * delayFactor },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="70%" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)" />
      </Svg>
    </Animated.View>
  );
}

// `accent` lets a screen wash the sky with the selected mood's glow.
export default function AuroraBackground({ accent }) {
  const t = useTheme();
  const still = useReducedMotion();
  const accentOpacity = useSharedValue(0);

  useEffect(() => {
    accentOpacity.value = withTiming(accent ? 1 : 0, { duration: 700 });
  }, [accent, accentOpacity]);

  const accentStyle = useAnimatedStyle(() => ({ opacity: accentOpacity.value }));

  const blobs = [
    { size: W * 1.5, x: -W * 0.55, y: -H * 0.18, dx: W * 0.22, dy: H * 0.05, duration: 16000 },
    { size: W * 1.3, x: W * 0.25, y: H * 0.05, dx: -W * 0.18, dy: H * 0.10, duration: 21000 },
    { size: W * 1.6, x: -W * 0.30, y: H * 0.45, dx: W * 0.16, dy: -H * 0.08, duration: 26000 },
    { size: W * 1.2, x: W * 0.15, y: H * 0.68, dx: -W * 0.20, dy: -H * 0.06, duration: 19000 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[t.bg, t.bgSoft, t.bg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {blobs.map((b, i) => (
        <Blob
          key={i}
          {...b}
          color={t.aurora[i % t.aurora.length].color}
          opacity={t.aurora[i % t.aurora.length].opacity}
          delayFactor={(i % 3) / 3 + 0.4}
          still={still}
        />
      ))}
      {accent ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, accentStyle]}>
          <Blob
            color={accent}
            opacity={t.scheme === 'dark' ? 0.34 : 0.5}
            size={W * 1.7}
            x={-W * 0.35}
            y={-H * 0.25}
            dx={W * 0.1}
            dy={H * 0.06}
            duration={12000}
            delayFactor={0.8}
            still={still}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
