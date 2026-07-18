import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassPressable, GlassSurface, Txt } from '../components/Glass';
import Icon from '../components/icons';
import ProgressRing from '../components/ProgressRing';
import { habitColor, PRESETS } from '../theme/habitStyle';
import { isDone, isScheduled, useHabits } from '../state/store';
import { useTheme, SPECTRUM } from '../theme/theme';
import {
  dayKey, daysAgo, friendlyKey, greeting, todayKey, WEEKDAY_LETTERS,
} from '../utils/dates';
import { currentStreak, dayProgress } from '../utils/stats';
import { select, success, tap } from '../utils/haptics';

function WeekStrip({ selected, onSelect }) {
  const t = useTheme();
  const { habits, completions } = useHabits();
  const days = useMemo(() => {
    const out = [];
    for (let back = 6; back >= 0; back--) {
      const d = daysAgo(back);
      out.push({ key: dayKey(d), letter: WEEKDAY_LETTERS[d.getDay()], num: d.getDate() });
    }
    return out;
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {days.map((d) => {
        const active = d.key === selected;
        const progress = dayProgress(habits, completions, d.key);
        return (
          <Pressable
            key={d.key}
            onPress={() => { select(); onSelect(d.key); }}
            accessibilityRole="button"
            accessibilityLabel={friendlyKey(d.key)}
            accessibilityState={{ selected: active }}
            style={{ flex: 1 }}
          >
            <GlassSurface
              radius={18}
              shadow={false}
              strong={active}
              innerStyle={{ alignItems: 'center', paddingVertical: 10, gap: 6 }}
              style={active ? {
                borderRadius: 18,
                shadowColor: '#818CF8', shadowOpacity: 0.5, shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 }, elevation: 6,
              } : null}
            >
              <Txt v="caption" c={active ? undefined : 'tertiary'}>{d.letter}</Txt>
              <ProgressRing
                progress={progress ?? 0}
                size={30}
                stroke={3.5}
                gradientId={`week-${d.key}`}
              >
                <Txt v="caption" c={active ? undefined : 'secondary'}>{d.num}</Txt>
              </ProgressRing>
            </GlassSurface>
          </Pressable>
        );
      })}
    </View>
  );
}

function HabitRow({ habit, dayKey: key, index, onEdit }) {
  const t = useTheme();
  const { completions, toggleCompletion } = useHabits();
  const done = isDone(completions, habit.id, key);
  const streak = currentStreak(habit, completions);
  const c = habitColor(habit.color);

  const toggle = () => {
    const nowDone = toggleCompletion(habit.id, key);
    if (nowDone) success();
    else tap();
  };

  return (
    <Animated.View entering={FadeInDown.duration(380).delay(Math.min(index, 8) * 45)}>
      <GlassPressable
        onPress={toggle}
        onLongPress={onEdit}
        accessibilityLabel={`${habit.name}${done ? ', completed' : ', not completed yet'}. Tap to toggle, long press to edit.`}
        accessibilityState={{ checked: done }}
        innerStyle={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}
      >
        <LinearGradient
          colors={c.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 46, height: 46, borderRadius: 15,
            alignItems: 'center', justifyContent: 'center',
            opacity: done ? 1 : 0.5,
          }}
        >
          <Icon name={habit.icon} color="#080B18" size={24} />
        </LinearGradient>

        <View style={{ flex: 1, gap: 2 }}>
          <Txt
            v="headline"
            style={done ? null : { opacity: 0.85 }}
          >
            {habit.name}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="flame" color={streak > 0 ? c.glow : t.textTertiary} size={13} />
            <Txt v="footnote" c={streak > 0 ? 'secondary' : 'tertiary'}>
              {streak > 0 ? `${streak} day streak` : 'no streak yet'}
            </Txt>
          </View>
        </View>

        {done ? (
          <LinearGradient
            colors={c.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 34, height: 34, borderRadius: 17,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: c.glow, shadowOpacity: 0.7, shadowRadius: 9,
              shadowOffset: { width: 0, height: 3 }, elevation: 6,
            }}
          >
            <Icon name="check" color="#080B18" size={19} />
          </LinearGradient>
        ) : (
          <View
            style={{
              width: 34, height: 34, borderRadius: 17,
              borderWidth: 2, borderColor: t.ringTrack,
            }}
          />
        )}
      </GlassPressable>
    </Animated.View>
  );
}

export default function TodayScreen({ topInset, onEditHabit }) {
  const t = useTheme();
  const { habits, completions, addHabit } = useHabits();
  const [selected, setSelected] = useState(todayKey());

  const scheduled = useMemo(
    () => habits.filter((h) => isScheduled(h, selected)),
    [habits, selected],
  );
  const doneCount = scheduled.filter((h) => isDone(completions, h.id, selected)).length;
  const progress = scheduled.length ? doneCount / scheduled.length : null;
  const viewingToday = selected === todayKey();

  const heroLine = progress === null
    ? 'Nothing scheduled — a true rest day.'
    : progress === 1
      ? 'Perfect day. All light, no gaps. ✨'
      : progress === 0
        ? (viewingToday ? 'A clean pane. Tap a habit to begin.' : 'This day went unlogged.')
        : `${scheduled.length - doneCount} to go — keep the light moving.`;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)}>
        <Txt v="footnote" c="secondary" style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
          {friendlyKey(selected)}
        </Txt>
        <Txt v="largeTitle">{viewingToday ? greeting() : 'Time travel'}</Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(60)}>
        <GlassSurface spectrum innerStyle={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <ProgressRing
            progress={progress ?? 0}
            size={86}
            stroke={9}
            colors={[SPECTRUM[0], SPECTRUM[1]]}
            gradientId="hero"
          >
            <Txt v="title3">
              {scheduled.length ? `${doneCount}/${scheduled.length}` : '—'}
            </Txt>
          </ProgressRing>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt v="headline">
              {progress === 1 ? 'All done' : viewingToday ? 'Today’s light' : 'That day'}
            </Txt>
            <Txt v="subhead" c="secondary">{heroLine}</Txt>
          </View>
        </GlassSurface>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(120)}>
        <WeekStrip selected={selected} onSelect={setSelected} />
      </Animated.View>

      <View style={{ gap: 12 }}>
        {scheduled.map((habit, i) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            dayKey={selected}
            index={i}
            onEdit={() => onEditHabit(habit)}
          />
        ))}
      </View>

      {habits.length === 0 && (
        <Animated.View entering={FadeInDown.duration(500).delay(180)}>
          <GlassSurface innerStyle={{ padding: 24, gap: 14 }}>
            <Txt v="title3">Start with one ritual</Txt>
            <Txt v="subhead" c="secondary">
              Pick a starter below, or press the spectrum + to invent your own.
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((preset) => (
                <Pressable
                  key={preset.name}
                  onPress={() => { success(); addHabit(preset); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${preset.name}`}
                >
                  <View
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 7,
                      borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14,
                      backgroundColor: t.glass.fillStrong,
                      borderWidth: 1, borderColor: t.glass.stroke,
                    }}
                  >
                    <Icon name={preset.icon} color={habitColor(preset.color).glow} size={17} />
                    <Txt v="footnote">{preset.name}</Txt>
                  </View>
                </Pressable>
              ))}
            </View>
          </GlassSurface>
        </Animated.View>
      )}

      {habits.length > 0 && scheduled.length === 0 && (
        <GlassSurface innerStyle={{ padding: 22, alignItems: 'center', gap: 6 }}>
          <Txt v="title3">Rest day</Txt>
          <Txt v="subhead" c="secondary" style={{ textAlign: 'center' }}>
            None of your habits repeat on this day.
          </Txt>
        </GlassSurface>
      )}
    </ScrollView>
  );
}
