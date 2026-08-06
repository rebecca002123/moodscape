// The route ahead: dated waypoints the calendar will hand you on its own,
// then the levers — gains that wait on a choice instead of a date.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDelta, formatMonthShort } from '../utils/scoreMath';

function DateChip({ ts }) {
  const d = new Date(ts);
  return (
    <View style={styles.dateChip}>
      <Text style={styles.dateMonth}>{formatMonthShort(ts)}</Text>
      <Text style={styles.dateYear}>’{String(d.getFullYear()).slice(2)}</Text>
    </View>
  );
}

export default function WaypointList({ waypoints, levers }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>The route ahead</Text>
      {waypoints.length === 0 ? (
        <Text style={styles.empty}>
          No dated waypoints yet. Add hard inquiries, new accounts, or late marks in
          “What my report knows” and the calendar’s built-in gains appear here.
        </Text>
      ) : (
        waypoints.map((w) => (
          <View key={w.id} style={styles.row}>
            <DateChip ts={w.ts} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{w.title}</Text>
              <Text style={styles.rowDetail}>{w.detail}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatDelta(w.deltaLo, w.deltaHi)}</Text>
            </View>
          </View>
        ))
      )}

      {levers.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Paths you could take</Text>
          {levers.map((l) => (
            <View key={l.id} style={[styles.row, styles.leverRow]}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{l.title}</Text>
                <Text style={styles.rowDetail}>{l.detail}</Text>
              </View>
              {l.deltaLo != null && (
                <View style={[styles.badge, styles.leverBadge]}>
                  <Text style={[styles.badgeText, { color: '#f2d06b' }]}>{formatDelta(l.deltaLo, l.deltaHi)}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'rgba(220,238,242,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: { color: 'rgba(220,238,242,0.55)', fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14,22,40,0.72)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,214,164,0.14)',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  leverRow: { borderStyle: 'dashed', borderColor: 'rgba(242,208,107,0.3)' },
  dateChip: {
    width: 44,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingVertical: 6,
  },
  dateMonth: { color: '#7fd6a4', fontSize: 13, fontWeight: '800' },
  dateYear: { color: 'rgba(220,238,242,0.4)', fontSize: 10, marginTop: 1 },
  rowBody: { flex: 1 },
  rowTitle: { color: '#eaf4f6', fontSize: 14, fontWeight: '700' },
  rowDetail: { color: 'rgba(220,238,242,0.55)', fontSize: 12, lineHeight: 17, marginTop: 2 },
  badge: {
    backgroundColor: 'rgba(127,214,164,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  leverBadge: { backgroundColor: 'rgba(242,208,107,0.1)' },
  badgeText: { color: '#7fd6a4', fontSize: 12.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
