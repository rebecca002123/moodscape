// The quiet corner: your name, what you love saving, and the big soft
// "start fresh" button that never judges.

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { palette, INTERESTS, radii, softShadow, type } from '../theme';
import { useNest, FREE_SCANS_PER_MONTH } from '../state/NestStore';
import Bouncy from '../components/Bouncy';
import RoseButton from '../components/RoseButton';

export default function SettingsSheet({ visible, onClose, onOpenPlus }) {
  const { settings, updateSettings, resetEverything, scansLeft } = useNest();
  const [resetArmed, setResetArmed] = useState(false);

  const toggleInterest = (key) => {
    const has = settings.interests.includes(key);
    updateSettings({
      interests: has ? settings.interests.filter((k) => k !== key) : [...settings.interests, key],
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 24 }}>
            <Text style={type.h2}>Your corner ⚙️</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={settings.name}
              placeholder="What should mornings call you?"
              placeholderTextColor={palette.inkFaint}
              onChangeText={(v) => updateSettings({ name: v })}
              maxLength={20}
            />

            <Text style={styles.label}>You love saving…</Text>
            <View style={styles.bubbleWrap}>
              {INTERESTS.map((it) => {
                const on = settings.interests.includes(it.key);
                return (
                  <Bouncy key={it.key} haptic={false} onPress={() => toggleInterest(it.key)} style={[styles.bubble, on && styles.bubbleOn]}>
                    <Text style={{ fontSize: 14 }}>{it.emoji}</Text>
                    <Text style={[styles.bubbleText, on && { color: '#fff' }]}>{it.label}</Text>
                  </Bouncy>
                );
              })}
            </View>

            <Bouncy onPress={onOpenPlus} style={styles.plusRow}>
              <Text style={{ fontSize: 19 }}>👑</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.plusTitle}>SnapNest Plus</Text>
                <Text style={type.tiny}>
                  {settings.plus ? 'yours, somehow ✨' : `free plan · ${scansLeft}/${FREE_SCANS_PER_MONTH} scans left this month`}
                </Text>
              </View>
              <Text style={{ color: palette.rose, fontWeight: '800', fontSize: 13.5 }}>peek ›</Text>
            </Bouncy>

            <View style={styles.privacyBox}>
              <Text style={styles.privacyTitle}>🔒 A promise, in writing</Text>
              <Text style={styles.privacyText}>
                Cards, words and screenshots live in this phone and nowhere else.
                No account. No cloud. No peeking.
              </Text>
            </View>

            <RoseButton
              ghost
              label={resetArmed ? 'Really start fresh? Everything goes. Tap again' : 'Start fresh (empty the whole nest)'}
              onPress={() => {
                if (!resetArmed) { setResetArmed(true); return; }
                resetEverything();
                onClose();
              }}
              style={resetArmed ? { backgroundColor: '#F7C6C6', borderRadius: radii.chip } : null}
            />

            <RoseButton label="Back to the nest" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.cream,
    borderTopLeftRadius: radii.big,
    borderTopRightRadius: radii.big,
    maxHeight: '88%',
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(70,59,85,0.15)', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: palette.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: radii.chip, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 15.5, color: palette.ink, ...softShadow, shadowOpacity: 0.06,
  },
  bubbleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9,
    ...softShadow, shadowOpacity: 0.05,
  },
  bubbleOn: { backgroundColor: palette.rose },
  bubbleText: { fontSize: 13, fontWeight: '700', color: palette.ink },
  plusRow: {
    marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: radii.card, padding: 15,
    ...softShadow, shadowOpacity: 0.07,
  },
  plusTitle: { fontSize: 15, fontWeight: '800', color: palette.ink },
  privacyBox: { marginTop: 14, backgroundColor: palette.lavender, borderRadius: radii.card, padding: 15 },
  privacyTitle: { fontSize: 13.5, fontWeight: '800', color: palette.ink },
  privacyText: { fontSize: 12.5, color: palette.inkSoft, marginTop: 5, lineHeight: 18 },
});
