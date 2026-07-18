// Every finished focus session becomes a firefly that lives in the clearing.
// Longer sessions burn a little bigger. They drift on seeded paths — your
// own private constellation of finished work.

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { makeRng } from '../utils/rng';

const MAX_VISIBLE = 60;

function Firefly({ session, width, height, reduceMotion }) {
  const rng = useMemo(() => makeRng(session.id), [session.id]);
  const home = useMemo(
    () => ({
      x: rng.range(width * 0.08, width * 0.92),
      y: rng.range(height * 0.08, height * 0.52),
      size: 3 + Math.min(session.minutes / 12, 4),
      driftX: rng.range(8, 26) * (rng.chance(0.5) ? 1 : -1),
      driftY: rng.range(6, 18),
      period: rng.range(3200, 6400),
    }),
    [rng, width, height, session.minutes]
  );

  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: home.period,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: home.period,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, home.period, reduceMotion]);

  const s = home.size;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: home.x,
        top: home.y,
        opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 1, 0.35] }),
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, home.driftX] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, home.driftY] }) },
        ],
      }}
    >
      <View
        style={{
          width: s * 3,
          height: s * 3,
          borderRadius: s * 1.5,
          backgroundColor: '#d8ff9d',
          opacity: 0.18,
          position: 'absolute',
          left: -s,
          top: -s,
        }}
      />
      <View
        style={{
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: '#eaffb0',
        }}
      />
    </Animated.View>
  );
}

export default function Fireflies({ sessions, width, height, reduceMotion }) {
  const visible = sessions.slice(-MAX_VISIBLE);
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      {visible.map((s) => (
        <Firefly key={s.id} session={s} width={width} height={height} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}
