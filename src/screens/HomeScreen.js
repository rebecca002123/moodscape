// Good morning, you 🌸 — the home shelf: what's waiting in the inbox,
// what today would like you to remember, and every cosy row of cards.

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { palette, radii, softShadow, type } from '../theme';
import { useNest } from '../state/NestStore';
import { greeting } from '../utils/dates';
import Nesty from '../components/mascots/Nesty';
import CardFace from '../components/CardFace';
import Bouncy from '../components/Bouncy';

function Section({ title, cards, onOpenCard }) {
  if (!cards.length) return null;
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={[type.h2, { paddingHorizontal: 24 }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 6 }}
      >
        {cards.map((c) => (
          <CardFace key={c.id} card={c} onPress={() => onOpenCard(c.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen({ topInset, onOpenInbox, onOpenCard, onAdd }) {
  const { settings, inbox, cards, today } = useNest();

  const sections = useMemo(() => {
    const live = cards.filter((c) => !c.done);
    const now = Date.now();
    const upcoming = live
      .filter((c) => (c.type === 'event' || c.type === 'travel') && c.fields.when && c.fields.when >= now - 12 * 3600 * 1000)
      .sort((a, b) => a.fields.when - b.fields.when);
    return [
      { key: 'upcoming', title: 'Upcoming', cards: upcoming },
      { key: 'products', title: 'Saved products', cards: live.filter((c) => c.type === 'product') },
      { key: 'reply', title: 'Reply later', cards: live.filter((c) => c.type === 'message') },
      { key: 'recipes', title: 'Recipes', cards: live.filter((c) => c.type === 'recipe') },
      { key: 'trips', title: 'Dream trips', cards: live.filter((c) => c.type === 'travel' && !upcoming.includes(c)) },
      { key: 'recent', title: 'Recently added', cards: [...cards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6) },
    ];
  }, [cards]);

  const name = settings.name || 'friend';
  const empty = cards.length === 0 && inbox.length === 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: 170 }}
      showsVerticalScrollIndicator={false}
    >
      {/* greeting */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={type.h1}>{greeting()},{'\n'}{name} 🌸</Text>
          <Text style={[type.soft, { marginTop: 6 }]}>
            {inbox.length
              ? `You have ${inbox.length} screenshot${inbox.length === 1 ? '' : 's'} ready to organise.`
              : cards.length
                ? 'Your nest is looking lovely and tidy.'
                : 'Let’s catch your very first screenshot.'}
          </Text>
        </View>
        <Nesty size={86} mood={inbox.length ? 'happy' : 'sleepy'} />
      </View>

      {/* inbox banner */}
      {inbox.length > 0 && (
        <Bouncy onPress={onOpenInbox} style={styles.inboxBanner} accessibilityLabel="Open your screenshot inbox">
          <View style={{ flex: 1 }}>
            <Text style={styles.inboxTitle}>📥  Screenshot inbox</Text>
            <Text style={styles.inboxSub}>
              {inbox.length} waiting like unread messages
            </Text>
          </View>
          <View style={styles.inboxBadge}>
            <Text style={styles.inboxBadgeText}>{inbox.length}</Text>
          </View>
          <Text style={styles.inboxGo}>Sort ✨</Text>
        </Bouncy>
      )}

      {/* today strip */}
      {today.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[type.h2, { paddingHorizontal: 24 }]}>Today</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, gap: 9 }}
          >
            {today.map((t) => (
              <Bouncy key={t.id} onPress={() => onOpenCard(t.cardId)} style={styles.todayChip}>
                <Text style={{ fontSize: 15 }}>{t.emoji}</Text>
                <Text numberOfLines={1} style={styles.todayText}>{t.label}</Text>
              </Bouncy>
            ))}
          </ScrollView>
        </View>
      )}

      {/* empty nest */}
      {empty && (
        <View style={styles.emptyBox}>
          <Nesty size={130} mood="sleepy" />
          <Text style={[type.h2, { textAlign: 'center', marginTop: 10 }]}>The nest is empty</Text>
          <Text style={[type.soft, { textAlign: 'center', marginTop: 6, lineHeight: 21 }]}>
            Tap the ＋ to bring in a screenshot —{'\n'}or try a sample and watch the magic.
          </Text>
          <Bouncy onPress={onAdd} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Add a screenshot</Text>
          </Bouncy>
        </View>
      )}

      {/* the shelves */}
      {sections.map((s) => (
        <Section key={s.key} title={s.title} cards={s.cards} onOpenCard={onOpenCard} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  inboxBanner: {
    marginTop: 22,
    marginHorizontal: 24,
    backgroundColor: palette.roseSoft,
    borderRadius: radii.card,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...softShadow,
  },
  inboxTitle: { fontSize: 15.5, fontWeight: '800', color: palette.ink },
  inboxSub: { fontSize: 12.5, color: palette.inkSoft, marginTop: 2 },
  inboxBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  inboxBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  inboxGo: { fontSize: 14, fontWeight: '800', color: palette.rose },
  todayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: radii.pill,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxWidth: 300,
    ...softShadow,
    shadowOpacity: 0.07,
  },
  todayText: { fontSize: 13.5, fontWeight: '700', color: palette.ink },
  emptyBox: { alignItems: 'center', marginTop: 46, paddingHorizontal: 40 },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: palette.rose,
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
