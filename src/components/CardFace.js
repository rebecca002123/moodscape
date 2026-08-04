// A smart card wearing its type's pastel: the one shape every screenshot
// becomes. Tiles for the home shelves, wide rows for lists.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPES, palette, radii, softShadow } from '../theme';
import { prettyDate, prettyTime, relativeDay } from '../utils/dates';
import Bouncy from './Bouncy';

// The one line this card most wants you to remember.
export function cardAccent(card) {
  const f = card.fields || {};
  switch (card.type) {
    case 'product':
      return { main: f.priceRaw || 'wishlist', sub: f.wasPrice && f.price ? `was £${f.wasPrice.toFixed(2)}` : null, strike: !!(f.wasPrice && f.price) };
    case 'event':
      return f.when
        ? { main: relativeDay(f.when), sub: `${prettyDate(f.when)}${f.whenHasTime ? ` · ${prettyTime(f.when)}` : ''}` }
        : { main: 'event', sub: null };
    case 'recipe':
      return { main: f.minutes ? `${f.minutes} min` : 'recipe', sub: f.serves ? `serves ${f.serves}` : null };
    case 'job':
      return f.deadline
        ? { main: `apply ${relativeDay(f.deadline)}`, sub: f.salary || null }
        : { main: f.salary || 'role', sub: f.workStyle || null };
    case 'outfit':
      return { main: f.priceRaw || 'style', sub: f.pieces?.length ? `${f.pieces.length} piece${f.pieces.length === 1 ? '' : 's'}` : null };
    case 'place':
      return { main: f.postcode || 'saved', sub: null };
    case 'message':
      return { main: 'reply ✍️', sub: null };
    case 'travel':
      return { main: f.priceFrom ? `from ${f.priceFrom}` : 'trip', sub: f.nights ? `${f.nights} nights` : null };
    default:
      return { main: 'idea', sub: null };
  }
}

export default function CardFace({ card, onPress, wide = false }) {
  const meta = TYPES[card.type] || TYPES.idea;
  const accent = cardAccent(card);

  if (wide) {
    return (
      <Bouncy onPress={onPress} style={[styles.wide, { backgroundColor: meta.bg }, card.done && styles.doneCard]}>
        <View style={styles.wideEmoji}>
          <Text style={{ fontSize: 22 }}>{card.done ? '✅' : meta.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.title, card.done && styles.doneText]}>{card.title}</Text>
          {card.subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>{card.subtitle}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.accentMain, { color: meta.deep }]}>{accent.main}</Text>
          {accent.sub ? (
            <Text style={[styles.accentSub, accent.strike && styles.strike]}>{accent.sub}</Text>
          ) : null}
        </View>
      </Bouncy>
    );
  }

  return (
    <Bouncy onPress={onPress} style={[styles.tile, { backgroundColor: meta.bg }, card.done && styles.doneCard]}>
      <View style={styles.tileTop}>
        <Text style={{ fontSize: 17 }}>{card.done ? '✅' : meta.emoji}</Text>
        <Text style={[styles.nestName, { color: meta.deep }]}>{meta.nest}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.title, { marginTop: 8, minHeight: 38 }, card.done && styles.doneText]}>
        {card.title}
      </Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.accentMain, { color: meta.deep, fontSize: 17 }]}>{accent.main}</Text>
      {accent.sub ? (
        <Text style={[styles.accentSub, accent.strike && styles.strike]}>{accent.sub}</Text>
      ) : (
        card.subtitle ? <Text numberOfLines={1} style={styles.accentSub}>{card.subtitle}</Text> : null
      )}
    </Bouncy>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 172,
    height: 140,
    borderRadius: radii.card,
    padding: 14,
    marginRight: 12,
    ...softShadow,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nestName: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.85 },
  title: { fontSize: 15, fontWeight: '800', color: palette.ink, lineHeight: 19 },
  subtitle: { fontSize: 12.5, color: palette.inkSoft, marginTop: 2 },
  accentMain: { fontSize: 15, fontWeight: '800' },
  accentSub: { fontSize: 11.5, color: palette.inkSoft, marginTop: 1 },
  strike: { textDecorationLine: 'line-through' },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    ...softShadow,
    shadowOpacity: 0.06,
  },
  wideEmoji: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCard: { opacity: 0.62 },
  doneText: { textDecorationLine: 'line-through' },
});
