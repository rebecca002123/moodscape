// The altimeter: where you stand on the 300–850 mountain right now.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { SCORE_MIN, SCORE_MAX, BANDS, bandFor, clampScore, formatDateShort } from '../utils/scoreMath';

const SWEEP = 240; // degrees, from -120 (left) to +120 (right)

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function degFor(score) {
  const f = (clampScore(score) - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  return -SWEEP / 2 + SWEEP * f;
}

export default function ScoreDial({ score, previous, size = 250 }) {
  const band = bandFor(score);
  const cx = size / 2;
  const cy = size * 0.52;
  const r = size * 0.4;
  const endDeg = Math.max(degFor(score), -SWEEP / 2 + 1.5);

  const delta = previous ? score - previous.score : null;

  return (
    <View style={{ width: size, height: size * 0.8, alignItems: 'center' }}>
      <Svg width={size} height={size * 0.8} style={StyleSheet.absoluteFill}>
        <Path
          d={arcPath(cx, cy, r, -SWEEP / 2, SWEEP / 2)}
          stroke="rgba(220,238,242,0.1)"
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={arcPath(cx, cy, r, -SWEEP / 2, endDeg)}
          stroke={band.color}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        {BANDS.slice(1).map((b) => {
          const d = degFor(b.min);
          const p1 = polar(cx, cy, r - 11, d);
          const p2 = polar(cx, cy, r - 17, d);
          return (
            <Line
              key={b.name}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(220,238,242,0.28)"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      <View style={[styles.center, { top: cy - 46 }]}>
        <Text style={styles.score}>{score}</Text>
        <Text style={[styles.band, { color: band.color }]}>{band.name}</Text>
        {delta !== null && (
          <Text style={styles.delta} numberOfLines={1}>
            {delta === 0 ? 'no change' : `${delta > 0 ? '▲ +' : '▼ '}${delta} pts`} since {formatDateShort(previous.ts)}
          </Text>
        )}
      </View>

      <Text style={[styles.rangeLabel, { left: cx - r - 10, top: cy + r * 0.56 }]}>{SCORE_MIN}</Text>
      <Text style={[styles.rangeLabel, { left: cx + r - 14, top: cy + r * 0.56 }]}>{SCORE_MAX}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center' },
  score: { color: '#eaf4f6', fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  band: { fontSize: 15, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  delta: { color: 'rgba(220,238,242,0.6)', fontSize: 11.5, marginTop: 6, maxWidth: 150, textAlign: 'center' },
  rangeLabel: { position: 'absolute', color: 'rgba(220,238,242,0.35)', fontSize: 11 },
});
