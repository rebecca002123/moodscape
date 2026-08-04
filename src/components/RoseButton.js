// The one warm rose button — primary actions everywhere wear this.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { palette, radii, softShadow } from '../theme';
import Bouncy from './Bouncy';

export default function RoseButton({ label, onPress, disabled, ghost = false, style }) {
  return (
    <Bouncy
      onPress={onPress}
      disabled={disabled}
      style={[ghost ? styles.ghost : styles.solid, style]}
      accessibilityLabel={label}
    >
      <Text style={ghost ? styles.ghostText : styles.solidText}>{label}</Text>
    </Bouncy>
  );
}

const styles = StyleSheet.create({
  solid: {
    backgroundColor: palette.rose,
    borderRadius: radii.chip + 6,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
    ...softShadow,
    shadowOpacity: 0.22,
  },
  solidText: { color: '#fff', fontSize: 16.5, fontWeight: '800', letterSpacing: 0.2 },
  ghost: { paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center' },
  ghostText: { color: palette.inkSoft, fontSize: 14.5, fontWeight: '600' },
});
