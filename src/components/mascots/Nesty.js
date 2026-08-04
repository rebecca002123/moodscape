// Nesty 🐦 — the little round bird who looks after your screenshots.
// She bobs gently while she waits, and sits in her nest when everything
// is tidy. Drawn fresh in SVG so she's crisp at any size.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { useNest } from '../../state/NestStore';

export default function Nesty({ size = 96, mood = 'happy', inNest = true, style }) {
  const { reduceMotion } = useNest();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.03] });
  const sleepy = mood === 'sleepy';

  return (
    <Animated.View style={[style, { width: size, height: size, transform: [{ translateY }] }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* the bird */}
        <G>
          {/* tail feather */}
          <Ellipse cx="88" cy="62" rx="12" ry="6" fill="#FFCBAE" transform="rotate(-24 88 62)" />
          {/* body */}
          <Circle cx="60" cy="60" r="32" fill="#FFE1CF" />
          {/* belly */}
          <Ellipse cx="60" cy="72" rx="19" ry="14" fill="#FFF6EE" />
          {/* wings */}
          <Ellipse cx="33" cy="64" rx="9" ry="14" fill="#FFCBAE" transform="rotate(14 33 64)" />
          <Ellipse cx="87" cy="64" rx="9" ry="14" fill="#FFCBAE" transform="rotate(-14 87 64)" />
          {/* head tuft */}
          <Path d="M54 30 Q57 20 62 28 Q64 19 69 27" stroke="#FFB98F" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          {/* eyes */}
          {sleepy ? (
            <>
              <Path d="M45 52 q5 4 10 0" stroke="#4A3B55" strokeWidth="3" strokeLinecap="round" fill="none" />
              <Path d="M65 52 q5 4 10 0" stroke="#4A3B55" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <Circle cx="50" cy="52" r="5.2" fill="#4A3B55" />
              <Circle cx="70" cy="52" r="5.2" fill="#4A3B55" />
              <Circle cx="51.8" cy="50.2" r="1.7" fill="#fff" />
              <Circle cx="71.8" cy="50.2" r="1.7" fill="#fff" />
            </>
          )}
          {/* blush */}
          <Circle cx="42" cy="61" r="4.4" fill="#FFB3C7" opacity="0.65" />
          <Circle cx="78" cy="61" r="4.4" fill="#FFB3C7" opacity="0.65" />
          {/* beak */}
          <Path d="M56 58 L64 58 L60 64 Z" fill="#FFB25E" />
        </G>

        {inNest && (
          <G>
            <Ellipse cx="60" cy="95" rx="36" ry="14" fill="#EBD3AE" />
            <Path d="M26 93 Q60 106 94 93" stroke="#D9B98B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Path d="M31 98 Q60 109 89 98" stroke="#CFAC7C" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            <Path d="M38 103 Q60 111 82 103" stroke="#C4A06E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}
