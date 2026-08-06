// What your report knows: the facts the forecast is built from.
// Utilization, the checkpoint you're climbing toward, dated marks
// (inquiries, new accounts, lates), and the trail log itself.

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useScore } from '../state/ScoreStore';
import { formatMonth, formatDate, SCORE_MIN, SCORE_MAX } from '../utils/scoreMath';
import MonthPicker from './MonthPicker';

const MARK_KINDS = [
  {
    kind: 'inquiries',
    title: 'Hard inquiries',
    hint: 'Credit checks from applications. Each stops counting after about a year.',
    yearsBack: 2,
  },
  {
    kind: 'newAccounts',
    title: 'New accounts',
    hint: 'Cards or loans opened. The "new credit" drag lifts around six months.',
    yearsBack: 2,
  },
  {
    kind: 'lates',
    title: 'Late payments',
    hint: '30+ days late marks. They fade at 1–2 years and fall off near 7.',
    yearsBack: 7,
  },
];

function Section({ title, hint, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export default function FactorsSheet({ visible, onClose }) {
  const {
    factors, goal, entries,
    setUtilization, setGoal, addMark, removeMark, removeEntry,
  } = useScore();

  const [utilText, setUtilText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [adding, setAdding] = useState(null); // which mark kind's MonthPicker is open

  useEffect(() => {
    if (visible) {
      setUtilText(factors.utilization == null ? '' : String(factors.utilization));
      setGoalText(goal == null ? '' : String(goal));
      setAdding(null);
    }
    // Sync local inputs only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const commitUtil = (t) => {
    setUtilText(t);
    const cleaned = t.replace(/[^0-9]/g, '');
    if (cleaned === '') { setUtilization(null); return; }
    setUtilization(Math.min(200, parseInt(cleaned, 10)));
  };

  const commitGoal = (t) => {
    const cleaned = t.replace(/[^0-9]/g, '').slice(0, 3);
    setGoalText(cleaned);
    const n = parseInt(cleaned, 10);
    if (!Number.isNaN(n) && n >= SCORE_MIN && n <= SCORE_MAX) setGoal(n);
    else if (cleaned === '') setGoal(null);
  };

  const pickMark = (kind, ts) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addMark(kind, ts);
    setAdding(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>What my report knows</Text>
          <Text style={styles.subtitle}>
            Everything stays on this phone. The more of this you fill in, the more of the route Summit can see.
          </Text>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <Section
              title="Card utilization"
              hint="Balances as a share of limits, across your cards. The biggest fast-moving factor."
            >
              <View style={styles.inlineRow}>
                <TextInput
                  value={utilText}
                  onChangeText={commitUtil}
                  keyboardType="number-pad"
                  placeholder="—"
                  placeholderTextColor="rgba(220,238,242,0.25)"
                  style={styles.numInput}
                  maxLength={3}
                  accessibilityLabel="Card utilization percent"
                />
                <Text style={styles.unit}>%</Text>
              </View>
            </Section>

            <Section
              title="Checkpoint"
              hint="The score you're climbing toward. The chart and forecast track your pace to it."
            >
              <View style={styles.inlineRow}>
                <TextInput
                  value={goalText}
                  onChangeText={commitGoal}
                  keyboardType="number-pad"
                  placeholder="—"
                  placeholderTextColor="rgba(220,238,242,0.25)"
                  style={styles.numInput}
                  maxLength={3}
                  accessibilityLabel="Checkpoint score"
                />
                {goal != null && (
                  <Pressable onPress={() => commitGoal('')} style={styles.clearBtn} accessibilityRole="button" hitSlop={8}>
                    <Text style={styles.clearText}>clear</Text>
                  </Pressable>
                )}
              </View>
            </Section>

            {MARK_KINDS.map(({ kind, title, hint, yearsBack }) => (
              <Section key={kind} title={title} hint={hint}>
                {(factors[kind] || []).map((m) => (
                  <View key={m.id} style={styles.markRow}>
                    <Text style={styles.markText}>{formatMonth(m.ts)}</Text>
                    <Pressable
                      onPress={() => removeMark(kind, m.id)}
                      style={styles.removeBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${title.toLowerCase()} mark from ${formatMonth(m.ts)}`}
                      hitSlop={10}
                    >
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
                {adding === kind ? (
                  <View style={{ marginTop: 8 }}>
                    <MonthPicker yearsBack={yearsBack} onPick={(ts) => pickMark(kind, ts)} />
                    <Pressable onPress={() => setAdding(null)} style={styles.cancelAdd} accessibilityRole="button" hitSlop={8}>
                      <Text style={styles.cancelAddText}>never mind</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => setAdding(kind)} style={styles.addBtn} accessibilityRole="button">
                    <Text style={styles.addText}>＋ add month</Text>
                  </Pressable>
                )}
              </Section>
            ))}

            {entries.length > 0 && (
              <Section title="Trail log" hint="Every score you've marked. Remove a bad reading any time.">
                {[...entries].reverse().map((e) => (
                  <View key={e.id} style={styles.markRow}>
                    <Text style={styles.markText}>
                      <Text style={{ fontWeight: '800', color: '#eaf4f6' }}>{e.score}</Text>
                      {'   '}{formatDate(e.ts)}{e.source ? `  ·  ${e.source}` : ''}
                    </Text>
                    <Pressable
                      onPress={() => removeEntry(e.id)}
                      style={styles.removeBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove score ${e.score} logged ${formatDate(e.ts)}`}
                      hitSlop={10}
                    >
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </Section>
            )}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.doneBtn} accessibilityRole="button">
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,6,12,0.82)', justifyContent: 'center', padding: 20 },
  panel: {
    backgroundColor: 'rgba(18,26,44,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.25)',
    padding: 20,
    maxHeight: '88%',
  },
  title: { color: '#eaf4f6', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(220,238,242,0.55)', fontSize: 12.5, lineHeight: 18, marginTop: 4, marginBottom: 8 },
  scroll: { marginTop: 6 },
  section: { marginTop: 14 },
  sectionTitle: {
    color: 'rgba(220,238,242,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionHint: { color: 'rgba(220,238,242,0.4)', fontSize: 12, lineHeight: 17, marginTop: 3, marginBottom: 8 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numInput: {
    color: '#eaf4f6',
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 84,
    textAlign: 'center',
  },
  unit: { color: 'rgba(220,238,242,0.5)', fontSize: 18, fontWeight: '700' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearText: { color: 'rgba(244,115,95,0.8)', fontSize: 13 },
  markRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  markText: { color: 'rgba(234,244,246,0.8)', fontSize: 13.5 },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 2 },
  removeText: { color: 'rgba(244,115,95,0.7)', fontSize: 14 },
  addBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 2 },
  addText: { color: '#5fd0c7', fontSize: 13.5, fontWeight: '700' },
  cancelAdd: { alignSelf: 'center', marginTop: 6, padding: 6 },
  cancelAddText: { color: 'rgba(220,238,242,0.4)', fontSize: 12.5 },
  doneBtn: {
    marginTop: 14,
    backgroundColor: '#5fd0c7',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  doneText: { color: '#06251f', fontSize: 15, fontWeight: '800' },
});
