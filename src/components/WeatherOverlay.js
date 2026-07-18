// Real weather falls across the whole world: rain, snow, fog, storms.

import React, { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { makeRng } from '../utils/rng';

const { width: W, height: H } = Dimensions.get('window');

function RainStreak({ x, delay, dur, len, opacity }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(prog.value, [0, 1], [-60, H + 60]) }, { rotate: '13deg' }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: 1.6,
          height: len,
          borderRadius: 1,
          backgroundColor: `rgba(190,212,255,${opacity})`,
        },
        style,
      ]}
    />
  );
}

function SnowFlake({ x, size, delay, dur }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(prog.value, [0, 1], [-40, H + 40]) },
      { translateX: 22 * Math.sin(prog.value * Math.PI * 3) },
    ],
    opacity: 0.85,
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ffffff',
        },
        style,
      ]}
    />
  );
}

function FogBand({ top, delay, dur, opacity }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: dur, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(prog.value, [0, 1], [-70, 70]) }],
    opacity,
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left: -W * 0.3,
          width: W * 1.6,
          height: 110,
          borderRadius: 60,
          backgroundColor: 'rgba(228,236,248,0.13)',
        },
        style,
      ]}
    />
  );
}

function Lightning() {
  const flash = useSharedValue(0);
  useEffect(() => {
    flash.value = withRepeat(
      withSequence(
        withDelay(6000, withTiming(0.65, { duration: 70 })),
        withTiming(0, { duration: 90 }),
        withTiming(0.35, { duration: 60 }),
        withTiming(0, { duration: 140 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: flash.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#dfe8ff' }, style]}
    />
  );
}

export default function WeatherOverlay({ type, reduceMotion }) {
  const drops = useMemo(() => {
    const rng = makeRng(`rain-${type}`);
    const count = type === 'storm' ? 34 : 22;
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      x: rng.range(0, W),
      delay: rng.int(0, 1600),
      dur: rng.int(750, 1150),
      len: rng.range(14, 26),
      opacity: rng.range(0.3, 0.55),
    }));
  }, [type]);

  const flakes = useMemo(() => {
    const rng = makeRng('snow');
    return Array.from({ length: 26 }, (_, i) => ({
      key: i,
      x: rng.range(0, W),
      size: rng.range(2.5, 5),
      delay: rng.int(0, 6000),
      dur: rng.int(6500, 11000),
    }));
  }, []);

  if (reduceMotion || !type) return null;

  if (type === 'rain' || type === 'drizzle' || type === 'storm') {
    return (
      <>
        {drops.map((d) => (
          <RainStreak key={d.key} {...d} />
        ))}
        {type === 'storm' && <Lightning />}
      </>
    );
  }
  if (type === 'snow') {
    return flakes.map((f) => <SnowFlake key={f.key} {...f} />);
  }
  if (type === 'fog') {
    return (
      <>
        <FogBand top={H * 0.3} delay={0} dur={11000} opacity={1} />
        <FogBand top={H * 0.55} delay={2500} dur={14000} opacity={0.8} />
        <FogBand top={H * 0.75} delay={5000} dur={10000} opacity={0.6} />
      </>
    );
  }
  return null;
}
