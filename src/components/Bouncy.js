// Every tappable thing in SnapNest gives a tiny, happy bounce.
// One wrapper so the whole app agrees on how gentle "gentle" is.

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNest } from '../state/NestStore';

export default function Bouncy({
  onPress,
  onLongPress,
  style,
  children,
  disabled = false,
  haptic = true,
  scaleTo = 0.94,
  accessibilityRole = 'button',
  accessibilityLabel,
}) {
  const { reduceMotion } = useNest();
  const scale = useRef(new Animated.Value(1)).current;

  const to = (v, springy) => {
    if (reduceMotion) { scale.setValue(1); return; }
    (springy
      ? Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 12 })
      : Animated.timing(scale, { toValue: v, duration: 90, useNativeDriver: true })
    ).start();
  };

  return (
    <Pressable
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      onPressIn={() => to(scaleTo, false)}
      onPressOut={() => to(1, true)}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.45 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
