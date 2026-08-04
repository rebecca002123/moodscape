// The screenshot inbox: new arrivals wait here like unread messages,
// each one a little impatient to become a card.

import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radii, softShadow, type } from '../theme';
import { useNest, FREE_SCANS_PER_MONTH } from '../state/NestStore';
import { SAMPLE_BY_ID } from '../brain/samples';
import { timeAgo } from '../utils/dates';
import SampleShot from '../components/SampleShot';
import Nesty from '../components/mascots/Nesty';
import Bouncy from '../components/Bouncy';

export default function InboxScreen({ onClose, onScan, onAdd, onOpenPlus }) {
  const insets = useSafeAreaInsets();
  const { inbox, scansLeft, settings } = useNest();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.cream }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Bouncy onPress={onClose} haptic={false} style={styles.backBtn} accessibilityLabel="Close inbox">
          <Text style={styles.backText}>‹</Text>
        </Bouncy>
        <View style={{ flex: 1 }}>
          <Text style={type.h2}>Screenshot inbox 📥</Text>
          <Text style={type.tiny}>
            {inbox.length ? `${inbox.length} waiting to be sorted` : 'nothing waiting — bliss'}
          </Text>
        </View>
        <Bouncy onPress={onOpenPlus} haptic={false} style={styles.scansChip} accessibilityLabel="Scans left this month">
          <Text style={styles.scansText}>
            {settings.plus ? '∞' : `${scansLeft}/${FREE_SCANS_PER_MONTH}`} scans
          </Text>
        </Bouncy>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
        {inbox.length === 0 && (
          <View style={styles.emptyBox}>
            <Nesty size={120} />
            <Text style={[type.h3, { marginTop: 10 }]}>All sorted. The nest is tidy 🪺</Text>
            <Text style={[type.soft, { textAlign: 'center', marginTop: 6 }]}>
              New screenshots will queue up here,{'\n'}ready for their little scan.
            </Text>
          </View>
        )}

        {[...inbox].sort((a, b) => b.addedAt - a.addedAt).map((item) => {
          const sample = item.kind === 'sample' ? SAMPLE_BY_ID[item.sampleId] : null;
          return (
            <Bouncy key={item.id} onPress={() => onScan(item)} style={styles.row} accessibilityLabel="Scan this screenshot">
              {sample ? (
                <SampleShot sample={sample} width={54} />
              ) : (
                <Image source={{ uri: item.uri }} style={styles.thumb} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {sample ? sample.name : 'Screenshot'}
                </Text>
                <Text style={type.tiny}>added {timeAgo(item.addedAt)} · unread</Text>
              </View>
              <View style={styles.unreadDot} />
              <Text style={styles.rowGo}>scan ✨</Text>
            </Bouncy>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Bouncy onPress={() => onAdd('photos')} style={[styles.addBtn, { backgroundColor: palette.rose }]}>
          <Text style={[styles.addText, { color: '#fff' }]}>🖼  From my photos</Text>
        </Bouncy>
        <Bouncy onPress={() => onAdd('sample')} style={[styles.addBtn, { backgroundColor: '#fff' }]}>
          <Text style={styles.addText}>🎁  Try a sample</Text>
        </Bouncy>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...softShadow, shadowOpacity: 0.08 },
  backText: { fontSize: 24, color: palette.ink, marginTop: -3 },
  scansChip: { backgroundColor: '#fff', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8, ...softShadow, shadowOpacity: 0.07 },
  scansText: { fontSize: 12.5, fontWeight: '800', color: palette.rose },
  emptyBox: { alignItems: 'center', marginTop: 70 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#fff',
    borderRadius: radii.card,
    padding: 12,
    marginBottom: 11,
    ...softShadow,
    shadowOpacity: 0.07,
  },
  thumb: { width: 54, height: 87, borderRadius: 10, backgroundColor: palette.lavender },
  rowTitle: { fontSize: 15, fontWeight: '800', color: palette.ink },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: palette.rose },
  rowGo: { fontSize: 13, fontWeight: '800', color: palette.rose },
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addBtn: {
    flex: 1,
    borderRadius: radii.chip + 4,
    paddingVertical: 14,
    alignItems: 'center',
    ...softShadow,
    shadowOpacity: 0.12,
  },
  addText: { fontSize: 14.5, fontWeight: '800', color: palette.ink },
});
