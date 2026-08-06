// The mountain at night: layered ridgelines under a thin field of stars.
// Everything is seeded — your mountain never rearranges itself.

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { makeRng } from '../utils/rng';

function ridgePath(rng, width, height, baseY, jag, peaks) {
  const step = width / peaks;
  let d = `M -10 ${baseY}`;
  let x = -10;
  while (x < width + 10) {
    const nx = x + step * rng.range(0.7, 1.3);
    const ny = baseY - rng.range(0.15, 1) * jag;
    d += ` L ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
  }
  d += ` L ${width + 10} ${baseY} L ${width + 10} ${height + 10} L -10 ${height + 10} Z`;
  return d;
}

export default function RidgeBackdrop({ width, height }) {
  const { stars, farRidge, nearRidge } = useMemo(() => {
    const rng = makeRng('summit-mountain');
    const starList = [];
    for (let i = 0; i < 46; i++) {
      starList.push({
        x: rng.range(0, width),
        y: rng.range(0, height * 0.55),
        r: rng.range(0.5, 1.5),
        o: rng.range(0.15, 0.65),
      });
    }
    return {
      stars: starList,
      farRidge: ridgePath(rng, width, height, height * 0.66, height * 0.09, 7),
      nearRidge: ridgePath(rng, width, height, height * 0.8, height * 0.07, 5),
    };
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#05070f', '#081020', '#0b1526']}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dceef2" opacity={s.o} />
        ))}
        <Path d={farRidge} fill="#0a1322" />
        <Path d={nearRidge} fill="#070d19" />
      </Svg>
    </View>
  );
}
