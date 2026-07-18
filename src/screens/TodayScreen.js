import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, TextInput, View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { GlassSurface, GlassButton, Chip, Txt } from '../components/Glass';
import { HeroOrb, MoodOrb } from '../components/MoodOrb';
import { MOODS, MOOD_ORDER, TAGS } from '../theme/moods';
import { useEntries } from '../state/store';
import { useTheme, type, radius as R } from '../theme/theme';
import { greeting, todayHeading } from '../utils/dates';
import { currentStreak } from '../utils/stats';
import { select, success, tap } from '../utils/haptics';

export default function TodayScreen({ onAccent, topInset }) {
  const t = useTheme();
  const { entries, addEntry } = useEntries();
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef(null);

  const streak = currentStreak(entries);

  const pickMood = useCallback((key) => {
    select();
    setMood(key);
    onAccent?.(MOODS[key].glow);
  }, [onAccent]);

  const toggleTag = useCallback((tag) => {
    tap();
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  }, []);

  const save = useCallback(() => {
    if (!mood) return;
    addEntry({ mood, note, tags });
    success();
    setMood(null);
    setNote('');
    setTags([]);
    onAccent?.(null);
    setSavedFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 2200);
  }, [mood, note, tags, addEntry, onAccent]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Txt v="footnote" c="secondary" style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
            {todayHeading()}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt v="largeTitle">{greeting()}</Txt>
            {streak > 0 && (
              <GlassSurface radius={R.capsule} shadow={false} innerStyle={{ paddingVertical: 6, paddingHorizontal: 12 }}>
                <Txt v="footnote">🔥 {streak} day{streak === 1 ? '' : 's'}</Txt>
              </GlassSurface>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(70)}>
          <GlassSurface innerStyle={{ padding: 20, alignItems: 'center', gap: 16 }}>
            <Txt v="title3">How are you feeling?</Txt>
            <View style={{ height: 158, alignItems: 'center', justifyContent: 'center' }}>
              {mood ? (
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <HeroOrb mood={mood} size={124} />
                  <Txt v="headline" c={MOODS[mood].glow}>{MOODS[mood].label}</Txt>
                </View>
              ) : (
                <View
                  style={{
                    width: 124, height: 124, borderRadius: 62,
                    borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.glass.stroke,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Txt v="subhead" c="tertiary" style={{ textAlign: 'center', paddingHorizontal: 12 }}>
                    pick an orb below
                  </Txt>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 2 }}>
              {MOOD_ORDER.map((key) => (
                <View key={key} style={{ alignItems: 'center', gap: 6 }}>
                  <MoodOrb mood={key} size={44} selected={mood === key} onPress={() => pickMood(key)} />
                  <Txt v="caption" c={mood === key ? undefined : 'tertiary'}>{MOODS[key].label}</Txt>
                </View>
              ))}
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(140)}>
          <GlassSurface innerStyle={{ padding: 18, gap: 6 }}>
            <Txt v="footnote" c="secondary">NOTE</Txt>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What made you feel this way?"
              placeholderTextColor={t.textTertiary}
              multiline
              maxLength={500}
              style={[
                type.body,
                {
                  color: t.text, minHeight: 74, textAlignVertical: 'top',
                  backgroundColor: t.input, borderRadius: R.control,
                  paddingHorizontal: 14, paddingVertical: 10,
                },
              ]}
              accessibilityLabel="Journal note"
            />
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(210)}>
          <GlassSurface innerStyle={{ padding: 18, gap: 12 }}>
            <Txt v="footnote" c="secondary">WHAT'S IT ABOUT?</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map((tag) => (
                <Chip key={tag} label={tag} active={tags.includes(tag)} onPress={() => toggleTag(tag)} />
              ))}
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(280)}>
          <GlassButton
            label={mood ? `Save ${MOODS[mood].label.toLowerCase()} check-in` : 'Pick a mood to check in'}
            tint={mood ? MOODS[mood].gradient : undefined}
            disabled={!mood}
            onPress={save}
          />
        </Animated.View>

        {savedFlash && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOut.duration(300)}
            style={{ alignItems: 'center' }}
          >
            <GlassSurface radius={R.capsule} innerStyle={{ paddingVertical: 10, paddingHorizontal: 18 }}>
              <Txt v="footnote">Added to your journal ✨</Txt>
            </GlassSurface>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
