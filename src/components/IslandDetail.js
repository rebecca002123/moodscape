// Opening a memory: the island up close, its words, its photo portal,
// its voice crystal — and the tone the island heard in your writing.

import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, Image, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import GlassPanel from './GlassPanel';
import Island from './Island';
import { moodFor } from '../utils/moods';
import { useMemories } from '../state/MemoryStore';

function VoiceCrystal({ uri }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      if (status.playing) player.pause();
      else {
        player.seekTo(0);
        player.play();
      }
    } catch {}
  };
  return (
    <Pressable onPress={toggle} style={styles.voiceBtn} accessibilityLabel={status.playing ? 'Pause voice memory' : 'Play voice memory'}>
      <Text style={styles.voiceText}>{status.playing ? '◼ Crystal is singing…' : '▶ Play voice crystal'}</Text>
    </Pressable>
  );
}

export default function IslandDetail({ memory, onClose }) {
  const { deleteMemory } = useMemories();
  if (!memory) return null;
  const mood = moodFor(memory.mood);
  const d = new Date(memory.createdAt);
  const dateLine = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeLine = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const tone = memory.sentiment?.tone;

  const confirmDelete = () => {
    Alert.alert(
      'Let this island drift away?',
      'It will quietly leave your sky. This cannot be undone.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Let it go',
          style: 'destructive',
          onPress: () => {
            deleteMemory(memory.id);
            onClose?.();
          },
        },
      ]
    );
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.center}>
          <GlassPanel tint="dark" intensity={45} radius={34} style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
              <View style={styles.headerRow}>
                <Text style={styles.dateTitle}>{dateLine}</Text>
                <Pressable accessibilityLabel="Close" onPress={onClose} hitSlop={12}>
                  <Text style={styles.close}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.timeSub}>{timeLine}{memory.place ? ` · ${memory.place}` : ''}</Text>

              <View style={{ marginVertical: 6 }}>
                <Island memory={memory} width={250} zoomSV={null} onPress={() => {}} reduceMotion={false} />
              </View>

              <View style={styles.chipRow}>
                <View style={[styles.chip, { borderColor: mood.accent }]}>
                  <Text style={styles.chipText}>{mood.emoji} {mood.label}</Text>
                </View>
                {memory.weather && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{memory.weather.emoji} {memory.weather.label}</Text>
                  </View>
                )}
                {memory.sample && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>🌱 Sample</Text>
                  </View>
                )}
              </View>

              {memory.tags?.length > 0 && (
                <View style={styles.chipRow}>
                  {memory.tags.map((t) => (
                    <View key={t} style={[styles.chip, styles.tagChip]}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}

              {memory.journal ? <Text style={styles.journal}>{memory.journal}</Text> : null}

              {tone && tone !== 'neutral' && (
                <Text style={styles.whisper}>
                  {tone === 'light'
                    ? '☀️ The island heard light in your words — and grew a little brighter.'
                    : tone === 'heavy'
                      ? '🌧️ The island heard weight in your words — it holds it gently for you.'
                      : '🌙 The island heard something tender in your words.'}
                </Text>
              )}

              {memory.photo && <Image source={{ uri: memory.photo }} style={styles.photo} accessibilityLabel="Memory photo" />}
              {memory.voice && <VoiceCrystal uri={memory.voice} />}

              <Pressable onPress={confirmDelete} style={styles.deleteBtn} accessibilityLabel="Delete this memory">
                <Text style={styles.deleteText}>Let this island drift away</Text>
              </Pressable>
            </ScrollView>
          </GlassPanel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(6,10,26,0.4)' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { maxHeight: '92%', borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(16,22,46,0.42)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' },
  dateTitle: { color: '#fff', fontSize: 19, fontWeight: '700', letterSpacing: 0.3, flex: 1 },
  close: { color: 'rgba(255,255,255,0.8)', fontSize: 18, padding: 4 },
  timeSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, alignSelf: 'flex-start', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tagChip: { paddingVertical: 5, borderColor: 'rgba(255,255,255,0.2)' },
  tagText: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  journal: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15.5,
    lineHeight: 23,
    marginTop: 14,
    alignSelf: 'stretch',
    letterSpacing: 0.2,
  },
  whisper: { color: 'rgba(200,220,255,0.85)', fontSize: 13, fontStyle: 'italic', marginTop: 12, textAlign: 'center' },
  photo: { width: '100%', height: 220, borderRadius: 20, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  voiceBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(180,220,255,0.5)',
    backgroundColor: 'rgba(140,190,255,0.15)',
  },
  voiceText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  deleteBtn: { marginTop: 22, marginBottom: 4, padding: 10 },
  deleteText: { color: 'rgba(255,150,165,0.85)', fontSize: 13, fontWeight: '500' },
});
