// A dark clearing at the edge of a forest: night gradient, a few stars,
// tree silhouettes leaning in — and a warm glow when the fire is lit.

import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';
import { makeRng } from '../utils/rng';

function Tree({ x, baseY, height, width, flip }) {
  // Three stacked triangles make a pine.
  const layers = [0.0, 0.28, 0.52];
  return (
    <>
      {layers.map((offset, i) => {
        const top = baseY - height + height * offset;
        const w = width * (0.55 + offset);
        const bottom = top + height * 0.42;
        return (
          <Polygon
            key={i}
            points={`${x},${top} ${x - w / 2},${bottom} ${x + w / 2},${bottom}`}
            fill={flip ? '#080d18' : '#0a1020'}
          />
        );
      })}
    </>
  );
}

export default function ForestBackdrop({ width, height, glow }) {
  const stars = useMemo(() => {
    const rng = makeRng('ember-stars');
    return Array.from({ length: 46 }, (_, i) => ({
      id: i,
      x: rng.range(0, width),
      y: rng.range(0, height * 0.5),
      size: rng.range(1, 2.4),
      opacity: rng.range(0.2, 0.7),
    }));
  }, [width, height]);

  const trees = useMemo(() => {
    const rng = makeRng('ember-trees');
    const line = [];
    let x = -20;
    while (x < width + 40) {
      const h = rng.range(height * 0.16, height * 0.3);
      line.push({ x, h, w: h * 0.62, flip: rng.chance(0.5) });
      x += rng.range(46, 90);
    }
    return line;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#05070f', '#0b1224', '#152036', '#1d2a40']}
        style={StyleSheet.absoluteFill}
      />
      {stars.map((s) => (
        <View
          key={s.id}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.size,
            backgroundColor: '#e8eeff',
            opacity: s.opacity,
          }}
        />
      ))}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {trees.map((t, i) => (
          <Tree key={i} x={t.x} baseY={height * 0.82} height={t.h} width={t.w} flip={t.flip} />
        ))}
      </Svg>
      {/* Warm light spilling from the fire across the clearing. */}
      <Animated.View
        style={{
          position: 'absolute',
          left: width / 2 - width * 0.75,
          top: height * 0.42,
          width: width * 1.5,
          height: width * 1.5,
          borderRadius: width * 0.75,
          backgroundColor: '#ff9d4d',
          opacity: glow,
        }}
      />
    </View>
  );
}
