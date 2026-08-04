// The welcome mascot: a smiling little camera, sat in a fluffy cloud,
// very pleased that your screenshots are finally getting looked after.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { useNest } from '../../state/NestStore';

export default function CameraBuddy({ width = 230, style }) {
  const { reduceMotion } = useNest();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 2300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const height = width * 0.72;

  return (
    <Animated.View style={[style, { width, height, transform: [{ translateY }] }]}>
      <Svg width={width} height={height} viewBox="0 0 230 166">
        {/* the cloud */}
        <G>
          <Ellipse cx="115" cy="132" rx="86" ry="26" fill="#FFFFFF" />
          <Circle cx="52" cy="122" r="26" fill="#FFFFFF" />
          <Circle cx="178" cy="122" r="26" fill="#FFFFFF" />
          <Circle cx="90" cy="112" r="30" fill="#FFFFFF" />
          <Circle cx="145" cy="112" r="30" fill="#FFFFFF" />
          <Ellipse cx="115" cy="138" rx="86" ry="20" fill="#F3EBFB" opacity="0.7" />
        </G>

        {/* the camera */}
        <G>
          {/* viewfinder bump */}
          <Rect x="88" y="26" width="34" height="18" rx="8" fill="#FFC3D8" />
          {/* body */}
          <Rect x="60" y="36" width="110" height="76" rx="20" fill="#FFD9E6" />
          {/* flash */}
          <Circle cx="152" cy="52" r="5" fill="#FFC94D" />
          {/* lens */}
          <Circle cx="115" cy="74" r="24" fill="#FFFFFF" />
          <Circle cx="115" cy="74" r="18" fill="#BCDFFF" />
          <Circle cx="115" cy="74" r="9" fill="#8FC4F5" />
          <Path d="M105 66 a13 13 0 0 1 8 -5" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" fill="none" />
          {/* face */}
          <Circle cx="82" cy="66" r="4.6" fill="#4A3B55" />
          <Circle cx="83.6" cy="64.4" r="1.5" fill="#fff" />
          <Circle cx="148" cy="66" r="4.6" fill="#4A3B55" />
          <Circle cx="149.6" cy="64.4" r="1.5" fill="#fff" />
          <Path d="M76 82 q6 6 12 0" stroke="#4A3B55" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M142 82 q6 6 12 0" stroke="#4A3B55" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* blush */}
          <Circle cx="72" cy="76" r="4.6" fill="#FFAFC6" opacity="0.7" />
          <Circle cx="158" cy="76" r="4.6" fill="#FFAFC6" opacity="0.7" />
        </G>

        {/* sparkles */}
        <Path d="M36 44 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#FFD8A8" />
        <Path d="M196 32 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z" fill="#C9E5FF" />
        <Circle cx="205" cy="78" r="3.4" fill="#FFC3D8" />
      </Svg>
    </Animated.View>
  );
}
