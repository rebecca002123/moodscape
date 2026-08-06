// Marking the trail: log a score reading from wherever you check it.

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SCORE_MIN, SCORE_MAX, bandFor, formatMonth } from '../utils/scoreMath';
import MonthPicker from './MonthPicker';

const SOURCES = ['Credit Karma', 'FICO', 'Bank app', 'Other'];

export default function LogScoreSheet({ visible, onClose, onSave, firstTime = false }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState(null);
  const [backdating, setBackdating] = useState(false);
  const [backdateTs, setBackdateTs] = useState(null);

  useEffect(() => {
    if (visible) {
      setText('');
      setSource(null);
      setBackdating(false);
      setBackdateTs(null);
    }
  }, [visible]);

  const num = parseInt(text, 10);
  const valid = !Number.isNaN(num) && num >= SCORE_MIN && num <= SCORE_MAX;
  const band = valid ? bandFor(num) : null;

  const save = () => {
    if (!valid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSave(num, backdateTs || Date.now(), source);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.panel}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
          <Text style={styles.title}>{firstTime ? 'Base camp' : 'Log a score'}</Text>
          <Text style={styles.subtitle}>
            {firstTime
              ? 'Every climb starts with a fix on where you stand. Enter your score from wherever you check it.'
              : 'A new reading from your bank, bureau, or score app.'}
          </Text>

          <TextInput
            value={text}
            onChangeText={(t) => setText(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="687"
            placeholderTextColor="rgba(220,238,242,0.2)"
            style={styles.input}
            maxLength={3}
            autoFocus
            accessibilityLabel="Credit score, 300 to 850"
          />
          <Text style={[styles.bandHint, band && { color: band.color }]}>
            {band ? band.name : `${SCORE_MIN}–${SCORE_MAX}`}
          </Text>

          <View style={styles.sourceRow}>
            {SOURCES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSource(source === s ? null : s)}
                style={[styles.chip, source === s && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: source === s }}
              >
                <Text style={[styles.chipText, source === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {!backdating ? (
            <Pressable
              onPress={() => { Keyboard.dismiss(); setBackdating(true); }}
              style={styles.backdateLink}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={[styles.backdateText, backdateTs && styles.backdatedActive]}>
                {backdateTs
                  ? `Backdated to ${formatMonth(backdateTs)} · tap to change`
                  : 'Logging today · tap to backdate'}
              </Text>
            </Pressable>
          ) : (
            <View style={{ marginTop: 10, alignSelf: 'stretch' }}>
              <MonthPicker
                yearsBack={3}
                onPick={(ts) => { setBackdateTs(ts); setBackdating(false); }}
              />
              <Pressable
                onPress={() => { setBackdateTs(null); setBackdating(false); }}
                style={styles.todayLink}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.backdateText}>log today instead</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={save}
            style={[styles.saveBtn, !valid && styles.saveBtnOff]}
            disabled={!valid}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>{firstTime ? 'Start the climb' : 'Mark the trail'}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn} accessibilityRole="button">
            <Text style={styles.cancelText}>Not now</Text>
          </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,6,12,0.82)', justifyContent: 'center', padding: 24 },
  panel: {
    backgroundColor: 'rgba(18,26,44,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(95,208,199,0.25)',
    padding: 24,
    maxHeight: '88%',
    flexShrink: 1,
  },
  title: { color: '#eaf4f6', fontSize: 21, fontWeight: '800' },
  subtitle: { color: 'rgba(220,238,242,0.55)', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
  input: {
    color: '#eaf4f6',
    fontSize: 46,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(95,208,199,0.4)',
    minWidth: 120,
    marginTop: 16,
    paddingVertical: 4,
  },
  bandHint: { color: 'rgba(220,238,242,0.35)', fontSize: 13, fontWeight: '700', marginTop: 6 },
  sourceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220,238,242,0.18)',
  },
  chipActive: { backgroundColor: 'rgba(95,208,199,0.18)', borderColor: '#5fd0c7' },
  chipText: { color: 'rgba(220,238,242,0.6)', fontSize: 12.5 },
  chipTextActive: { color: '#bdeee9', fontWeight: '700' },
  backdateLink: { marginTop: 12 },
  backdateText: { color: 'rgba(220,238,242,0.4)', fontSize: 12.5 },
  backdatedActive: { color: '#f2d06b' },
  todayLink: { alignSelf: 'center', marginTop: 8, padding: 4 },
  saveBtn: {
    marginTop: 18,
    backgroundColor: '#5fd0c7',
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 20,
  },
  saveBtnOff: { opacity: 0.35 },
  saveText: { color: '#06251f', fontSize: 16, fontWeight: '800' },
  cancelBtn: { marginTop: 10, padding: 8 },
  cancelText: { color: 'rgba(220,238,242,0.4)', fontSize: 13.5 },
});
