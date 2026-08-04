// The floating ＋ — a warm rose button that drifts above everything,
// always ready to catch the next screenshot.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { palette, softShadow } from '../theme';
import { useNest } from '../state/NestStore';
import Bouncy from './Bouncy';

export default function FloatingAdd({ onPress, bottom = 96 }) {
  const { reduceMotion } = useNest();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <Animated.View style={[styles.wrap, { bottom, transform: [{ translateY }] }]} pointerEvents="box-none">
      <Bouncy onPress={onPress} style={styles.btn} accessibilityLabel="Add a screenshot">
        <Text style={styles.plus}>＋</Text>
      </Bouncy>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 20 },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.rose,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
    shadowOpacity: 0.25,
  },
  plus: { color: '#fff', fontSize: 30, fontWeight: '700', marginTop: -2 },
});
