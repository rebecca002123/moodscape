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

// A soft pool of coloured light, drifting slowly under the glass.
function Pool({ color, opacity, size, x, y, dx, dy, duration, still }) {
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
      { scale: 1 + p.value * 0.12 },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="pool" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="65%" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#pool)" />
      </Svg>
    </Animated.View>
  );
}

// A slanted shaft of light, as if the UI sat behind a prism.
function Beam({ color, opacity, left, width, angle, drift, duration, still }) {
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
      { translateX: left + p.value * drift },
      { rotate: `${angle}deg` },
    ],
    opacity: 0.75 + p.value * 0.25,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: -H * 0.3, height: H * 1.6, width }, style]}
    >
      <LinearGradient
        colors={['transparent', color, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
    </Animated.View>
  );
}

export default function Backdrop() {
  const t = useTheme();
  const still = useReducedMotion();
  const [b0, b1, b2, b3] = t.beams;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[t.bg, t.bgSoft, t.bg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Pool color={b1.color} opacity={b1.opacity} size={W * 1.5} x={-W * 0.5} y={-H * 0.15} dx={W * 0.2} dy={H * 0.06} duration={19000} still={still} />
      <Pool color={b0.color} opacity={b0.opacity} size={W * 1.3} x={W * 0.3} y={H * 0.3} dx={-W * 0.22} dy={H * 0.08} duration={24000} still={still} />
      <Pool color={b2.color} opacity={b2.opacity} size={W * 1.4} x={-W * 0.25} y={H * 0.6} dx={W * 0.18} dy={-H * 0.07} duration={28000} still={still} />
      <Beam color={b0.color} opacity={b0.opacity * 0.7} left={W * 0.12} width={W * 0.2} angle={24} drift={W * 0.1} duration={17000} still={still} />
      <Beam color={b3.color} opacity={b3.opacity} left={W * 0.55} width={W * 0.26} angle={24} drift={-W * 0.12} duration={23000} still={still} />
      <Beam color={b2.color} opacity={b2.opacity * 0.6} left={W * 0.82} width={W * 0.16} angle={24} drift={W * 0.08} duration={21000} still={still} />
    </View>
  );
}
