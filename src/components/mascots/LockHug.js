// The privacy mascot: a tiny padlock giving a photo the world's
// most reassuring hug. Your screenshots stay yours — it insists.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { useNest } from '../../state/NestStore';

export default function LockHug({ width = 200, style }) {
  const { reduceMotion } = useNest();
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 2100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sway]);

  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });
  const height = width * 0.8;

  return (
    <Animated.View style={[style, { width, height, transform: [{ rotate }] }]}>
      <Svg width={width} height={height} viewBox="0 0 200 160">
        {/* the photo being hugged */}
        <G transform="rotate(-7 78 84)">
          <Rect x="42" y="42" width="74" height="86" rx="7" fill="#FFFFFF" />
          <Rect x="49" y="49" width="60" height="58" rx="4" fill="#CDE4FF" />
          <Circle cx="66" cy="66" r="7" fill="#FFC94D" />
          <Path d="M49 100 l16 -14 12 10 14 -13 18 17 v0 H49 Z" fill="#A8D8B9" />
          <Path d="M86 88 c-3 -5 3 -9 6 -5 c3 -4 9 0 6 5 c-2 3 -6 5 -6 5 s-4 -2 -6 -5 Z" fill="#FF9FBE" />
        </G>

        {/* the lock */}
        <G>
          {/* shackle */}
          <Path d="M128 62 v-10 a20 20 0 0 1 40 0 v10" stroke="#A78FD8" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* body */}
          <Rect x="116" y="60" width="64" height="54" rx="15" fill="#C9B6F0" />
          {/* arms — one wrapped around the photo */}
          <Path d="M120 78 Q92 66 78 78" stroke="#C9B6F0" strokeWidth="10" strokeLinecap="round" fill="none" />
          <Path d="M176 82 Q188 92 178 104" stroke="#C9B6F0" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* face */}
          <Circle cx="138" cy="82" r="4.4" fill="#4A3B55" />
          <Circle cx="139.5" cy="80.6" r="1.4" fill="#fff" />
          <Circle cx="160" cy="82" r="4.4" fill="#4A3B55" />
          <Circle cx="161.5" cy="80.6" r="1.4" fill="#fff" />
          <Path d="M143 93 q6 6 12 0" stroke="#4A3B55" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Circle cx="128" cy="90" r="4.2" fill="#E9A8C9" opacity="0.75" />
          <Circle cx="170" cy="90" r="4.2" fill="#E9A8C9" opacity="0.75" />
          {/* keyhole, tiny and polite */}
          <Circle cx="149" cy="104" r="3" fill="#A78FD8" />
        </G>

        {/* floating heart */}
        <Path d="M100 22 c-4 -7 5 -12 8 -6 c3 -6 12 -1 8 6 c-3 4 -8 7 -8 7 s-5 -3 -8 -7 Z" fill="#FF9FBE" />
        <Circle cx="30" cy="52" r="3" fill="#C9E5FF" />
        <Path d="M178 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#FFD8A8" />
      </Svg>
    </Animated.View>
  );
}
