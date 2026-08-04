// "What was that pink Wi-Fi router I saved?" — ask in your own words and
// the Nest Brain rummages through every card it has ever filed for you.

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Keyboard } from 'react-native';
import { palette, radii, softShadow, type } from '../theme';
import { useNest } from '../state/NestStore';
import { searchCards } from '../brain/nestBrain';
import CardFace from '../components/CardFace';
import Nesty from '../components/mascots/Nesty';
import Bouncy from '../components/Bouncy';

const SUGGESTIONS = [
  'pink trainers',
  'jobs in crawley',
  'recipes',
  'my trips',
  'messages to reply',
  'gigs',
];

export default function AskScreen({ topInset, onOpenCard }) {
  const { cards } = useNest();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCards(cards, query), [cards, query]);
  const asked = query.trim().length > 1;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: topInset + 18, paddingHorizontal: 22, paddingBottom: 170 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={type.h1}>Ask my{'\n'}screenshots 💭</Text>
      <Text style={[type.soft, { marginTop: 6 }]}>Plain words are fine — the Brain knows what it filed.</Text>

      <View style={styles.searchWrap}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="what was that pink…"
          placeholderTextColor={palette.inkFaint}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {query ? (
          <Bouncy haptic={false} onPress={() => setQuery('')} style={{ padding: 4 }} accessibilityLabel="Clear search">
            <Text style={{ color: palette.inkFaint, fontSize: 15 }}>✕</Text>
          </Bouncy>
        ) : null}
      </View>

      {!asked && (
        <>
          <Text style={[type.tiny, { marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' }]}>
            Try asking for
          </Text>
          <View style={styles.chipWrap}>
            {SUGGESTIONS.map((s) => (
              <Bouncy key={s} haptic={false} onPress={() => setQuery(s)} style={styles.suggestChip}>
                <Text style={styles.suggestText}>{s}</Text>
              </Bouncy>
            ))}
          </View>
          <View style={{ alignItems: 'center', marginTop: 46 }}>
            <Nesty size={110} />
            <Text style={[type.soft, { textAlign: 'center', marginTop: 10, lineHeight: 20 }]}>
              Every card's words are searchable —{'\n'}titles, prices, places, senders, all of it.
            </Text>
          </View>
        </>
      )}

      {asked && (
        <View style={{ marginTop: 20 }}>
          {results.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Nesty size={100} mood="sleepy" />
              <Text style={[type.h3, { marginTop: 10 }]}>Nothing in the nest about that</Text>
              <Text style={[type.soft, { textAlign: 'center', marginTop: 6 }]}>
                Maybe it's still a screenshot?{'\n'}Scan it in and ask me again 🐦
              </Text>
            </View>
          ) : (
            <>
              <Text style={[type.tiny, { marginBottom: 10 }]}>
                {results.length} card{results.length === 1 ? '' : 's'} found
              </Text>
              {results.map((c) => (
                <CardFace key={c.id} card={c} wide onPress={() => onOpenCard(c.id)} />
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: radii.chip + 4,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...softShadow,
    shadowOpacity: 0.08,
  },
  searchInput: { flex: 1, fontSize: 15.5, color: palette.ink, paddingVertical: 13 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  suggestChip: {
    backgroundColor: '#fff',
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...softShadow,
    shadowOpacity: 0.06,
  },
  suggestText: { fontSize: 13.5, fontWeight: '700', color: palette.ink },
});
