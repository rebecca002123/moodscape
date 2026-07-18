import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// A liquid ring that fills with light. `progress` is 0..1; the stroke wears
// a gradient and lands with a spring rather than a linear crawl.
export default function ProgressRing({
  progress, size = 56, stroke = 6, colors, trackColor, children, gradientId = 'ring',
}) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withSpring(Math.min(1, Math.max(0, progress)), { damping: 18, stiffness: 90 });
  }, [progress, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - p.value),
  }));

  const [from, to] = colors || ['#22D3EE', '#818CF8'];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={c} cy={c} r={r}
          stroke={trackColor || t.ringTrack}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={c} cy={c} r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      {children}
    </View>
  );
}
