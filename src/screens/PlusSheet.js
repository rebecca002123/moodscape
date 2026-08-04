// SnapNest Plus — the dream tier, worn honestly: nothing is for sale in
// this preview build, so the sheet is a promise, not a till.

import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, radii, type } from '../theme';
import Nesty from '../components/mascots/Nesty';
import RoseButton from '../components/RoseButton';

const PERKS = [
  ['♾️', 'Unlimited scans', 'no monthly counting'],
  ['📉', 'Price-drop alerts', 'clothes, tech, beauty — watched for you'],
  ['💞', 'Shared Nests', 'plan trips and wishlists together'],
  ['🫧', 'Auto screenshot detection', 'new snaps file themselves'],
  ['🧠', 'A bigger Brain', 'AI search that can read the photos too'],
  ['🎨', 'Themes & mascots', 'dress the nest your way'],
];

export default function PlusSheet({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <LinearGradient colors={['#FFE9F1', '#EAE2FB', '#FBF7F1']} style={styles.sheet}>
          <View style={styles.grabber} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 26 }}>
            <View style={{ alignItems: 'center' }}>
              <View>
                <Nesty size={104} inNest={false} />
                <Text style={styles.crown}>👑</Text>
              </View>
              <Text style={[type.h1, { fontSize: 27, marginTop: 4 }]}>SnapNest Plus</Text>
              <View style={styles.priceChip}>
                <Text style={styles.priceText}>£3.99 / month · someday 🌸</Text>
              </View>
            </View>

            <View style={{ marginTop: 20, gap: 13, paddingHorizontal: 26 }}>
              {PERKS.map(([emoji, title, sub]) => (
                <View key={title} style={styles.perkRow}>
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.perkTitle}>{title}</Text>
                    <Text style={styles.perkSub}>{sub}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[type.tiny, { textAlign: 'center', marginTop: 20, lineHeight: 17, paddingHorizontal: 30 }]}>
              This is a preview build — Plus isn't on sale yet,{'\n'}and today everything inside is already yours. 💝
            </Text>

            <View style={{ paddingHorizontal: 26, marginTop: 16 }}>
              <RoseButton label="Sounds dreamy 🫧" onPress={onClose} />
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radii.big,
    borderTopRightRadius: radii.big,
    maxHeight: '88%',
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(70,59,85,0.18)', marginBottom: 12 },
  crown: { position: 'absolute', top: -14, right: -4, fontSize: 26, transform: [{ rotate: '18deg' }] },
  priceChip: { marginTop: 8, backgroundColor: '#fff', borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  priceText: { fontSize: 14, fontWeight: '800', color: palette.rose },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: radii.chip + 2, padding: 13 },
  perkTitle: { fontSize: 14.5, fontWeight: '800', color: palette.ink },
  perkSub: { fontSize: 12, color: palette.inkSoft, marginTop: 1 },
});
