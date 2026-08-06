// The ascent: the trail you've logged behind you, and the forecast cone ahead —
// solid where you've been, dashed where the route is only estimated.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { addMonths, formatMonthShort, clampScore } from '../utils/scoreMath';

const PAD_L = 36;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 26;

function niceStep(range) {
  if (range <= 40) return 10;
  if (range <= 80) return 20;
  if (range <= 160) return 40;
  if (range <= 320) return 80;
  return 100;
}

export default function AscentChart({ forecast, entries, goal, width, height = 230 }) {
  const geom = useMemo(() => {
    if (!forecast) return null;
    const now = forecast.now;
    const xMinData = Math.min(
      entries.length ? entries[0].ts : now,
      addMonths(now, -1)
    );
    const xMin = Math.max(xMinData, addMonths(now, -14));
    const xMax = addMonths(now, 12);

    const visibleEntries = entries.filter((e) => e.ts >= xMin);
    const ys = [
      ...visibleEntries.map((e) => e.score),
      ...forecast.points.map((p) => p.lo),
      ...forecast.points.map((p) => p.hi),
    ];
    if (goal != null) ys.push(goal);
    let yMin = Math.min(...ys) - 12;
    let yMax = Math.max(...ys) + 12;
    yMin = clampScore(Math.floor(yMin / 10) * 10);
    yMax = clampScore(Math.ceil(yMax / 10) * 10);
    if (yMax - yMin < 30) { yMin = clampScore(yMin - 15); yMax = clampScore(yMax + 15); }

    const x = (ts) => PAD_L + ((ts - xMin) / (xMax - xMin)) * (width - PAD_L - PAD_R);
    const y = (s) => PAD_T + ((yMax - s) / (yMax - yMin)) * (height - PAD_T - PAD_B);

    const step = niceStep(yMax - yMin);
    const gridYs = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) gridYs.push(v);

    // Uncertainty cone: lo edge forward, hi edge back.
    const pts = forecast.points;
    let cone = `M ${x(pts[0].ts)} ${y(pts[0].lo)}`;
    pts.forEach((p) => { cone += ` L ${x(p.ts)} ${y(p.lo)}`; });
    [...pts].reverse().forEach((p) => { cone += ` L ${x(p.ts)} ${y(p.hi)}`; });
    cone += ' Z';

    let midPath = `M ${x(pts[0].ts)} ${y(pts[0].mid)}`;
    pts.slice(1).forEach((p) => { midPath += ` L ${x(p.ts)} ${y(p.mid)}`; });

    const trail = visibleEntries.map((e) => `${x(e.ts)},${y(e.score)}`).join(' ');

    // Interpolate the mid line so waypoint dots sit on the route.
    const midAt = (ts) => {
      if (ts <= pts[0].ts) return pts[0].mid;
      for (let i = 1; i < pts.length; i++) {
        if (ts <= pts[i].ts) {
          const f = (ts - pts[i - 1].ts) / (pts[i].ts - pts[i - 1].ts);
          return pts[i - 1].mid + f * (pts[i].mid - pts[i - 1].mid);
        }
      }
      return pts[pts.length - 1].mid;
    };

    const ticks = [0, 3, 6, 9, 12].map((m) => ({
      x: x(pts[m].ts),
      label: m === 0 ? 'now' : formatMonthShort(pts[m].ts),
    }));
    if (visibleEntries.length && x(visibleEntries[0].ts) < ticks[0].x - 54) {
      ticks.unshift({ x: x(visibleEntries[0].ts), label: formatMonthShort(visibleEntries[0].ts) });
    }

    return { x, y, gridYs, cone, midPath, trail, visibleEntries, midAt, ticks, now };
  }, [forecast, entries, goal, width, height]);

  if (!geom || !forecast) return null;
  const { x, y, gridYs, cone, midPath, trail, visibleEntries, midAt, ticks } = geom;
  const last = visibleEntries[visibleEntries.length - 1];

  return (
    <View
      style={{ width }}
      accessible
      accessibilityLabel="Chart of logged scores and the estimated range for the next twelve months"
    >
      <Svg width={width} height={height}>
        {gridYs.map((v) => (
          <React.Fragment key={v}>
            <Line x1={PAD_L} y1={y(v)} x2={width - PAD_R} y2={y(v)} stroke="rgba(220,238,242,0.07)" strokeWidth={1} />
            <SvgText x={PAD_L - 6} y={y(v) + 3.5} fill="rgba(220,238,242,0.4)" fontSize={10} textAnchor="end">
              {v}
            </SvgText>
          </React.Fragment>
        ))}

        {goal != null && goal >= gridYs[0] - 5 && (
          <>
            <Line
              x1={PAD_L} y1={y(goal)} x2={width - PAD_R} y2={y(goal)}
              stroke="#f2d06b" strokeWidth={1} strokeDasharray="3 5" opacity={0.55}
            />
            <SvgText x={width - PAD_R} y={y(goal) - 5} fill="#f2d06b" fontSize={10} textAnchor="end" opacity={0.8}>
              checkpoint {goal}
            </SvgText>
          </>
        )}

        <Line
          x1={x(geom.now)} y1={PAD_T} x2={x(geom.now)} y2={height - PAD_B}
          stroke="rgba(220,238,242,0.14)" strokeWidth={1} strokeDasharray="2 5"
        />

        <Path d={cone} fill="rgba(95,208,199,0.11)" />
        <Path d={midPath} stroke="#5fd0c7" strokeWidth={2} strokeDasharray="6 6" fill="none" />

        {visibleEntries.length > 1 && (
          <Polyline points={trail} stroke="rgba(234,244,246,0.85)" strokeWidth={2} fill="none" />
        )}
        {visibleEntries.map((e) => (
          <Circle key={e.id} cx={x(e.ts)} cy={y(e.score)} r={3} fill="#eaf4f6" opacity={0.9} />
        ))}
        {last && <Circle cx={x(last.ts)} cy={y(last.score)} r={4.5} fill="#5fd0c7" />}

        {forecast.waypoints.map((w) => (
          <Circle key={w.id} cx={x(w.ts)} cy={y(midAt(w.ts))} r={3.2} fill="#7fd6a4" stroke="#0b1526" strokeWidth={1} />
        ))}

        {ticks.map((t) => (
          <SvgText key={t.label + t.x} x={t.x} y={height - 8} fill="rgba(220,238,242,0.4)" fontSize={10} textAnchor="middle">
            {t.label}
          </SvgText>
        ))}
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: 'rgba(234,244,246,0.85)' }]} />
          <Text style={styles.legendText}>logged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, styles.swatchDashed]} />
          <Text style={styles.legendText}>estimated route</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: 'rgba(95,208,199,0.25)', width: 14 }]} />
          <Text style={styles.legendText}>likely range</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 12, height: 3, borderRadius: 2 },
  swatchDashed: { backgroundColor: '#5fd0c7', width: 12 },
  legendText: { color: 'rgba(220,238,242,0.55)', fontSize: 11 },
});
