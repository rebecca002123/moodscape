// The moment of magic: a soft rose beam sweeps the screenshot while the
// Nest Brain reads it. Corner brackets, drifting sparkles, no lasers harmed.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNest } from '../state/NestStore';

const SPARKLES = [
  { left: '12%', top: '22%', delay: 0, glyph: '✦' },
  { left: '78%', top: '38%', delay: 350, glyph: '✧' },
  { left: '30%', top: '68%', delay: 700, glyph: '✦' },
  { left: '64%', top: '82%', delay: 175, glyph: '·' },
];

function Sparkle({ conf, reduceMotion }) {
  const twinkle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) { twinkle.setValue(0.6); return undefined; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(conf.delay),
        Animated.timing(twinkle, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [conf.delay, reduceMotion, twinkle]);
  return (
    <Animated.Text
      style={{
        position: 'absolute', left: conf.left, top: conf.top,
        opacity: twinkle, color: '#fff', fontSize: 16,
        transform: [{ scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
      }}
    >
      {conf.glyph}
    </Animated.Text>
  );
}

export default function ScanBeam({ height = 300 }) {
  const { reduceMotion } = useNest();
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) { sweep.setValue(0.5); return undefined; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sweep]);

  const translateY = sweep.interpolate({ inputRange: [0, 1], outputRange: [0, height - 46] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={{ transform: [{ translateY }] }}>
        <LinearGradient
          colors={['rgba(228,87,126,0)', 'rgba(228,87,126,0.5)', 'rgba(228,87,126,0)']}
          style={{ height: 46 }}
        />
        <View style={styles.beamLine} />
      </Animated.View>
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} conf={s} reduceMotion={reduceMotion} />
      ))}
      {/* corner brackets */}
      <View style={[styles.corner, { top: 6, left: 6, borderTopWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[styles.corner, { top: 6, right: 6, borderTopWidth: 3, borderRightWidth: 3 }]} />
      <View style={[styles.corner, { bottom: 6, left: 6, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[styles.corner, { bottom: 6, right: 6, borderBottomWidth: 3, borderRightWidth: 3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  beamLine: { height: 2, marginTop: -24, backgroundColor: 'rgba(255,255,255,0.85)', marginHorizontal: 10, borderRadius: 1 },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: 'rgba(228,87,126,0.85)', borderRadius: 4 },
});
