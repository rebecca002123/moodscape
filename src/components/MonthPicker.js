// A small month-and-year picker built from chips — no native date picker
// needed, and a month is exactly as precise as a credit report gets anyway.

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// onPick receives a timestamp at the 15th of the chosen month — mid-month,
// so month arithmetic in the forecast never wobbles on the 31st.
export default function MonthPicker({ onPick, yearsBack = 7 }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const minYear = now.getFullYear() - yearsBack;

  const isFuture = (m) => year === now.getFullYear() && m > now.getMonth();

  return (
    <View style={styles.wrap}>
      <View style={styles.yearRow}>
        <Pressable
          onPress={() => setYear((y) => Math.max(minYear, y - 1))}
          style={[styles.arrow, year <= minYear && styles.arrowOff]}
          disabled={year <= minYear}
          accessibilityRole="button"
        >
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <Text style={styles.year}>{year}</Text>
        <Pressable
          onPress={() => setYear((y) => Math.min(now.getFullYear(), y + 1))}
          style={[styles.arrow, year >= now.getFullYear() && styles.arrowOff]}
          disabled={year >= now.getFullYear()}
          accessibilityRole="button"
        >
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {MONTHS.map((m, i) => (
          <Pressable
            key={m}
            onPress={() => onPick(Math.min(new Date(year, i, 15, 12).getTime(), Date.now()))}
            style={[styles.month, isFuture(i) && styles.monthOff]}
            disabled={isFuture(i)}
            accessibilityRole="button"
          >
            <Text style={[styles.monthText, isFuture(i) && styles.monthTextOff]}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 10,
  },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 8 },
  arrow: { paddingHorizontal: 14, paddingVertical: 4 },
  arrowOff: { opacity: 0.25 },
  arrowText: { color: '#5fd0c7', fontSize: 20, fontWeight: '700' },
  year: { color: '#eaf4f6', fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  month: {
    width: '22%',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  monthOff: { opacity: 0.3 },
  monthText: { color: 'rgba(234,244,246,0.85)', fontSize: 13, fontWeight: '600' },
  monthTextOff: { color: 'rgba(234,244,246,0.4)' },
});
