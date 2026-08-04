// Draws a bundled sample screenshot to look like the real thing —
// tiny status bar, app chrome, buttons and bubbles — entirely procedural,
// so the demo needs no image files and stays crisp at any size.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SampleShot({ sample, width = 170, style }) {
  const u = width / 170;
  const mini = width <= 84;
  const ink = sample.inkOnTint;

  if (mini) {
    return (
      <View style={[styles.shot, { width, aspectRatio: 0.62, backgroundColor: sample.tint, borderRadius: 10 }, style]}>
        <View style={styles.miniCenter}>
          <Text style={{ fontSize: width * 0.34 }}>{sample.emoji}</Text>
        </View>
        <View style={{ paddingHorizontal: width * 0.14, gap: width * 0.06, marginBottom: width * 0.14 }}>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: ink, opacity: 0.35 }} />
          <View style={{ height: 3, borderRadius: 2, backgroundColor: ink, opacity: 0.2, width: '70%' }} />
        </View>
      </View>
    );
  }

  const renderRow = (row, i) => {
    switch (row.k) {
      case 'chrome':
        return (
          <View key={i} style={styles.chromeRow}>
            <Text style={{ fontSize: 7.5 * u, fontWeight: '700', color: ink, opacity: 0.55 }}>9:41</Text>
            <View style={{ flexDirection: 'row', gap: 3 * u, alignItems: 'center' }}>
              <View style={{ width: 5 * u, height: 5 * u, borderRadius: 3 * u, backgroundColor: ink, opacity: 0.35 }} />
              <View style={{ width: 12 * u, height: 5.5 * u, borderRadius: 2 * u, backgroundColor: ink, opacity: 0.35 }} />
            </View>
          </View>
        );
      case 'img':
        return (
          <View key={i} style={{ height: row.h * u, borderRadius: 10 * u, backgroundColor: sample.paper, alignItems: 'center', justifyContent: 'center', opacity: 0.96 }}>
            <Text style={{ fontSize: row.h * u * 0.5 }}>{row.label}</Text>
          </View>
        );
      case 'title':
        return (
          <Text key={i} numberOfLines={1} style={{ fontSize: 11.5 * u, fontWeight: '800', color: ink }}>
            {row.text}
          </Text>
        );
      case 'line':
        return (
          <Text key={i} numberOfLines={1} style={{ fontSize: 8.5 * u, color: ink, opacity: 0.68 }}>
            {row.text}
          </Text>
        );
      case 'tag':
        return (
          <View key={i} style={{ alignSelf: 'flex-start', backgroundColor: sample.paper, borderRadius: 7 * u, paddingHorizontal: 6 * u, paddingVertical: 2.5 * u }}>
            <Text style={{ fontSize: 8 * u, fontWeight: '700', color: sample.accent }}>{row.text}</Text>
          </View>
        );
      case 'price':
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 * u }}>
            <Text style={{ fontSize: 13 * u, fontWeight: '800', color: sample.accent }}>{row.text}</Text>
            {row.was ? (
              <Text style={{ fontSize: 8.5 * u, color: ink, opacity: 0.5, textDecorationLine: 'line-through' }}>{row.was}</Text>
            ) : null}
          </View>
        );
      case 'btn':
        return (
          <View key={i} style={{ backgroundColor: sample.accent, borderRadius: 9 * u, paddingVertical: 5.5 * u, alignItems: 'center' }}>
            <Text style={{ fontSize: 8.5 * u, fontWeight: '800', color: '#fff' }}>{row.text}</Text>
          </View>
        );
      case 'bubble':
        return (
          <View
            key={i}
            style={{
              alignSelf: row.mine ? 'flex-end' : 'flex-start',
              maxWidth: '86%',
              backgroundColor: row.mine ? sample.accent : sample.paper,
              borderRadius: 9 * u,
              borderBottomLeftRadius: row.mine ? 9 * u : 3 * u,
              borderBottomRightRadius: row.mine ? 3 * u : 9 * u,
              paddingHorizontal: 6.5 * u,
              paddingVertical: 4 * u,
            }}
          >
            <Text style={{ fontSize: 8.5 * u, color: row.mine ? '#fff' : ink }}>{row.text}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.shot, { width, aspectRatio: 0.62, backgroundColor: sample.tint, borderRadius: 14 * u, padding: 9 * u, gap: 6 * u }, style]}>
      {sample.layout.map(renderRow)}
    </View>
  );
}

const styles = StyleSheet.create({
  shot: { overflow: 'hidden' },
  miniCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chromeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
