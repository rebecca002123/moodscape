// Floating light motes — and golden fireflies once your world has grown.

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
} from 'react-native-reanimated';
import { makeRng } from '../utils/rng';

const { width: W, height: H } = Dimensions.get('window');

function Mote({ x, y, size, color, delay, dur, drift }) {
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
    opacity: 0.15 + prog.value * 0.55,
    transform: [{ translateY: -drift * prog.value }, { translateX: drift * 0.4 * Math.sin(prog.value * Math.PI) }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x * W,
          top: y * H,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: 6,
        },
        style,
      ]}
    />
  );
}

function Firefly({ x, y, delay }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.6 * Math.abs(Math.sin(prog.value * Math.PI * 4)),
    transform: [
      { translateX: 60 * Math.sin(prog.value * Math.PI * 2) },
      { translateY: 40 * Math.cos(prog.value * Math.PI * 3) },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x * W,
          top: y * H,
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#ffe9a0',
          shadowColor: '#ffd76a',
          shadowOpacity: 1,
          shadowRadius: 8,
        },
        style,
      ]}
    />
  );
}

export default function Particles({ fireflies, reduceMotion }) {
  const motes = useMemo(() => {
    const rng = makeRng('moodscape-motes');
    const colors = ['#ffffff', '#fff3c4', '#cfe8ff', '#ffd9ec'];
    return Array.from({ length: 20 }, (_, i) => ({
      key: i,
      x: rng.next(),
      y: rng.range(0.08, 0.9),
      size: rng.range(2, 4.5),
      color: rng.pick(colors),
      delay: rng.int(0, 5000),
      dur: rng.int(3600, 8200),
      drift: rng.range(14, 42),
    }));
  }, []);

  const flies = useMemo(() => {
    const rng = makeRng('moodscape-fireflies');
    return Array.from({ length: 7 }, (_, i) => ({
      key: i,
      x: rng.range(0.05, 0.9),
      y: rng.range(0.35, 0.85),
      delay: rng.int(0, 6000),
    }));
  }, []);

  if (reduceMotion) return null;

  return (
    <>
      {motes.map((m) => (
        <Mote key={m.key} {...m} />
      ))}
      {fireflies && flies.map((f) => <Firefly key={`f${f.key}`} {...f} />)}
    </>
  );
}
