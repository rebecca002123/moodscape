// Planting a memory: a glowing glass seed that grows as you fill it —
// mood, words, tags, weather, a photo, a voice — then blooms into an island.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import GlassPanel, { GlassButton } from './GlassPanel';
import { MOOD_LIST, moodFor } from '../utils/moods';
import { analyzeSentiment } from '../utils/sentiment';
import { persistMedia } from '../utils/media';
import { useMemories } from '../state/MemoryStore';

const TAGS = ['grateful', 'family', 'friends', 'love', 'work', 'health', 'dream', 'nature', 'music', 'milestone'];
const WEATHER_CHOICES = [
  { type: 'clear', label: 'Clear', emoji: '☀️' },
  { type: 'clouds', label: 'Clouds', emoji: '☁️' },
  { type: 'rain', label: 'Rain', emoji: '🌧️' },
  { type: 'snow', label: 'Snow', emoji: '❄️' },
  { type: 'fog', label: 'Fog', emoji: '🌫️' },
  { type: 'storm', label: 'Storm', emoji: '⛈️' },
];

function Seed({ growth, color }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => {
    const base = 0.45 + growth * 0.75;
    const s = base * (1 + pulse.value * 0.07);
    return {
      transform: [{ scale: s }],
      shadowOpacity: 0.4 + growth * 0.5 + pulse.value * 0.1,
    };
  });
  return (
    <View style={styles.seedWrap}>
      <Animated.View
        style={[
          styles.seed,
          {
            backgroundColor: color,
            shadowColor: color,
          },
          style,
        ]}
      />
      <View style={[styles.seedCore, { backgroundColor: '#ffffff' }]} />
    </View>
  );
}

export default function SeedComposer({ onClose }) {
  const { addMemory, weather, place } = useMemories();
  const [mood, setMood] = useState(null);
  const [journal, setJournal] = useState('');
  const [tags, setTags] = useState([]);
  const [weatherChoice, setWeatherChoice] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [voice, setVoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [blooming, setBlooming] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const chime = useAudioPlayer(require('../../assets/chime.wav'));
  const bloomSV = useSharedValue(0);
  const timerRef = useRef(null);

  const growth = useMemo(() => {
    let g = 0;
    if (mood) g += 0.45;
    if (journal.trim().length > 0) g += 0.2;
    if (journal.trim().length > 60) g += 0.08;
    if (tags.length) g += 0.1;
    if (weatherChoice || weather) g += 0.07;
    if (photo) g += 0.05;
    if (voice) g += 0.05;
    return Math.min(1, g);
  }, [mood, journal, tags, weatherChoice, weather, photo, voice]);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const seedColor = mood ? moodFor(mood).accent : '#cfe0ff';

  const toggleTag = (t) => {
    Haptics.selectionAsync().catch(() => {});
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos permission needed', 'Let MoodScape see your photos to add one to this memory.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.75 });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhoto(persistMedia(res.assets[0].uri, 'jpg'));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {}
  };

  const startRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone needed', 'Let MoodScape hear you to grow a voice crystal.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (e) {
      Alert.alert('Could not record', 'The microphone is unavailable right now.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      if (recorder.uri) setVoice(persistMedia(recorder.uri, 'm4a'));
    } catch {}
    setRecording(false);
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
  };

  const save = () => {
    if (!mood || blooming) return;
    setBlooming(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      chime.seekTo(0);
      chime.play();
    } catch {}
    bloomSV.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });

    const w = weatherChoice || weather || { type: 'clear', label: 'Clear', emoji: '☀️' };
    const memory = {
      id: `mem-${Date.now()}`,
      createdAt: Date.now(),
      mood,
      journal: journal.trim(),
      tags,
      weather: { type: w.type, label: w.label, emoji: w.emoji },
      photo,
      voice,
      place: place || null,
      sample: false,
      sentiment: analyzeSentiment(journal),
    };
    setTimeout(() => {
      addMemory(memory);
      onClose?.();
    }, 780);
  };

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bloomSV.value, [0, 0.3, 1], [0, 1, 0]),
    transform: [{ scale: interpolate(bloomSV.value, [0, 1], [0.4, 3.2]) }],
  }));

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={styles.center}>
            <GlassPanel tint="dark" intensity={45} radius={32} style={styles.sheet}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 22, paddingBottom: 26 }}
              >
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Plant a memory</Text>
                  <Pressable accessibilityLabel="Close" onPress={onClose} hitSlop={12}>
                    <Text style={styles.close}>✕</Text>
                  </Pressable>
                </View>

                <Seed growth={growth} color={seedColor} />
                <Text style={styles.growthHint}>
                  {!mood ? 'Choose a feeling to wake the seed' : growth > 0.85 ? 'Ready to bloom' : 'The seed is growing…'}
                </Text>

                {/* bloom flash */}
                <Animated.View pointerEvents="none" style={[styles.bloom, { backgroundColor: seedColor, shadowColor: seedColor }, bloomStyle]} />

                <Text style={styles.section}>How did this moment feel?</Text>
                <View style={styles.moodGrid}>
                  {MOOD_LIST.map((m) => {
                    const active = mood === m.key;
                    return (
                      <Pressable
                        key={m.key}
                        accessibilityLabel={`Feeling ${m.label}`}
                        onPress={() => {
                          setMood(m.key);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        }}
                        style={[
                          styles.moodChip,
                          active && { borderColor: m.accent, backgroundColor: 'rgba(255,255,255,0.16)' },
                        ]}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        <Text style={styles.moodLabel}>{m.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.section}>Write onto the glass</Text>
                <TextInput
                  style={styles.journal}
                  placeholder="Let it out — the island is listening…"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  multiline
                  value={journal}
                  onChangeText={setJournal}
                  accessibilityLabel="Journal entry"
                />

                <Text style={styles.section}>Tags</Text>
                <View style={styles.tagRow}>
                  {TAGS.map((t) => {
                    const active = tags.includes(t);
                    return (
                      <Pressable
                        key={t}
                        onPress={() => toggleTag(t)}
                        style={[styles.tag, active && styles.tagActive]}
                        accessibilityLabel={`Tag ${t}`}
                      >
                        <Text style={[styles.tagText, active && styles.tagTextActive]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.section}>Weather in this memory</Text>
                <View style={styles.tagRow}>
                  {(weather ? [{ ...weather, auto: true }, ...WEATHER_CHOICES.filter((w) => w.type !== weather.type)] : WEATHER_CHOICES).map((w, i) => {
                    const active = weatherChoice ? weatherChoice.type === w.type : i === 0 && !!weather;
                    return (
                      <Pressable
                        key={w.type}
                        onPress={() => setWeatherChoice({ type: w.type, label: w.label, emoji: w.emoji })}
                        style={[styles.tag, active && styles.tagActive]}
                        accessibilityLabel={`Weather ${w.label}`}
                      >
                        <Text style={[styles.tagText, active && styles.tagTextActive]}>
                          {w.emoji} {w.label}{w.auto ? ' · now' : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.section}>Portals & crystals</Text>
                <View style={styles.mediaRow}>
                  {photo ? (
                    <View style={styles.mediaItem}>
                      <Image source={{ uri: photo }} style={styles.thumb} />
                      <Pressable onPress={() => setPhoto(null)} style={styles.mediaRemove} hitSlop={8}>
                        <Text style={styles.mediaRemoveText}>✕</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={pickPhoto} style={styles.mediaButton} accessibilityLabel="Add a photo">
                      <Text style={styles.mediaButtonText}>📸 Photo</Text>
                    </Pressable>
                  )}

                  {voice ? (
                    <View style={styles.mediaItem}>
                      <View style={[styles.mediaButton, { borderColor: 'rgba(255,255,255,0.6)' }]}>
                        <Text style={styles.mediaButtonText}>🔮 Voice crystal</Text>
                      </View>
                      <Pressable onPress={() => setVoice(null)} style={styles.mediaRemove} hitSlop={8}>
                        <Text style={styles.mediaRemoveText}>✕</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={recording ? stopRecording : startRecording}
                      style={[styles.mediaButton, recording && { borderColor: '#ff8a9e', backgroundColor: 'rgba(255,90,110,0.18)' }]}
                      accessibilityLabel={recording ? 'Stop recording' : 'Record a voice memory'}
                    >
                      <Text style={styles.mediaButtonText}>
                        {recording ? `● ${recSeconds}s — tap to stop` : '🎤 Voice'}
                      </Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ height: 18 }} />
                <GlassButton
                  label={mood ? 'Grow this island' : 'Choose a feeling first'}
                  emoji={mood ? '🌱' : undefined}
                  onPress={save}
                  style={!mood ? { opacity: 0.45 } : { backgroundColor: 'rgba(140,190,255,0.22)' }}
                />
              </ScrollView>
            </GlassPanel>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,10,26,0.45)' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 18 },
  sheet: { maxHeight: '92%', borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(16,22,46,0.42)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 21, fontWeight: '700', letterSpacing: 0.4 },
  close: { color: 'rgba(255,255,255,0.8)', fontSize: 18, padding: 4 },
  seedWrap: { alignItems: 'center', justifyContent: 'center', height: 96, marginTop: 6 },
  seed: {
    width: 46,
    height: 46,
    borderRadius: 23,
    shadowOpacity: 0.7,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    opacity: 0.95,
  },
  seedCore: { position: 'absolute', width: 14, height: 14, borderRadius: 7, opacity: 0.95 },
  growthHint: { textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 12.5, marginBottom: 4, letterSpacing: 0.3 },
  bloom: { position: 'absolute', alignSelf: 'center', top: 110, width: 60, height: 60, borderRadius: 30, shadowOpacity: 1, shadowRadius: 40 },
  section: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase', marginTop: 18, marginBottom: 9 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  moodChip: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 4, letterSpacing: 0.3 },
  journal: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    padding: 14,
    fontSize: 15.5,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  tagActive: { borderColor: 'rgba(160,220,255,0.9)', backgroundColor: 'rgba(140,200,255,0.2)' },
  tagText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  mediaRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  mediaButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mediaButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  mediaItem: { position: 'relative' },
  thumb: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  mediaRemove: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(20,26,52,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRemoveText: { color: '#fff', fontSize: 11 },
});
