// The fire itself. Logs and hearth stones are always there — the stones
// multiply as your day streak grows. The flame only lives while you focus.

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';

function Spark({ delay, x, burning, reduceMotion }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!burning || reduceMotion) {
      t.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, burning, delay, reduceMotion]);

  if (!burning) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        bottom: 70,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ffcf7d',
        opacity: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, -4] }) },
        ],
      }}
    />
  );
}

export default function Campfire({ burning, streak, reduceMotion }) {
  const flicker = useRef(new Animated.Value(1)).current;
  const presence = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(presence, {
      toValue: burning ? 1 : 0,
      duration: burning ? 900 : 1600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [burning, presence]);

  useEffect(() => {
    if (!burning || reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 0.92,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 1.05,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 1,
          duration: 240,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [burning, flicker, reduceMotion]);

  const stones = Math.min(2 + streak, 10);

  return (
    <View style={{ width: 240, height: 220, alignItems: 'center' }}>
      {/* The flame — three tongues of fire, scaling from the base. */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 58,
          opacity: presence,
          transform: [{ scaleY: flicker }, { scaleX: flicker.interpolate({ inputRange: [0.9, 1.1], outputRange: [1.06, 0.96] }) }],
        }}
      >
        <Svg width={120} height={130} viewBox="0 0 120 130">
          <Path
            d="M60 6 C78 40 100 56 96 88 C93 114 78 126 60 126 C42 126 27 114 24 88 C20 56 42 40 60 6 Z"
            fill="#ff8c3b"
            opacity={0.85}
          />
          <Path
            d="M60 34 C71 56 85 66 82 90 C80 108 71 118 60 118 C49 118 40 108 38 90 C35 66 49 56 60 34 Z"
            fill="#ffb85c"
          />
          <Path
            d="M60 62 C66 74 73 80 71 94 C70 106 65 112 60 112 C55 112 50 106 49 94 C47 80 54 74 60 62 Z"
            fill="#ffe9a8"
          />
        </Svg>
      </Animated.View>

      {[0, 1, 2, 3, 4].map((i) => (
        <Spark
          key={i}
          delay={i * 420}
          x={108 + (i % 3) * 12}
          burning={burning}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* Logs, embers, and the stone ring that grows with your streak. */}
      <Svg width={240} height={90} style={{ position: 'absolute', bottom: 0 }}>
        <Ellipse cx={120} cy={72} rx={86} ry={14} fill="#000000" opacity={0.35} />
        <Rect x={62} y={44} width={116} height={16} rx={8} fill="#5b3a24" transform="rotate(12 120 52)" />
        <Rect x={62} y={44} width={116} height={16} rx={8} fill="#6b452b" transform="rotate(-12 120 52)" />
        <Circle cx={112} cy={56} r={5} fill={burning ? '#ff9d4d' : '#b0542a'} opacity={0.9} />
        <Circle cx={128} cy={60} r={4} fill={burning ? '#ffcf7d' : '#8a4020'} opacity={0.9} />
        {Array.from({ length: stones }, (_, i) => {
          const angle = Math.PI * (0.08 + (i / Math.max(stones - 1, 1)) * 0.84);
          const cx = 120 + Math.cos(angle) * 92;
          const cy = 74 - Math.sin(angle) * 16;
          return <Circle key={i} cx={cx} cy={cy} r={9} fill="#3a4254" />;
        })}
      </Svg>
    </View>
  );
}
