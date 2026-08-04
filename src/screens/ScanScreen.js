// The scan: a screenshot goes in, the beam sweeps, and the Nest Brain
// explains what it found — then you tweak anything and file the card.
// Samples carry their own words; your own screenshots lend theirs via
// paste (iOS Live Text is perfect for this) or a quick hand-filed card.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal, View, Text, TextInput, ScrollView, Image, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { palette, TYPES, radii, softShadow, type } from '../theme';
import { useNest, FREE_SCANS_PER_MONTH } from '../state/NestStore';
import { buildCard } from '../brain/nestBrain';
import { SAMPLE_BY_ID } from '../brain/samples';
import SampleShot from '../components/SampleShot';
import ScanBeam from '../components/ScanBeam';
import RoseButton from '../components/RoseButton';
import Bouncy from '../components/Bouncy';

const SHOT_HEIGHT = 250;

export default function ScanScreen({ item, onClose, onOpenPlus }) {
  const { saveCard, removeFromInbox, scansLeft, settings, nests } = useNest();
  const sample = item?.kind === 'sample' ? SAMPLE_BY_ID[item.sampleId] : null;

  const needsGate = scansLeft <= 0 && !settings.plus;
  const [phase, setPhase] = useState('start'); // start | gate | text | scanning | result | saved
  const [text, setText] = useState('');
  const [draft, setDraft] = useState(null);
  const [title, setTitle] = useState('');
  const titleTouched = useRef(false);
  const [nestId, setNestId] = useState(null);
  const [binArmed, setBinArmed] = useState(false);

  // Decide the opening scene once per item.
  useEffect(() => {
    if (!item) return;
    setPhase(needsGate ? 'gate' : sample ? 'scanning' : 'text');
    setText(sample ? sample.text : '');
    setDraft(null);
    setTitle('');
    titleTouched.current = false;
    setNestId(null);
    setBinArmed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  // The beam does its little theatre, then the Brain speaks.
  useEffect(() => {
    if (phase !== 'scanning') return undefined;
    const t = setTimeout(() => {
      const d = buildCard(text);
      setDraft(d);
      setTitle(d.title);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setPhase('result');
    }, 1700);
    return () => clearTimeout(t);
  }, [phase, text]);

  const retype = (t) => {
    const d = buildCard(text, { hintType: t });
    setDraft(d);
    if (!titleTouched.current) setTitle(d.title);
    Haptics.selectionAsync().catch(() => {});
  };

  const orderedTypes = useMemo(() => {
    if (!draft) return Object.keys(TYPES);
    const ranked = draft.ranked.map((r) => r.type);
    return [...new Set([draft.type, ...ranked, ...Object.keys(TYPES)])];
  }, [draft]);

  const save = () => {
    const finalDraft = { ...draft, title: title.trim() || draft.title || 'Untitled snap' };
    saveCard(finalDraft, {
      text,
      kind: sample ? 'sample' : 'photo',
      sampleId: sample?.id || null,
      uri: item?.uri || null,
      inboxId: item?.id,
      nestId,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPhase('saved');
  };

  useEffect(() => {
    if (phase !== 'saved') return undefined;
    const t = setTimeout(onClose, 2100);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  const bin = () => {
    if (!binArmed) { setBinArmed(true); return; }
    if (item?.id) removeFromInbox(item.id);
    onClose();
  };

  const pasteClipboard = async () => {
    try {
      const s = await Clipboard.getStringAsync();
      if (s) setText((prev) => (prev ? `${prev}\n${s}` : s));
      Haptics.selectionAsync().catch(() => {});
    } catch { /* clipboard shy today */ }
  };

  const fileByHand = () => {
    const d = buildCard(text || ' ', { hintType: 'idea' });
    setDraft({ ...d, title: '', why: [{ emoji: '✍️', text: 'Filed by hand — no words needed' }] });
    setTitle('');
    setPhase('result');
  };

  if (!item) return null;
  const meta = draft ? TYPES[draft.type] : null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 26 }}>

            {/* ——— the screenshot, always on stage ——— */}
            <View style={styles.stage}>
              <View style={{ borderRadius: 16, overflow: 'hidden' }}>
                {sample ? (
                  <SampleShot sample={sample} width={SHOT_HEIGHT * 0.62} />
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
                )}
                {phase === 'scanning' && <ScanBeam height={SHOT_HEIGHT} />}
              </View>
            </View>

            {/* ——— gate: out of free scans ——— */}
            {phase === 'gate' && (
              <View style={{ paddingHorizontal: 22 }}>
                <Text style={[type.h2, { textAlign: 'center' }]}>You've used all {FREE_SCANS_PER_MONTH} free scans this month 🫣</Text>
                <Text style={[type.soft, { textAlign: 'center', marginTop: 8, lineHeight: 20 }]}>
                  SnapNest Plus scans without counting. In this preview build, though, the treats are free.
                </Text>
                <View style={{ marginTop: 16, gap: 8 }}>
                  <RoseButton label="Peek at SnapNest Plus" onPress={onOpenPlus} />
                  <RoseButton ghost label="Carry on scanning (preview treat 🧁)" onPress={() => setPhase(sample ? 'scanning' : 'text')} />
                </View>
              </View>
            )}

            {/* ——— photo screenshots lend their words here ——— */}
            {phase === 'text' && (
              <View style={{ paddingHorizontal: 22 }}>
                <Text style={type.h2}>Lend me the words 🐦</Text>
                <Text style={[type.soft, { marginTop: 6, lineHeight: 20 }]}>
                  I read everything right here on your phone — I just can't see inside photos yet.
                  Copy the text from your screenshot (iOS Live Text does this beautifully), paste it below, and I'll do the rest.
                </Text>
                <TextInput
                  style={styles.textBox}
                  multiline
                  placeholder="Paste or type what the screenshot says…"
                  placeholderTextColor={palette.inkFaint}
                  value={text}
                  onChangeText={setText}
                  maxLength={2000}
                />
                <View style={{ flexDirection: 'row', gap: 9, marginTop: 10 }}>
                  <Bouncy onPress={pasteClipboard} style={styles.pasteBtn}>
                    <Text style={styles.pasteText}>📋 Paste</Text>
                  </Bouncy>
                  <Bouncy onPress={() => text.trim() && setPhase('scanning')} disabled={!text.trim()} style={[styles.pasteBtn, { backgroundColor: palette.rose, flex: 1 }]}>
                    <Text style={[styles.pasteText, { color: '#fff' }]}>Scan it ✨</Text>
                  </Bouncy>
                </View>
                <RoseButton ghost label="Skip — I'll file it by hand" onPress={fileByHand} />
              </View>
            )}

            {phase === 'scanning' && (
              <Text style={[type.soft, { textAlign: 'center', marginTop: 4 }]}>
                The Nest Brain is reading… on your phone, nowhere else 🧠
              </Text>
            )}

            {/* ——— the reveal ——— */}
            {phase === 'result' && draft && (
              <View style={{ paddingHorizontal: 22 }}>
                <View style={styles.typeRow}>
                  {orderedTypes.slice(0, 5).map((t) => {
                    const m = TYPES[t];
                    const on = draft.type === t;
                    return (
                      <Bouncy key={t} haptic={false} onPress={() => retype(t)} style={[styles.typeChip, { backgroundColor: on ? m.deep : m.bg }]}>
                        <Text style={{ fontSize: 13 }}>{m.emoji}</Text>
                        <Text style={[styles.typeChipText, { color: on ? '#fff' : m.deep }]}>{m.label}</Text>
                      </Bouncy>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.titleInput}
                  value={title}
                  placeholder="Give it a name…"
                  placeholderTextColor={palette.inkFaint}
                  onChangeText={(v) => { titleTouched.current = true; setTitle(v); }}
                  maxLength={80}
                />
                {draft.subtitle ? <Text style={[type.soft, { marginTop: 6 }]}>{draft.subtitle}</Text> : null}

                {/* why the Brain thinks so */}
                <View style={{ marginTop: 12, gap: 6 }}>
                  {draft.why.slice(0, 4).map((w, i) => (
                    <View key={i} style={styles.whyRow}>
                      <Text style={{ fontSize: 13 }}>{w.emoji}</Text>
                      <Text style={styles.whyText}>{w.text}</Text>
                    </View>
                  ))}
                </View>

                {/* custom nests, if any */}
                {nests.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 8 }}>
                    <Bouncy haptic={false} onPress={() => setNestId(null)} style={[styles.nestChip, !nestId && styles.nestChipOn]}>
                      <Text style={[styles.nestChipText, !nestId && { color: '#fff' }]}>{meta?.emoji} {meta?.nest}</Text>
                    </Bouncy>
                    {nests.map((n) => (
                      <Bouncy key={n.id} haptic={false} onPress={() => setNestId(n.id)} style={[styles.nestChip, nestId === n.id && styles.nestChipOn]}>
                        <Text style={[styles.nestChipText, nestId === n.id && { color: '#fff' }]}>{n.emoji} {n.name}</Text>
                      </Bouncy>
                    ))}
                  </ScrollView>
                )}

                <View style={{ marginTop: 16, gap: 8 }}>
                  <RoseButton label={`Add to ${nestId ? nests.find((n) => n.id === nestId)?.name : meta?.nest} ${meta?.emoji}`} onPress={save} />
                  <RoseButton ghost label={binArmed ? 'Really bin it? Tap again' : 'Not useful — bin this one'} onPress={bin} />
                </View>
              </View>
            )}

            {/* ——— saved ——— */}
            {phase === 'saved' && meta && (
              <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 40 }}>{meta.emoji}</Text>
                <Text style={[type.h2, { marginTop: 6 }]}>Tucked into {meta.nest} ✨</Text>
                <Text style={[type.soft, { textAlign: 'center', marginTop: 8, lineHeight: 20 }]}>
                  Card safe! Clean-up tip: the original screenshot can leave your
                  camera roll whenever you're ready 🧹
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.cream,
    borderTopLeftRadius: radii.big,
    borderTopRightRadius: radii.big,
    maxHeight: '92%',
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(70,59,85,0.15)', marginBottom: 8 },
  stage: { alignItems: 'center', paddingVertical: 14 },
  photo: { width: SHOT_HEIGHT * 0.62, height: SHOT_HEIGHT, borderRadius: 16, backgroundColor: palette.lavender },
  textBox: {
    marginTop: 12,
    minHeight: 96,
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: radii.chip,
    padding: 14,
    fontSize: 14.5,
    color: palette.ink,
    textAlignVertical: 'top',
    ...softShadow,
    shadowOpacity: 0.06,
  },
  pasteBtn: {
    backgroundColor: '#fff',
    borderRadius: radii.chip,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    ...softShadow,
    shadowOpacity: 0.08,
  },
  pasteText: { fontSize: 14.5, fontWeight: '800', color: palette.ink },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  typeChipText: { fontSize: 12.5, fontWeight: '800' },
  titleInput: {
    marginTop: 13,
    backgroundColor: '#fff',
    borderRadius: radii.chip,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16.5,
    fontWeight: '700',
    color: palette.ink,
    ...softShadow,
    shadowOpacity: 0.06,
  },
  whyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whyText: { fontSize: 13, color: palette.inkSoft, flex: 1 },
  nestChip: {
    backgroundColor: '#fff',
    borderRadius: radii.pill,
    paddingHorizontal: 13,
    paddingVertical: 9,
    ...softShadow,
    shadowOpacity: 0.06,
  },
  nestChipOn: { backgroundColor: palette.rose },
  nestChipText: { fontSize: 13, fontWeight: '800', color: palette.ink },
});
