// The nest's front room: three tabs, a floating ＋, the inbox overlay,
// and every sheet — all hand-wired, no navigation library required.

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { palette, radii, softShadow, type } from '../theme';
import { useNest } from '../state/NestStore';
import { SAMPLES } from '../brain/samples';
import HomeScreen from './HomeScreen';
import NestsScreen from './NestsScreen';
import AskScreen from './AskScreen';
import InboxScreen from './InboxScreen';
import ScanScreen from './ScanScreen';
import CardDetail from './CardDetail';
import PlusSheet from './PlusSheet';
import SettingsSheet from './SettingsSheet';
import FloatingAdd from '../components/FloatingAdd';
import Bouncy from '../components/Bouncy';
import RoseButton from '../components/RoseButton';

const TABS = [
  { key: 'home', label: 'Home', emoji: '🏡' },
  { key: 'nests', label: 'Nests', emoji: '🪺' },
  { key: 'ask', label: 'Ask', emoji: '💭' },
];

export default function MainShell() {
  const insets = useSafeAreaInsets();
  const { inbox, cards, addPhotosToInbox, addSampleToInbox } = useNest();

  const [tab, setTab] = useState('home');
  const [inboxOpen, setInboxOpen] = useState(false);
  const [scanItem, setScanItem] = useState(null);
  const [detailCardId, setDetailCardId] = useState(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const pickPhotos = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'No peeking allowed (yet)',
          'SnapNest can only see photos you allow. You can change this any time in your phone settings.'
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
        exif: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const items = addPhotosToInbox(res.assets);
      setImportOpen(false);
      setInboxOpen(true);
      setScanItem(items[0]);
    } catch {
      Alert.alert('Hmm', 'The photo picker got shy. Try again?');
    }
  };

  const pickSample = () => {
    const used = new Set([
      ...inbox.filter((i) => i.sampleId).map((i) => i.sampleId),
      ...cards.filter((c) => c.sampleId).map((c) => c.sampleId),
    ]);
    const fresh = SAMPLES.find((s) => !used.has(s.id)) || SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const item = addSampleToInbox(fresh.id);
    setImportOpen(false);
    setScanItem(item);
  };

  const openInboxAdd = (kind) => {
    if (kind === 'photos') pickPhotos();
    else pickSample();
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[palette.cream, palette.lavender]} style={StyleSheet.absoluteFill} />

      {/* current tab */}
      {tab === 'home' && (
        <HomeScreen
          topInset={insets.top}
          onOpenInbox={() => setInboxOpen(true)}
          onOpenCard={setDetailCardId}
          onAdd={() => setImportOpen(true)}
        />
      )}
      {tab === 'nests' && (
        <NestsScreen
          topInset={insets.top}
          onOpenCard={setDetailCardId}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {tab === 'ask' && <AskScreen topInset={insets.top} onOpenCard={setDetailCardId} />}

      {/* floating add + tab bar */}
      <FloatingAdd onPress={() => setImportOpen(true)} bottom={insets.bottom + 86} />
      <View style={[styles.tabBar, { bottom: insets.bottom + 14 }]}>
        {TABS.map((t) => {
          const on = tab === t.key;
          const badge = t.key === 'home' && inbox.length > 0;
          return (
            <Bouncy key={t.key} haptic={false} onPress={() => setTab(t.key)} style={[styles.tabItem, on && styles.tabItemOn]} accessibilityLabel={t.label}>
              <View>
                <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
                {badge && <View style={styles.tabDot} />}
              </View>
              {on && <Text style={styles.tabLabel}>{t.label}</Text>}
            </Bouncy>
          );
        })}
      </View>

      {/* inbox overlay */}
      {inboxOpen && (
        <InboxScreen
          onClose={() => setInboxOpen(false)}
          onScan={setScanItem}
          onAdd={openInboxAdd}
          onOpenPlus={() => setPlusOpen(true)}
        />
      )}

      {/* sheets & modals — one at a time, stacked by state */}
      {scanItem && (
        <ScanScreen
          item={scanItem}
          onClose={() => setScanItem(null)}
          onOpenPlus={() => { setScanItem(null); setPlusOpen(true); }}
        />
      )}
      {detailCardId && <CardDetail cardId={detailCardId} onClose={() => setDetailCardId(null)} />}
      <PlusSheet visible={plusOpen} onClose={() => setPlusOpen(false)} />
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenPlus={() => { setSettingsOpen(false); setPlusOpen(true); }}
      />

      {/* import sheet */}
      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={() => setImportOpen(false)}>
        <View style={styles.importBackdrop}>
          <View style={styles.importPanel}>
            <Text style={type.h2}>Catch a screenshot 📸</Text>
            <Text style={[type.soft, { marginTop: 4, lineHeight: 20 }]}>
              Tip: your screenshots hide in Albums → Screenshots.
            </Text>
            <View style={{ marginTop: 14, gap: 9 }}>
              <RoseButton label="🖼  From my photos" onPress={pickPhotos} />
              <Bouncy onPress={pickSample} style={styles.sampleBtn}>
                <Text style={styles.sampleText}>🎁  Try a sample screenshot</Text>
              </Bouncy>
              <RoseButton ghost label="Not now" onPress={() => setImportOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: radii.pill,
    padding: 7,
    justifyContent: 'space-around',
    ...softShadow,
    shadowOpacity: 0.14,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  tabItemOn: { backgroundColor: palette.roseSoft },
  tabLabel: { fontSize: 13.5, fontWeight: '800', color: palette.ink },
  tabDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.rose,
  },
  importBackdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'center', padding: 26 },
  importPanel: { backgroundColor: palette.cream, borderRadius: radii.big, padding: 22 },
  sampleBtn: {
    backgroundColor: '#fff',
    borderRadius: radii.chip + 6,
    paddingVertical: 14,
    alignItems: 'center',
    ...softShadow,
    shadowOpacity: 0.08,
  },
  sampleText: { fontSize: 15, fontWeight: '800', color: palette.ink },
});
