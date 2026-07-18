import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, TextInput, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface, GlassButton, Txt } from './Glass';
import Icon from './icons';
import { COLOR_ORDER, HABIT_COLORS, ICON_ORDER, habitColor } from '../theme/habitStyle';
import { useHabits } from '../state/store';
import { useTheme, type, radius as R } from '../theme/theme';
import { WEEKDAY_LETTERS } from '../utils/dates';
import { select, success, tap, warn } from '../utils/haptics';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function HabitEditor({ visible, habit, onClose }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('water');
  const [color, setColor] = useState('aqua');
  const [days, setDays] = useState(ALL_DAYS);

  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setIcon(habit?.icon ?? 'water');
    setColor(habit?.color ?? 'aqua');
    setDays(habit?.days ?? ALL_DAYS);
  }, [visible, habit]);

  const toggleDay = (d) => {
    tap();
    setDays((prev) => {
      if (prev.includes(d)) {
        return prev.length > 1 ? prev.filter((x) => x !== d) : prev;
      }
      return [...prev, d].sort();
    });
  };

  const save = () => {
    if (!name.trim()) return;
    success();
    if (habit) updateHabit(habit.id, { name: name.trim(), icon, color, days });
    else addHabit({ name, icon, color, days });
    onClose();
  };

  const confirmDelete = () => {
    warn();
    Alert.alert(
      `Delete “${habit.name}”?`,
      'The habit and its whole history disappear from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deleteHabit(habit.id); onClose(); } },
      ],
    );
  };

  const chosen = habitColor(color);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={{ ...{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, backgroundColor: 'rgba(0,0,10,0.45)' }}
          onPress={onClose}
          accessibilityLabel="Close editor"
        />
        <GlassSurface
          radius={30}
          spectrum
          strong
          style={{ marginHorizontal: 10, marginBottom: Math.max(insets.bottom, 10) }}
          innerStyle={{ padding: 22, paddingBottom: 16 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 560 }}
            contentContainerStyle={{ gap: 18 }}
          >
            <Txt v="title2">{habit ? 'Edit habit' : 'New habit'}</Txt>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Habit name — e.g. Drink water"
              placeholderTextColor={t.textTertiary}
              maxLength={40}
              style={[
                type.body,
                {
                  color: t.text, backgroundColor: t.input,
                  borderRadius: R.control, paddingHorizontal: 16, paddingVertical: 13,
                  borderWidth: 1, borderColor: t.glass.stroke,
                },
              ]}
              accessibilityLabel="Habit name"
            />

            <View style={{ gap: 10 }}>
              <Txt v="footnote" c="secondary">ICON</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
                {ICON_ORDER.map((key) => {
                  const active = key === icon;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => { select(); setIcon(key); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Icon ${key}`}
                      accessibilityState={{ selected: active }}
                    >
                      {active ? (
                        <LinearGradient
                          colors={chosen.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: 46, height: 46, borderRadius: 15,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Icon name={key} color="#080B18" size={23} />
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            width: 46, height: 46, borderRadius: 15,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: t.glass.fill,
                            borderWidth: 1, borderColor: t.glass.stroke,
                          }}
                        >
                          <Icon name={key} color={t.textSecondary} size={23} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Txt v="footnote" c="secondary">COLOUR</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {COLOR_ORDER.map((key) => {
                  const cdef = HABIT_COLORS[key];
                  const active = key === color;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => { select(); setColor(key); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Colour ${key}`}
                      accessibilityState={{ selected: active }}
                      style={{
                        padding: 3, borderRadius: 20,
                        borderWidth: 2,
                        borderColor: active ? t.text : 'transparent',
                      }}
                    >
                      <LinearGradient
                        colors={cdef.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: 30, height: 30, borderRadius: 15 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Txt v="footnote" c="secondary">REPEATS ON</Txt>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {WEEKDAY_LETTERS.map((letter, d) => {
                  const active = days.includes(d);
                  return (
                    <Pressable
                      key={d}
                      onPress={() => toggleDay(d)}
                      accessibilityRole="button"
                      accessibilityLabel={`Repeat on weekday ${d}`}
                      accessibilityState={{ selected: active }}
                    >
                      {active ? (
                        <LinearGradient
                          colors={chosen.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: 40, height: 40, borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Txt v="footnote" c="#080B18">{letter}</Txt>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            width: 40, height: 40, borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: t.glass.fill,
                            borderWidth: 1, borderColor: t.glass.stroke,
                          }}
                        >
                          <Txt v="footnote" c="tertiary">{letter}</Txt>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <GlassButton
              label={habit ? 'Save changes' : 'Create habit'}
              tint={chosen.gradient}
              disabled={!name.trim()}
              onPress={save}
            />
            {habit ? (
              <GlassButton
                small
                label="Delete habit"
                onPress={confirmDelete}
                textStyle={{ color: t.danger }}
              />
            ) : null}
          </ScrollView>
        </GlassSurface>
      </KeyboardAvoidingView>
    </Modal>
  );
}
