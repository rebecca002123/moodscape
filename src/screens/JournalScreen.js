import React, { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassPressable, GlassSurface, Txt } from '../components/Glass';
import { OrbGraphic } from '../components/MoodOrb';
import { MOODS } from '../theme/moods';
import { useEntries } from '../state/store';
import { useTheme, radius as R } from '../theme/theme';
import { friendlyDay, timeOf } from '../utils/dates';
import { warn } from '../utils/haptics';

function EntryCard({ entry, onDelete, index }) {
  const t = useTheme();
  const m = MOODS[entry.mood] || MOODS.calm;
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(Math.min(index, 8) * 50)}>
      <GlassPressable
        onLongPress={onDelete}
        accessibilityLabel={`${m.label} check-in at ${timeOf(entry.createdAt)}. Long press to delete.`}
        innerStyle={{ padding: 16, flexDirection: 'row', gap: 14 }}
      >
        <View style={{ paddingTop: 2 }}>
          <OrbGraphic mood={m.key} size={42} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt v="headline">{m.label}</Txt>
            <Txt v="caption" c="tertiary">{timeOf(entry.createdAt)}</Txt>
          </View>
          {!!entry.note && <Txt v="subhead" c="secondary">{entry.note}</Txt>}
          {entry.tags?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {entry.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    borderRadius: R.capsule, paddingVertical: 3, paddingHorizontal: 9,
                    backgroundColor: t.glass.fill, borderWidth: 1, borderColor: t.glass.stroke,
                  }}
                >
                  <Txt v="caption" c="tertiary">{tag}</Txt>
                </View>
              ))}
            </View>
          )}
        </View>
      </GlassPressable>
    </Animated.View>
  );
}

export default function JournalScreen({ topInset }) {
  const { entries, deleteEntry } = useEntries();

  const sections = useMemo(() => {
    const byDay = new Map();
    for (const e of entries) {
      if (!byDay.has(e.day)) byDay.set(e.day, []);
      byDay.get(e.day).push(e);
    }
    return [...byDay.entries()].map(([day, data]) => ({ day, data }));
  }, [entries]);

  const confirmDelete = (entry) => {
    warn();
    Alert.alert(
      'Delete this check-in?',
      'It will disappear from your journal and insights.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) },
      ],
    );
  };

  let flatIndex = 0;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 6 }}>
        <Txt v="largeTitle">Journal</Txt>
        <Txt v="subhead" c="secondary">
          {entries.length === 0
            ? 'Your story starts with one check-in'
            : `${entries.length} check-in${entries.length === 1 ? '' : 's'} and counting`}
        </Txt>
      </View>

      {sections.length === 0 && (
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassSurface innerStyle={{ padding: 28, alignItems: 'center', gap: 12 }}>
            <OrbGraphic mood="calm" size={72} />
            <Txt v="title3">Nothing here yet</Txt>
            <Txt v="subhead" c="secondary" style={{ textAlign: 'center' }}>
              Head to Today and plant your first mood. It only takes ten seconds.
            </Txt>
          </GlassSurface>
        </Animated.View>
      )}

      {sections.map((section) => (
        <View key={section.day} style={{ gap: 10 }}>
          <Txt v="footnote" c="secondary" style={{ marginTop: 8, marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {friendlyDay(section.day)}
          </Txt>
          {section.data.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={flatIndex++}
              onDelete={() => confirmDelete(entry)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
