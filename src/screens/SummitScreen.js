// The mountain: your altitude, the trail behind, the forecast ahead.

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useScore } from '../state/ScoreStore';
import RidgeBackdrop from '../components/RidgeBackdrop';
import ScoreDial from '../components/ScoreDial';
import ForecastCard from '../components/ForecastCard';
import AscentChart from '../components/AscentChart';
import WaypointList from '../components/WaypointList';
import LogScoreSheet from '../components/LogScoreSheet';
import FactorsSheet from '../components/FactorsSheet';

export default function SummitScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { loaded, entries, latest, previous, forecast, goal, addEntry } = useScore();

  const [logOpen, setLogOpen] = useState(false);
  const [factorsOpen, setFactorsOpen] = useState(false);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: '#05070f' }} />;
  }

  const empty = entries.length === 0;

  const openLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLogOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#05070f' }}>
      <RidgeBackdrop width={width} height={height} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Summit</Text>
            <Text style={styles.subtitle}>the long climb of your credit</Text>
          </View>
          {!empty && (
            <Pressable onPress={() => setFactorsOpen(true)} style={styles.reportChip} accessibilityRole="button">
              <Text style={styles.reportChipText}>my report</Text>
            </Pressable>
          )}
        </View>

        {empty ? (
          <View style={styles.baseCamp}>
            <Text style={styles.baseCampGlyph}>⛰</Text>
            <Text style={styles.baseCampTitle}>Base camp</Text>
            <Text style={styles.baseCampBody}>
              Summit tracks the score you log from wherever you check it — your bank app,
              Credit Karma, a bureau — and forecasts when it should rise and why: inquiries
              aging out, late marks fading, a clean streak doing its quiet work.
            </Text>
            <Text style={styles.baseCampBody}>
              Nothing leaves this phone. Summit never connects to your credit report.
            </Text>
            <Pressable onPress={openLog} style={styles.primaryBtn} accessibilityRole="button">
              <Text style={styles.primaryText}>Log my first score</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.dialWrap}>
              <ScoreDial score={latest.score} previous={previous} size={Math.min(width - 80, 260)} />
            </View>

            <Pressable onPress={openLog} style={styles.logBtn} accessibilityRole="button">
              <Text style={styles.logBtnText}>＋ Log a new score</Text>
            </Pressable>

            <View style={{ marginTop: 18 }}>
              <ForecastCard forecast={forecast} goal={goal} />
            </View>

            <View style={styles.chartPanel}>
              <Text style={styles.chartTitle}>The ascent · next 12 months</Text>
              <AscentChart
                forecast={forecast}
                entries={entries}
                goal={goal}
                width={width - 40 - 24}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <WaypointList waypoints={forecast.waypoints} levers={forecast.levers} />
            </View>

            <Text style={styles.footer}>
              Estimates from published scoring patterns — not your bureau’s formula, and not
              financial advice. Your real score lives with the bureaus; Summit just reads the trail.
            </Text>
          </>
        )}
      </ScrollView>

      <LogScoreSheet
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onSave={(score, ts, source) => addEntry(score, ts, source)}
        firstTime={empty}
      />
      <FactorsSheet visible={factorsOpen} onClose={() => setFactorsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#dff3f0', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: 'rgba(220,238,242,0.5)', fontSize: 13, marginTop: 2 },
  reportChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.3)',
  },
  reportChipText: { color: '#9fe3dc', fontSize: 13.5, fontWeight: '700' },
  dialWrap: { alignItems: 'center', marginTop: 22 },
  logBtn: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 9, marginTop: 2 },
  logBtnText: { color: '#5fd0c7', fontSize: 14.5, fontWeight: '700' },
  chartPanel: {
    marginTop: 20,
    backgroundColor: 'rgba(14,22,40,0.72)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.18)',
    padding: 12,
  },
  chartTitle: {
    color: 'rgba(220,238,242,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  footer: {
    color: 'rgba(220,238,242,0.62)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 26,
  },
  baseCamp: {
    marginTop: 70,
    backgroundColor: 'rgba(14,22,40,0.72)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.2)',
    padding: 26,
    alignItems: 'center',
  },
  baseCampGlyph: { fontSize: 40 },
  baseCampTitle: { color: '#eaf4f6', fontSize: 22, fontWeight: '800', marginTop: 8 },
  baseCampBody: {
    color: 'rgba(220,238,242,0.6)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
  },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: '#5fd0c7',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 22,
  },
  primaryText: { color: '#06251f', fontSize: 16, fontWeight: '800' },
});
