// The endless sky: crossfading gradients for the hour of the day,
// a sun or moon drifting across it, stars and aurora when night falls.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { makeRng } from '../utils/rng';

const { width: W, height: H } = Dimensions.get('window');

function TwinkleStar({ x, y, size, delay, nightSV }) {
  const tw = useSharedValue(0.3);
  useEffect(() => {
    tw.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0.25, { duration: 1600 })), -1, true)
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: tw.value * nightSV.value }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x * W,
          top: y * H * 0.62,
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

function StaticStar({ x, y, size, nightSV }) {
  const style = useAnimatedStyle(() => ({ opacity: 0.75 * nightSV.value }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x * W,
          top: y * H * 0.62,
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

function AuroraRibbon({ nightSV, colors, top, delay, duration, rotate }) {
  const loop = useSharedValue(0.35);
  useEffect(() => {
    loop.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: loop.value * nightSV.value,
    transform: [{ translateY: interpolate(loop.value, [0.3, 0.85], [0, -26]) }, { rotate }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top, left: -W * 0.3, width: W * 1.6, height: 150 }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, borderRadius: 80 }}
      />
    </Animated.View>
  );
}

export default function Sky({ palette, reduceMotion }) {
  const [prev, setPrev] = useState(palette);
  const [curr, setCurr] = useState(palette);
  const currRef = useRef(palette);
  const fade = useSharedValue(1);
  const nightSV = useSharedValue(palette.night);
  const orbSV = useSharedValue(palette.orb);

  useEffect(() => {
    if (palette === currRef.current) return;
    setPrev(currRef.current);
    setCurr(palette);
    currRef.current = palette;
    fade.value = 0;
    fade.value = withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) });
    nightSV.value = withTiming(palette.night, { duration: 2500 });
    orbSV.value = withTiming(palette.orb, { duration: 2500, easing: Easing.inOut(Easing.sin) });
  }, [palette]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const orbStyle = useAnimatedStyle(() => ({
    top: interpolate(orbSV.value, [0, 1], [H * 0.74, H * 0.1]),
    opacity: interpolate(fade.value, [0, 1], [0.4, 1]),
  }));

  const stars = useMemo(() => {
    const rng = makeRng('moodscape-stars');
    return Array.from({ length: 64 }, (_, i) => ({
      key: i,
      x: rng.next(),
      y: rng.next(),
      size: rng.range(1, 2.6),
      delay: rng.int(0, 4000),
    }));
  }, []);

  return (
    <>
      {/* base sky + crossfade layer */}
      <LinearGradient colors={[prev.top, prev.mid, prev.bot]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]} pointerEvents="none">
        <LinearGradient colors={[curr.top, curr.mid, curr.bot]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* stars */}
      {stars.map((s) =>
        reduceMotion ? (
          <StaticStar key={s.key} x={s.x} y={s.y} size={s.size} nightSV={nightSV} />
        ) : (
          <TwinkleStar key={s.key} {...s} nightSV={nightSV} />
        )
      )}

      {/* aurora */}
      {!reduceMotion && (
        <>
          <AuroraRibbon
            nightSV={nightSV}
            colors={['rgba(110,255,200,0)', 'rgba(110,255,200,0.35)', 'rgba(140,160,255,0.28)', 'rgba(110,255,200,0)']}
            top={H * 0.06}
            delay={0}
            duration={9000}
            rotate="-14deg"
          />
          <AuroraRibbon
            nightSV={nightSV}
            colors={['rgba(190,140,255,0)', 'rgba(140,255,220,0.25)', 'rgba(190,140,255,0.3)', 'rgba(190,140,255,0)']}
            top={H * 0.16}
            delay={3500}
            duration={12000}
            rotate="-10deg"
          />
        </>
      )}

      {/* sun / moon */}
      <Animated.View style={[{ position: 'absolute', left: W * 0.62 }, orbStyle]} pointerEvents="none">
        <Animated.View style={[styles.orbGlow, { backgroundColor: curr.orbColor, opacity: 0.10, width: 230, height: 230, borderRadius: 115 }]} />
        <Animated.View style={[styles.orbGlow, { backgroundColor: curr.orbColor, opacity: 0.16, width: 150, height: 150, borderRadius: 75, position: 'absolute', top: 40, left: 40 }]} />
        <Animated.View
          style={[
            styles.orbGlow,
            {
              backgroundColor: curr.orbColor,
              opacity: curr.isMoon ? 0.9 : 0.95,
              width: 84,
              height: 84,
              borderRadius: 42,
              position: 'absolute',
              top: 73,
              left: 73,
              shadowColor: curr.orbColor,
              shadowOpacity: 0.9,
              shadowRadius: 30,
            },
          ]}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  orbGlow: {
    alignSelf: 'flex-start',
  },
});
