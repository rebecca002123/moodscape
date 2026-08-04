// Every Nest at a glance: pastel folders for each kind of card, your own
// custom Nests beside them, and a little weekly recap to feel proud of.

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Modal, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { palette, TYPES, INTERESTS, radii, softShadow, type } from '../theme';
import { useNest } from '../state/NestStore';
import CardFace from '../components/CardFace';
import Nesty from '../components/mascots/Nesty';
import Bouncy from '../components/Bouncy';
import RoseButton from '../components/RoseButton';

const NEST_EMOJI = ['🪺', '💞', '🏠', '🌿', '🎨', '🎁', '🌊', '⭐️'];

function FolderTile({ emoji, name, count, bg, deep, onPress, dashed }) {
  return (
    <Bouncy onPress={onPress} style={[styles.folder, { backgroundColor: bg }, dashed && styles.folderDashed]}>
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Text style={[styles.folderName, dashed && { color: palette.inkSoft }]} numberOfLines={1}>{name}</Text>
      {count != null && (
        <View style={styles.countChip}>
          <Text style={[styles.countText, { color: deep }]}>{count}</Text>
        </View>
      )}
    </Bouncy>
  );
}

export default function NestsScreen({ topInset, onOpenCard, onOpenSettings }) {
  const { cards, nests, weekly, settings, createNest, deleteNest } = useNest();
  const [open, setOpen] = useState(null); // {kind:'type', key} | {kind:'custom', id}
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🪺');
  const [deleteArmed, setDeleteArmed] = useState(false);

  const interestTypes = useMemo(() => {
    const set = new Set();
    for (const key of settings.interests) {
      const it = INTERESTS.find((i) => i.key === key);
      it?.types.forEach((t) => set.add(t));
    }
    return set;
  }, [settings.interests]);

  const smartNests = useMemo(() => {
    const counts = {};
    for (const c of cards) if (!c.nestId) counts[c.type] = (counts[c.type] || 0) + 1;
    return Object.entries(TYPES)
      .filter(([key]) => (counts[key] || 0) > 0 || interestTypes.has(key))
      .map(([key, meta]) => ({ key, meta, count: counts[key] || 0 }));
  }, [cards, interestTypes]);

  const shareRecap = () => {
    Share.share({
      message: `My week in SnapNest 🪺 — ${weekly.saved} screenshot${weekly.saved === 1 ? '' : 's'} saved, ${weekly.done} thing${weekly.done === 1 ? '' : 's'} ticked off${weekly.drops ? `, ${weekly.drops} price drop${weekly.drops === 1 ? '' : 's'} spotted 📉` : ''} ✨`,
    }).catch(() => {});
  };

  const makeNest = () => {
    if (!newName.trim()) return;
    createNest(newName, newEmoji);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCreating(false);
    setNewName('');
    setNewEmoji('🪺');
  };

  // ——— detail overlay ———
  if (open) {
    const isType = open.kind === 'type';
    const meta = isType ? TYPES[open.key] : null;
    const custom = !isType ? nests.find((n) => n.id === open.id) : null;
    if (!isType && !custom) return null;
    const list = cards
      .filter((c) => (isType ? c.type === open.key && !c.nestId : c.nestId === open.id))
      .sort((a, b) => (a.done === b.done ? b.createdAt - a.createdAt : a.done ? 1 : -1));
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.detailHeader, { paddingTop: topInset + 10 }]}>
          <Bouncy onPress={() => { setOpen(null); setDeleteArmed(false); }} haptic={false} style={styles.backBtn} accessibilityLabel="Back to nests">
            <Text style={styles.backText}>‹</Text>
          </Bouncy>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>{isType ? `${meta.emoji} ${meta.nest}` : `${custom.emoji} ${custom.name}`}</Text>
            <Text style={type.tiny}>{list.length} card{list.length === 1 ? '' : 's'}</Text>
          </View>
          {!isType && (
            <Bouncy
              haptic={false}
              onPress={() => {
                if (!deleteArmed) { setDeleteArmed(true); return; }
                deleteNest(custom.id);
                setOpen(null);
                setDeleteArmed(false);
              }}
              style={[styles.backBtn, deleteArmed && { backgroundColor: '#F7C6C6' }]}
            >
              <Text style={{ fontSize: 15 }}>{deleteArmed ? '❗️' : '🗑'}</Text>
            </Bouncy>
          )}
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {list.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Nesty size={110} mood="sleepy" />
              <Text style={[type.soft, { marginTop: 10, textAlign: 'center' }]}>
                Nothing here yet — scans will fill it up.
              </Text>
            </View>
          )}
          {list.map((c) => (
            <CardFace key={c.id} card={c} wide onPress={() => onOpenCard(c.id)} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ——— folder grid ———
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 170 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headRow}>
        <Text style={type.h1}>Your Nests 🪺</Text>
        <Bouncy onPress={onOpenSettings} haptic={false} style={styles.gearBtn} accessibilityLabel="Settings">
          <Text style={{ fontSize: 17 }}>⚙️</Text>
        </Bouncy>
      </View>

      {/* weekly recap */}
      <LinearGradient colors={['#FFE3EE', '#E8E0FA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.recap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recapTitle}>This week in your Nest</Text>
          <Text style={styles.recapLine}>
            {weekly.saved} saved · {weekly.done} ticked off{weekly.drops ? ` · ${weekly.drops} price drop${weekly.drops === 1 ? '' : 's'} 📉` : ''}
          </Text>
        </View>
        <Bouncy onPress={shareRecap} style={styles.shareBtn} accessibilityLabel="Share your weekly recap">
          <Text style={styles.shareText}>Share ✨</Text>
        </Bouncy>
      </LinearGradient>

      <View style={styles.grid}>
        {smartNests.map(({ key, meta, count }) => (
          <FolderTile
            key={key}
            emoji={meta.emoji}
            name={meta.nest}
            count={count}
            bg={meta.bg}
            deep={meta.deep}
            onPress={() => setOpen({ kind: 'type', key })}
          />
        ))}
        {nests.map((n) => (
          <FolderTile
            key={n.id}
            emoji={n.emoji}
            name={n.name}
            count={cards.filter((c) => c.nestId === n.id).length}
            bg="#FFFFFF"
            deep={palette.rose}
            onPress={() => setOpen({ kind: 'custom', id: n.id })}
          />
        ))}
        <FolderTile emoji="＋" name="New Nest" bg="rgba(255,255,255,0.6)" deep={palette.ink} onPress={() => setCreating(true)} dashed />
      </View>

      <Text style={[type.tiny, { textAlign: 'center', marginTop: 18, lineHeight: 17 }]}>
        Shared Nests — plan trips and wishlists together —{'\n'}are coming with SnapNest Plus 💞
      </Text>

      {/* create nest */}
      <Modal visible={creating} transparent animationType="fade" onRequestClose={() => setCreating(false)}>
        <View style={styles.createBackdrop}>
          <View style={styles.createPanel}>
            <Text style={type.h2}>A brand-new Nest</Text>
            <Text style={[type.soft, { marginTop: 4 }]}>For trips, house dreams, gift ideas…</Text>
            <TextInput
              style={styles.createInput}
              placeholder="Name it something lovely"
              placeholderTextColor={palette.inkFaint}
              value={newName}
              onChangeText={setNewName}
              maxLength={24}
            />
            <View style={styles.emojiRow}>
              {NEST_EMOJI.map((e) => (
                <Bouncy key={e} haptic={false} onPress={() => setNewEmoji(e)} style={[styles.emojiChip, newEmoji === e && styles.emojiChipOn]}>
                  <Text style={{ fontSize: 19 }}>{e}</Text>
                </Bouncy>
              ))}
            </View>
            <RoseButton label="Build the Nest 🪺" onPress={makeNest} disabled={!newName.trim()} />
            <RoseButton ghost label="Not now" onPress={() => setCreating(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...softShadow, shadowOpacity: 0.08 },
  recap: {
    marginTop: 18,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...softShadow,
  },
  recapTitle: { fontSize: 15, fontWeight: '800', color: palette.ink },
  recapLine: { fontSize: 12.5, color: palette.inkSoft, marginTop: 3 },
  shareBtn: { backgroundColor: '#fff', borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 9, ...softShadow, shadowOpacity: 0.1 },
  shareText: { fontSize: 13, fontWeight: '800', color: palette.rose },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  folder: {
    width: '47.8%',
    borderRadius: radii.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
    ...softShadow,
    shadowOpacity: 0.08,
  },
  folderDashed: { borderWidth: 2, borderColor: 'rgba(70,59,85,0.14)', borderStyle: 'dashed', alignItems: 'center' },
  folderName: { fontSize: 14.5, fontWeight: '800', color: palette.ink },
  countChip: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: radii.pill, minWidth: 26, height: 24,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  countText: { fontSize: 12.5, fontWeight: '800' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...softShadow, shadowOpacity: 0.08 },
  backText: { fontSize: 24, color: palette.ink, marginTop: -3 },
  createBackdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'center', padding: 26 },
  createPanel: { backgroundColor: palette.cream, borderRadius: radii.big, padding: 22, gap: 10 },
  createInput: {
    backgroundColor: '#fff', borderRadius: radii.chip, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 15.5, color: palette.ink, marginTop: 4, ...softShadow, shadowOpacity: 0.06,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiChip: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  emojiChipOn: { backgroundColor: palette.roseSoft, borderWidth: 2, borderColor: palette.rose },
});
