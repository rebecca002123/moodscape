// The route report: is the score going up, by how much, and when — in plain
// words, with the reasoning on display and the honesty built in.

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { formatDelta, formatMonth } from '../utils/scoreMath';

const DIRECTION_GLYPH = { up: '↗', down: '↘', flat: '→' };
const DIRECTION_COLOR = { up: '#7fd6a4', down: '#f4735f', flat: '#f2d06b' };

function RangeStat({ label, range }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatDelta(range.lo, range.hi)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ForecastCard({ forecast, goal }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  if (!forecast) return null;
  const { verdict, goalEta } = forecast;

  return (
    <View style={styles.card}>
      <View style={styles.headlineRow}>
        <Text style={[styles.glyph, { color: DIRECTION_COLOR[verdict.direction] }]}>
          {DIRECTION_GLYPH[verdict.direction]}
        </Text>
        <Text style={styles.headline}>{verdict.headline}</Text>
      </View>

      <View style={styles.statRow}>
        <RangeStat label="next 3 months" range={verdict.d3} />
        <RangeStat label="next 12 months" range={verdict.d12} />
      </View>

      {verdict.reasons.length > 0 && (
        <View style={styles.reasons}>
          <Text style={styles.reasonsTitle}>Why</Text>
          {verdict.reasons.map((r, i) => (
            <Text key={i} style={styles.reason}>·  {r.charAt(0).toUpperCase()}{r.slice(1)}</Text>
          ))}
        </View>
      )}

      {goal != null && goalEta && (
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>
            {goalEta.months === 0
              ? `Checkpoint ${goal} — already reached. Set the next one higher. ⛰`
              : goalEta.reachable
                ? `Checkpoint ${goal} — on pace to reach it around ${formatMonth(goalEta.ts)}.`
                : `Checkpoint ${goal} — beyond a year at the current pace. The levers below could shorten the route.`}
          </Text>
        </View>
      )}

      <Pressable onPress={() => setAboutOpen(true)} style={styles.aboutBtn} accessibilityRole="button" hitSlop={10}>
        <Text style={styles.aboutText}>ⓘ How these estimates work</Text>
      </Pressable>

      <Modal visible={aboutOpen} transparent animationType="fade" onRequestClose={() => setAboutOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>How Summit estimates</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.panelBody}>
                The forecast assumes you change nothing — it projects only what the calendar
                will do on its own. It blends two signals:{'\n\n'}
                <Text style={styles.panelBold}>The trail behind you.</Text> A weighted trend
                over your recent logged scores, which fades with distance because momentum
                isn't a promise.{'\n\n'}
                <Text style={styles.panelBold}>Waypoints with known timing.</Text> Widely
                published scoring patterns: hard inquiries stop counting after about a year,
                new-account drag lifts near six months, late marks fade at one and two years
                and fall off a report near seven, and a clean payment streak lifts a file a
                little every month.{'\n\n'}
                Levers — like paying utilization down — are listed separately because they
                wait on a choice, not the calendar.{'\n\n'}
                <Text style={styles.panelBold}>The honest part.</Text> The real scoring
                formulas are proprietary, and Summit never sees your actual credit report —
                only what you log. Every number here is an estimated range, not a promise,
                and the range widens with distance for a reason. For the real thing, check
                your bureau reports (annualcreditreport.com is free). This is not financial
                advice.
              </Text>
            </ScrollView>
            <Pressable onPress={() => setAboutOpen(false)} style={styles.closeBtn} accessibilityRole="button">
              <Text style={styles.closeText}>Back to the climb</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(14,22,40,0.72)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.18)',
    padding: 18,
  },
  headlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  glyph: { fontSize: 26, fontWeight: '800', marginTop: -2 },
  headline: { flex: 1, color: '#eaf4f6', fontSize: 17, fontWeight: '700', lineHeight: 23 },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { color: '#5fd0c7', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: 'rgba(220,238,242,0.5)', fontSize: 11, marginTop: 3 },
  reasons: { marginTop: 14 },
  reasonsTitle: { color: 'rgba(220,238,242,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  reason: { color: 'rgba(234,244,246,0.8)', fontSize: 13.5, lineHeight: 20, marginBottom: 3 },
  goalRow: {
    marginTop: 12,
    backgroundColor: 'rgba(242,208,107,0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(242,208,107,0.2)',
  },
  goalText: { color: '#f2d06b', fontSize: 13, lineHeight: 18 },
  aboutBtn: { marginTop: 12, alignSelf: 'flex-start' },
  aboutText: { color: 'rgba(95,208,199,0.75)', fontSize: 12.5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(4,6,12,0.8)', justifyContent: 'center', padding: 24 },
  panel: {
    backgroundColor: 'rgba(18,26,44,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.25)',
    padding: 22,
  },
  panelTitle: { color: '#eaf4f6', fontSize: 19, fontWeight: '700', marginBottom: 12 },
  panelBody: { color: 'rgba(234,244,246,0.78)', fontSize: 14, lineHeight: 21 },
  panelBold: { color: '#dceef2', fontWeight: '700' },
  closeBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(95,208,199,0.9)',
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeText: { color: '#06251f', fontSize: 14, fontWeight: '700' },
});
