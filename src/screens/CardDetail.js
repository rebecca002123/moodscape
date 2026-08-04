// One card, fully unfolded: everything the Brain kept, the source it
// came from, and the little life actions — done, move, let it go.

import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, Linking, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { palette, TYPES, radii, softShadow, type } from '../theme';
import { useNest } from '../state/NestStore';
import { prettyDate, prettyTime, relativeDay } from '../utils/dates';
import { SAMPLE_BY_ID } from '../brain/samples';
import SampleShot from '../components/SampleShot';
import Bouncy from '../components/Bouncy';

const DONE_LABELS = {
  product: 'Got it 🎉', event: 'Been ✨', recipe: 'Cooked it 🍽', job: 'Applied 📮',
  message: 'Replied 💌', travel: 'Booked 🎒', place: 'Visited 📍', outfit: 'Styled 💃', idea: 'Used it ✨',
};

function FactRow({ emoji, label, value, deep }) {
  if (!value) return null;
  return (
    <View style={styles.factRow}>
      <Text style={{ fontSize: 15 }}>{emoji}</Text>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, deep && { color: deep }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function CardDetail({ cardId, onClose }) {
  const { cards, nests, toggleDone, deleteCard, updateCard } = useNest();
  const card = cards.find((c) => c.id === cardId);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => { setDeleteArmed(false); setShowSource(false); setMoving(false); }, [cardId]);

  if (!card) return null;
  const meta = TYPES[card.type] || TYPES.idea;
  const f = card.fields || {};
  const sample = card.sampleId ? SAMPLE_BY_ID[card.sampleId] : null;
  const checked = f.checked || [];

  const toggleIngredient = (i) => {
    Haptics.selectionAsync().catch(() => {});
    const next = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    updateCard(card.id, { fields: { ...f, checked: next } });
  };

  const drop = f.wasPrice && f.price ? Math.round((f.wasPrice - f.price) * 100) / 100 : null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: meta.bg }]}>
          <View style={styles.grabber} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={{ paddingHorizontal: 24 }}>
              <View style={styles.headRow}>
                <Text style={{ fontSize: 34 }}>{meta.emoji}</Text>
                <View style={[styles.nestTag, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                  <Text style={[styles.nestTagText, { color: meta.deep }]}>{meta.nest}</Text>
                </View>
              </View>
              <Text style={[type.h1, { fontSize: 26, marginTop: 10 }, card.done && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
                {card.title}
              </Text>
              {card.subtitle ? <Text style={[type.soft, { marginTop: 5 }]}>{card.subtitle}</Text> : null}

              {/* the facts */}
              <View style={styles.factCard}>
                {card.type === 'product' && (
                  <>
                    <FactRow emoji="💰" label="Price" value={f.priceRaw} deep={meta.deep} />
                    {drop > 0 && <FactRow emoji="📉" label="Price drop" value={`was £${f.wasPrice.toFixed(2)} — £${drop} off!`} deep={meta.deep} />}
                    {drop > 0 && (
                      <Text style={styles.watchNote}>
                        Live price tracking is a SnapNest Plus dream — this drop came with the screenshot.
                      </Text>
                    )}
                  </>
                )}
                {card.type === 'event' && (
                  <>
                    <FactRow emoji="📅" label="When" value={f.when ? `${prettyDate(f.when)}${f.whenHasTime ? ` · ${prettyTime(f.when)}` : ''} (${relativeDay(f.when)})` : null} deep={meta.deep} />
                    <FactRow emoji="📍" label="Where" value={f.venue} />
                    <FactRow emoji="🎫" label="Tickets" value={f.priceFrom ? `from ${f.priceFrom}` : null} />
                  </>
                )}
                {card.type === 'recipe' && (
                  <>
                    <FactRow emoji="⏲️" label="Time" value={f.minutes ? `${f.minutes} minutes` : null} />
                    <FactRow emoji="🍽" label="Serves" value={f.serves ? String(f.serves) : null} />
                    {(f.ingredients || []).length > 0 && (
                      <View style={{ marginTop: 6 }}>
                        <Text style={styles.factLabel}>Ingredients — tick as you shop</Text>
                        {f.ingredients.map((ing, i) => (
                          <Bouncy key={i} haptic={false} onPress={() => toggleIngredient(i)} style={styles.ingRow}>
                            <Text style={{ fontSize: 14 }}>{checked.includes(i) ? '✅' : '⬜️'}</Text>
                            <Text style={[styles.ingText, checked.includes(i) && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{ing}</Text>
                          </Bouncy>
                        ))}
                      </View>
                    )}
                  </>
                )}
                {card.type === 'job' && (
                  <>
                    <FactRow emoji="💷" label="Salary" value={f.salary} deep={meta.deep} />
                    <FactRow emoji="🗺" label="Where" value={[f.location, f.workStyle].filter(Boolean).join(' · ')} />
                    <FactRow emoji="⏳" label="Apply by" value={f.deadline ? `${prettyDate(f.deadline)} (${relativeDay(f.deadline)})` : null} deep={meta.deep} />
                  </>
                )}
                {card.type === 'message' && (
                  <>
                    <FactRow emoji="👤" label="From" value={f.from} />
                    {f.preview ? (
                      <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>“{f.preview}”</Text>
                      </View>
                    ) : null}
                  </>
                )}
                {card.type === 'travel' && (
                  <>
                    <FactRow emoji="🌙" label="Nights" value={f.nights ? String(f.nights) : null} />
                    <FactRow emoji="💰" label="Price" value={f.priceFrom ? `from ${f.priceFrom}` : null} deep={meta.deep} />
                    <FactRow emoji="📅" label="When" value={f.when ? prettyDate(f.when) : null} />
                  </>
                )}
                {card.type === 'place' && (
                  <>
                    <FactRow emoji="🗺" label="Address" value={f.address} />
                    <FactRow emoji="📮" label="Postcode" value={f.postcode} deep={meta.deep} />
                  </>
                )}
                {card.type === 'outfit' && (
                  <>
                    <FactRow emoji="🧵" label="Pieces" value={(f.pieces || []).join(', ')} />
                    <FactRow emoji="💰" label="Price" value={f.priceRaw} deep={meta.deep} />
                  </>
                )}
                {card.type === 'idea' && f.quote ? (
                  <View style={styles.bubble}>
                    <Text style={[styles.bubbleText, { fontStyle: 'italic' }]}>“{f.quote}”</Text>
                  </View>
                ) : null}

                {f.url ? (
                  <Bouncy haptic={false} onPress={() => Linking.openURL(f.url.startsWith('http') ? f.url : `https://${f.url}`).catch(() => {})} style={styles.linkRow}>
                    <Text style={{ fontSize: 14 }}>🔗</Text>
                    <Text style={[styles.linkText, { color: meta.deep }]} numberOfLines={1}>{f.url}</Text>
                  </Bouncy>
                ) : null}
              </View>

              {/* why chips */}
              {(card.why || []).length > 0 && (
                <View style={{ marginTop: 12, gap: 5 }}>
                  {card.why.map((w, i) => (
                    <Text key={i} style={styles.whyLine}>{w.emoji}  {w.text}</Text>
                  ))}
                </View>
              )}

              {/* actions */}
              <View style={{ marginTop: 18, gap: 9 }}>
                <Bouncy onPress={() => { toggleDone(card.id); }} style={[styles.mainAction, { backgroundColor: card.done ? 'rgba(255,255,255,0.7)' : palette.rose }]}>
                  <Text style={[styles.mainActionText, { color: card.done ? palette.ink : '#fff' }]}>
                    {card.done ? 'Bring it back' : DONE_LABELS[card.type] || 'Done ✓'}
                  </Text>
                </Bouncy>

                <View style={{ flexDirection: 'row', gap: 9 }}>
                  <Bouncy haptic={false} onPress={() => setMoving((m) => !m)} style={styles.smallAction}>
                    <Text style={styles.smallActionText}>🪺 Move</Text>
                  </Bouncy>
                  <Bouncy haptic={false} onPress={() => setShowSource((s) => !s)} style={styles.smallAction}>
                    <Text style={styles.smallActionText}>🖼 Source</Text>
                  </Bouncy>
                  <Bouncy
                    haptic={false}
                    onPress={() => {
                      if (!deleteArmed) { setDeleteArmed(true); return; }
                      deleteCard(card.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                      onClose();
                    }}
                    style={[styles.smallAction, deleteArmed && { backgroundColor: '#F7C6C6' }]}
                  >
                    <Text style={styles.smallActionText}>{deleteArmed ? 'Sure? 🗑' : '🗑 Delete'}</Text>
                  </Bouncy>
                </View>

                {moving && (
                  <View style={styles.moveWrap}>
                    <Bouncy haptic={false} onPress={() => { updateCard(card.id, { nestId: null }); setMoving(false); }} style={[styles.moveChip, !card.nestId && styles.moveChipOn]}>
                      <Text style={[styles.moveChipText, !card.nestId && { color: '#fff' }]}>{meta.emoji} {meta.nest}</Text>
                    </Bouncy>
                    {nests.map((n) => (
                      <Bouncy key={n.id} haptic={false} onPress={() => { updateCard(card.id, { nestId: n.id }); setMoving(false); }} style={[styles.moveChip, card.nestId === n.id && styles.moveChipOn]}>
                        <Text style={[styles.moveChipText, card.nestId === n.id && { color: '#fff' }]}>{n.emoji} {n.name}</Text>
                      </Bouncy>
                    ))}
                    {nests.length === 0 && (
                      <Text style={type.tiny}>No custom Nests yet — make one from the Nests tab 🪺</Text>
                    )}
                  </View>
                )}

                {showSource && (
                  <View style={styles.sourceBox}>
                    {sample ? (
                      <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <SampleShot sample={sample} width={110} />
                      </View>
                    ) : card.uri ? (
                      <Image source={{ uri: card.uri }} style={styles.sourceImg} resizeMode="cover" />
                    ) : null}
                    {card.sourceText ? <Text style={styles.sourceText}>{card.sourceText}</Text> : null}
                    <Text style={[type.tiny, { marginTop: 8 }]}>
                      🧹 Card safe — the original can leave your camera roll any time.
                    </Text>
                  </View>
                )}

                <Bouncy haptic={false} onPress={onClose} style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: palette.inkSoft, fontSize: 14.5, fontWeight: '600' }}>Close</Text>
                </Bouncy>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(52,40,66,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radii.big,
    borderTopRightRadius: radii.big,
    maxHeight: '90%',
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(70,59,85,0.18)', marginBottom: 14 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nestTag: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  nestTagText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  factCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: radii.card,
    padding: 16,
    gap: 10,
    ...softShadow,
    shadowOpacity: 0.05,
  },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  factLabel: { fontSize: 12.5, fontWeight: '800', color: palette.inkSoft, width: 74, textTransform: 'uppercase', letterSpacing: 0.3 },
  factValue: { flex: 1, fontSize: 15, fontWeight: '700', color: palette.ink },
  watchNote: { fontSize: 11.5, color: palette.inkSoft, fontStyle: 'italic' },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 5 },
  ingText: { fontSize: 14.5, color: palette.ink, flex: 1 },
  bubble: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 14, borderBottomLeftRadius: 4, padding: 12 },
  bubbleText: { fontSize: 14.5, color: palette.ink, lineHeight: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  linkText: { fontSize: 13.5, fontWeight: '700', flex: 1 },
  whyLine: { fontSize: 12.5, color: palette.inkSoft },
  mainAction: { borderRadius: radii.chip + 4, paddingVertical: 14, alignItems: 'center', ...softShadow, shadowOpacity: 0.15 },
  mainActionText: { fontSize: 16, fontWeight: '800' },
  smallAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radii.chip,
    paddingVertical: 11,
    alignItems: 'center',
  },
  smallActionText: { fontSize: 13.5, fontWeight: '800', color: palette.ink },
  moveWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: radii.chip, padding: 12 },
  moveChip: { backgroundColor: '#fff', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8 },
  moveChipOn: { backgroundColor: palette.rose },
  moveChipText: { fontSize: 13, fontWeight: '800', color: palette.ink },
  sourceBox: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: radii.chip, padding: 14 },
  sourceImg: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10, backgroundColor: palette.lavender },
  sourceText: { fontSize: 13, color: palette.inkSoft, lineHeight: 19 },
});
