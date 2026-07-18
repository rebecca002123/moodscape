import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Defs, Line, LinearGradient as SvgLinearGradient, Path, Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MOODS, MOOD_ORDER, scoreColor } from '../theme/moods';
import { daysAgoKey } from '../utils/dates';
import { useTheme, radius as R } from '../theme/theme';
import { Txt } from './Glass';

// ---------------------------------------------------------------------------
// MoodCurve — a smooth area chart of daily mood. Missing days become gaps
// in the dots but the curve flows through the days that exist.
// ---------------------------------------------------------------------------

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function MoodCurve({ series, height = 150 }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const padX = 10;
  const padTop = 14;
  const padBottom = 22;

  const n = series.length;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const xAt = (i) => padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (s) => padTop + (1 - (s - 1) / 5) * innerH;

  const points = series
    .map((d, i) => (d.score == null ? null : { x: xAt(i), y: yAt(d.score), i }))
    .filter(Boolean);

  const line = smoothPath(points);
  const area = points.length >= 2
    ? `${line} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`
    : '';

  const labelIdx = n <= 8
    ? series.map((_, i) => i)
    : [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];

  const dayLetter = (key) => 'SMTWTFS'[new Date(`${key}T12:00:00`).getDay()];
  const dayNum = (key) => `${Number(key.slice(8))}`;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        points.length >= 2 ? (
          <Svg width={width} height={height}>
            <Defs>
              <SvgLinearGradient id="stroke" x1="0" y1={padTop} x2="0" y2={height - padBottom} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={MOODS.radiant.tint} />
                <Stop offset="0.5" stopColor={MOODS.calm.tint} />
                <Stop offset="1" stopColor={MOODS.stormy.tint} />
              </SvgLinearGradient>
              <SvgLinearGradient id="fill" x1="0" y1={padTop} x2="0" y2={height - padBottom} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={MOODS.calm.tint} stopOpacity="0.35" />
                <Stop offset="1" stopColor={MOODS.calm.tint} stopOpacity="0.02" />
              </SvgLinearGradient>
            </Defs>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <Line
                key={s} x1={padX} x2={width - padX} y1={yAt(s)} y2={yAt(s)}
                stroke={t.text} strokeOpacity={0.06} strokeWidth={1}
              />
            ))}
            {area ? <Path d={area} fill="url(#fill)" /> : null}
            <Path d={line} stroke="url(#stroke)" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            {points.map((pt) => (
              <Circle
                key={pt.i} cx={pt.x} cy={pt.y} r={3.4}
                fill={scoreColor(series[pt.i].score)}
                stroke={t.scheme === 'dark' ? 'rgba(255,255,255,0.7)' : '#fff'}
                strokeWidth={1.2}
              />
            ))}
          </Svg>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="subhead" c="tertiary">Check in for a couple of days to grow your curve</Txt>
          </View>
        )
      )}
      {width > 0 && points.length >= 2 && (
        <View
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: padBottom, justifyContent: 'center',
          }}
        >
          {labelIdx.map((i) => (
            <Txt
              key={i} v="caption" c="tertiary"
              style={{
                position: 'absolute',
                left: xAt(i) - 14, width: 28, textAlign: 'center',
              }}
            >
              {n <= 8 ? dayLetter(series[i].key) : dayNum(series[i].key)}
            </Txt>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MonthHeatmap — the last five weeks as tinted glass tiles.
// ---------------------------------------------------------------------------

export function MonthHeatmap({ averages }) {
  const t = useTheme();
  // End the grid on the current weekday, going back exactly 5 rows of weeks.
  const today = new Date();
  const tail = 6 - today.getDay(); // empty cells after today to finish the week
  const total = 35;
  const cells = [];
  for (let i = total - tail - 1; i >= 0; i--) {
    const key = daysAgoKey(i);
    cells.push({ key, score: averages[key] ?? null, isToday: i === 0 });
  }
  for (let i = 0; i < tail; i++) cells.push({ key: `pad-${i}`, score: null, pad: true });

  const rows = [];
  for (let r = 0; r < 5; r++) rows.push(cells.slice(r * 7, r * 7 + 7));

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Txt key={i} v="caption" c="tertiary" style={{ flex: 1, textAlign: 'center' }}>{d}</Txt>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 6 }}>
          {row.map((cell, ci) => (
            <View
              key={cell.key + ci}
              accessibilityLabel={cell.pad ? undefined : cell.key}
              style={{
                flex: 1, aspectRatio: 1, borderRadius: 9,
                backgroundColor: cell.pad
                  ? 'transparent'
                  : cell.score == null
                    ? t.glass.fill
                    : scoreColor(cell.score),
                opacity: cell.pad ? 0 : cell.score == null ? 1 : 0.92,
                borderWidth: cell.isToday ? 1.5 : cell.pad ? 0 : 1,
                borderColor: cell.isToday ? t.text : t.glass.stroke,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MoodBars — how often each mood shows up.
// ---------------------------------------------------------------------------

export function MoodBars({ distribution }) {
  const t = useTheme();
  const max = Math.max(1, ...Object.values(distribution));
  return (
    <View style={{ gap: 10 }}>
      {MOOD_ORDER.map((key) => {
        const m = MOODS[key];
        const count = distribution[key] || 0;
        return (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Txt v="footnote" c="secondary" style={{ width: 58 }}>{m.label}</Txt>
            <View
              style={{
                flex: 1, height: 12, borderRadius: R.capsule,
                backgroundColor: t.glass.fill, overflow: 'hidden',
              }}
            >
              {count > 0 && (
                <LinearGradient
                  colors={m.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${Math.max(6, (count / max) * 100)}%`,
                    height: '100%', borderRadius: R.capsule,
                  }}
                />
              )}
            </View>
            <Txt v="footnote" c="tertiary" style={{ width: 26, textAlign: 'right' }}>{count}</Txt>
          </View>
        );
      })}
    </View>
  );
}
