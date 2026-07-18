import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassSurface, Segmented, Txt } from '../components/Glass';
import { OrbGraphic } from '../components/MoodOrb';
import { MoodBars, MonthHeatmap, MoodCurve } from '../components/charts';
import { useEntries } from '../state/store';
import { useTheme, radius as R } from '../theme/theme';
import {
  averageScore, currentStreak, dailyAverages, entriesSince,
  moodDistribution, recentSeries, topTags,
} from '../utils/stats';
import { moodForScore } from '../theme/moods';

function StatTile({ label, children }) {
  return (
    <GlassSurface style={{ flex: 1 }} innerStyle={{ padding: 14, alignItems: 'center', gap: 6, minHeight: 88, justifyContent: 'center' }}>
      {children}
      <Txt v="caption" c="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Txt>
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

export default function InsightsScreen({ topInset }) {
  const t = useTheme();
  const { entries } = useEntries();
  const [range, setRange] = useState(7);

  const inRange = useMemo(() => entriesSince(entries, range), [entries, range]);
  const series = useMemo(() => recentSeries(entries, range), [entries, range]);
  const averages = useMemo(() => dailyAverages(entries), [entries]);
  const distribution = useMemo(() => moodDistribution(inRange), [inRange]);
  const tags = useMemo(() => topTags(inRange), [inRange]);
  const streak = currentStreak(entries);
  const avg = averageScore(inRange);
  const avgMood = avg == null ? null : moodForScore(avg);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Txt v="largeTitle">Insights</Txt>
        <Txt v="subhead" c="secondary">Your inner weather, mapped</Txt>
      </View>

      <Animated.View entering={FadeInDown.duration(450)}>
        <Segmented
          options={[
            { label: 'Last 7 days', value: 7 },
            { label: 'Last 30 days', value: 30 },
          ]}
          value={range}
          onChange={setRange}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(450).delay(60)} style={{ flexDirection: 'row', gap: 12 }}>
        <StatTile label="Streak">
          <Txt v="title2">{streak > 0 ? `🔥 ${streak}` : '—'}</Txt>
        </StatTile>
        <StatTile label="Check-ins">
          <Txt v="title2">{inRange.length || '—'}</Txt>
        </StatTile>
        <StatTile label="Typically">
          {avgMood ? (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <OrbGraphic mood={avgMood.key} size={34} />
              <Txt v="footnote">{avgMood.label}</Txt>
            </View>
          ) : (
            <Txt v="title2">—</Txt>
          )}
        </StatTile>
      </Animated.View>

      <Section title="Mood curve" delay={120}>
        <MoodCurve series={series} />
      </Section>

      <Section title="Last five weeks" delay={180}>
        <MonthHeatmap averages={averages} />
      </Section>

      <Section title="Mood mix" delay={240}>
        <MoodBars distribution={distribution} />
      </Section>

      <Section title="What shapes your days" delay={300}>
        {tags.length === 0 ? (
          <Txt v="subhead" c="tertiary">
            Tag your check-ins and MoodScape will surface what moves you most.
          </Txt>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tags.map(([tag, count]) => (
              <View
                key={tag}
                style={{
                  flexDirection: 'row', gap: 6, alignItems: 'center',
                  borderRadius: R.capsule, paddingVertical: 7, paddingHorizontal: 13,
                  backgroundColor: t.glass.fillStrong, borderWidth: 1, borderColor: t.glass.stroke,
                }}
              >
                <Txt v="footnote">{tag}</Txt>
                <Txt v="footnote" c="tertiary">{count}</Txt>
              </View>
            ))}
          </View>
        )}
      </Section>
    </ScrollView>
  );
}
