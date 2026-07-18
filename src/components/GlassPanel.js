// Liquid Glass primitives — frosted panels and buttons that float above the sky.

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function GlassPanel({ children, style, intensity = 30, tint = 'light', radius = 28 }) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        styles.panel,
        { borderRadius: radius },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

export function GlassButton({ label, emoji, onPress, style, textStyle, haptic = true, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      <GlassPanel intensity={38} radius={22} style={[styles.button, style]}>
        <Text style={[styles.buttonText, textStyle]}>{emoji ? `${emoji} ` : ''}{label}</Text>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,20,0.25)',
    textShadowRadius: 4,
  },
});
