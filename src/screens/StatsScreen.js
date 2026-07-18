import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassSurface, Txt } from '../components/Glass';
import Icon from '../components/icons';
import { habitColor } from '../theme/habitStyle';
import { useHabits } from '../state/store';
import { useTheme, radius as R } from '../theme/theme';
import {
  bestStreak, currentStreak, habitRate, heatmapWeeks, perfectDays, totalCompletions,
} from '../utils/stats';
import { WEEKDAY_LETTERS } from '../utils/dates';

// progress 0..1 → violet glass intensity for heatmap tiles
function heatColor(progress, scheme) {
  const alpha = 0.14 + progress * (scheme === 'dark' ? 0.78 : 0.72);
  return `rgba(129,140,248,${alpha.toFixed(3)})`;
}

function StatTile({ label, value, sub }) {
  return (
    <GlassSurface style={{ flex: 1 }} innerStyle={{ padding: 14, alignItems: 'center', gap: 3, minHeight: 86, justifyContent: 'center' }}>
      <Txt v="title2">{value}</Txt>
      <Txt v="caption" c="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>
        {label}
      </Txt>
      {sub ? <Txt v="caption" c="tertiary">{sub}</Txt> : null}
    </GlassSurface>
  );
}

function Section({ title, children, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.duration(450).delay(delay)}>
      <GlassSurface innerStyle={{ padding: 18, gap: 14 }}>
        <Txt v="headline">{title}</Txt>
        {children}
      </GlassSurface>
    </Animated.View>
  );
}

export default function StatsScreen({ topInset }) {
  const t = useTheme();
  const { habits, completions } = useHabits();

  const columns = useMemo(() => heatmapWeeks(habits, completions, 12), [habits, completions]);
  const perfect = useMemo(() => perfectDays(habits, completions, 30), [habits, completions]);
  const total = useMemo(() => totalCompletions(completions, 30), [completions]);
  const topStreak = useMemo(
    () => habits.reduce((acc, h) => Math.max(acc, currentStreak(h, completions)), 0),
    [habits, completions],
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Txt v="largeTitle">Stats</Txt>
        <Txt v="subhead" c="secondary">Thirty days of light, measured</Txt>
      </View>

      {habits.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(450)}>
          <GlassSurface innerStyle={{ padding: 26, alignItems: 'center', gap: 8 }}>
            <Txt v="title3">No habits yet</Txt>
            <Txt v="subhead" c="secondary" style={{ textAlign: 'center' }}>
              Add a habit on the Today tab and your stats will start refracting here.
            </Txt>
          </GlassSurface>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.duration(450)} style={{ flexDirection: 'row', gap: 12 }}>
            <StatTile label="Best streak" value={topStreak > 0 ? `🔥 ${topStreak}` : '—'} />
            <StatTile label="Perfect days" value={perfect || '—'} />
            <StatTile label="Check-offs" value={total || '—'} />
          </Animated.View>

          <Section title="Twelve weeks" delay={60}>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              <View style={{ gap: 3, marginRight: 3 }}>
                {WEEKDAY_LETTERS.map((l, i) => (
                  <View key={i} style={{ height: 16, justifyContent: 'center' }}>
                    <Txt v="caption" c="tertiary">{i % 2 === 1 ? l : ' '}</Txt>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, flexDirection: 'row', gap: 3 }}>
                {columns.map((col, ci) => (
                  <View key={ci} style={{ flex: 1, gap: 3 }}>
                    {col.map((cell, ri) => (
                      <View
                        key={cell.key + ri}
                        style={{
                          height: 16, borderRadius: 5,
                          backgroundColor: cell.pad
                            ? 'transparent'
                            : cell.progress == null
                              ? t.glass.fill
                              : heatColor(cell.progress, t.scheme),
                          borderWidth: cell.isToday ? 1.3 : 0,
                          borderColor: t.text,
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
            <Txt v="caption" c="tertiary">Brighter tile, fuller day — outlined tile is today.</Txt>
          </Section>

          <Section title="Habit by habit" delay={120}>
            <View style={{ gap: 14 }}>
              {habits.map((habit) => {
                const c = habitColor(habit.color);
                const rate = habitRate(habit, completions, 30);
                const now = currentStreak(habit, completions);
                const best = bestStreak(habit, completions);
                return (
                  <View key={habit.id} style={{ gap: 7 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <LinearGradient
                        colors={c.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: 30, height: 30, borderRadius: 10,
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon name={habit.icon} color="#080B18" size={16} />
                      </LinearGradient>
                      <Txt v="headline" style={{ flex: 1 }}>{habit.name}</Txt>
                      <Txt v="footnote" c="secondary">
                        {rate == null ? 'new' : `${Math.round(rate * 100)}%`}
                      </Txt>
                    </View>
                    <View
                      style={{
                        height: 10, borderRadius: R.capsule,
                        backgroundColor: t.glass.fill, overflow: 'hidden',
                      }}
                    >
                      {rate != null && rate > 0 && (
                        <LinearGradient
                          colors={c.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            width: `${Math.max(5, rate * 100)}%`,
                            height: '100%', borderRadius: R.capsule,
                          }}
                        />
                      )}
                    </View>
                    <Txt v="caption" c="tertiary">
                      streak {now} · best {best} · last 30 days
                    </Txt>
                  </View>
                );
              })}
            </View>
          </Section>
        </>
      )}
    </ScrollView>
  );
}
