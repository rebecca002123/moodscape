// The hearth's ledger: what the fire remembers about your focus.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HearthStats({ visible, onClose, sessions, totalMinutes, todayMinutes, streak }) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.title}>The hearth remembers</Text>
          <View style={styles.grid}>
            <Stat value={sessions.length} label={sessions.length === 1 ? 'firefly' : 'fireflies'} />
            <Stat value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} label="total focus" />
            <Stat value={`${todayMinutes}m`} label="today" />
            <Stat value={streak} label={streak === 1 ? 'day streak' : 'day streak'} />
          </View>
          <Text style={styles.note}>
            {streak >= 3
              ? 'The stone ring is growing. Keep the fire fed.'
              : 'Light a fire each day and the stone ring grows.'}
          </Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Back to the fire</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,6,12,0.78)',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    backgroundColor: 'rgba(22,26,44,0.97)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,157,77,0.25)',
    padding: 24,
    alignItems: 'center',
  },
  title: { color: '#ffe9c8', fontSize: 20, fontWeight: '700', marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  stat: {
    width: 110,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  statValue: { color: '#ffd9a0', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,233,200,0.55)', fontSize: 12, marginTop: 4 },
  note: { color: 'rgba(255,233,200,0.5)', fontSize: 13, fontStyle: 'italic', marginTop: 18, textAlign: 'center' },
  closeBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,140,59,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  closeText: { color: '#1c1206', fontSize: 14, fontWeight: '700' },
});
