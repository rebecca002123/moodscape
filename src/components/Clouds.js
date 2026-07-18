// Soft glass clouds drifting forever, at three depths of sky.

import React, { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { makeRng } from '../utils/rng';

const { width: W, height: H } = Dimensions.get('window');

function Cloud({ seed, top, scale, duration, opacity, reverse }) {
  const prog = useSharedValue(reverse ? 1 : 0);
  useEffect(() => {
    prog.value = withRepeat(
      withTiming(reverse ? 0 : 1, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(prog.value, [0, 1], [-280, W + 280]) },
      { scale },
    ],
    opacity,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top }, style]}>
      <Svg width={240} height={100}>
        <Ellipse cx={120} cy={62} rx={78} ry={24} fill="#ffffff" opacity={0.75} />
        <Ellipse cx={76} cy={68} rx={48} ry={17} fill="#ffffff" opacity={0.55} />
        <Ellipse cx={164} cy={70} rx={52} ry={16} fill="#ffffff" opacity={0.55} />
        <Ellipse cx={118} cy={52} rx={54} ry={15} fill="#ffffff" opacity={0.9} />
      </Svg>
    </Animated.View>
  );
}

export default function Clouds({ night, reduceMotion }) {
  const clouds = useMemo(() => {
    const rng = makeRng('moodscape-clouds');
    return Array.from({ length: 6 }, (_, i) => ({
      key: i,
      top: rng.range(H * 0.04, H * 0.5),
      scale: rng.range(0.5, 1.25),
      duration: rng.int(95000, 170000),
      reverse: rng.chance(0.3),
    }));
  }, []);

  const baseOpacity = 0.62 - night * 0.3;

  if (reduceMotion) {
    return (
      <>
        {clouds.slice(0, 4).map((c) => (
          <Animated.View
            key={c.key}
            style={{
              position: 'absolute',
              top: c.top,
              left: (c.key * W) / 4,
              opacity: baseOpacity,
              transform: [{ scale: c.scale }],
            }}
          >
            <Svg width={240} height={100}>
              <Ellipse cx={120} cy={62} rx={78} ry={24} fill="#ffffff" opacity={0.75} />
              <Ellipse cx={118} cy={52} rx={54} ry={15} fill="#ffffff" opacity={0.9} />
            </Svg>
          </Animated.View>
        ))}
      </>
    );
  }

  return (
    <>
      {clouds.map((c, i) => (
        <Cloud key={c.key} {...c} opacity={baseOpacity - i * 0.04} />
      ))}
    </>
  );
}
