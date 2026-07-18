import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface, Txt } from './Glass';
import { useTheme, radius as R } from '../theme/theme';
import { select } from '../utils/haptics';

function Icon({ name, color, size = 23 }) {
  const p = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' };
  const s = size;
  switch (name) {
    case 'today':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="4.4" {...p} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r1 = 7.6; const r2 = 9.8;
            const rad = (a * Math.PI) / 180;
            return (
              <Line
                key={a}
                x1={12 + r1 * Math.cos(rad)} y1={12 + r1 * Math.sin(rad)}
                x2={12 + r2 * Math.cos(rad)} y2={12 + r2 * Math.sin(rad)}
                {...p}
              />
            );
          })}
        </Svg>
      );
    case 'journal':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="4" y="3.5" width="16" height="17" rx="3.4" {...p} />
          <Line x1="8" y1="9" x2="16" y2="9" {...p} />
          <Line x1="8" y1="13" x2="16" y2="13" {...p} />
          <Line x1="8" y1="17" x2="12.5" y2="17" {...p} />
        </Svg>
      );
    case 'insights':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M3.5 16.5 L9 10.5 L13 13.5 L20.5 5.5" {...p} />
          <Circle cx="9" cy="10.5" r="1.5" fill={color} stroke="none" />
          <Circle cx="13" cy="13.5" r="1.5" fill={color} stroke="none" />
          <Line x1="3.5" y1="20.5" x2="20.5" y2="20.5" {...p} opacity={0.5} />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Line x1="4" y1="7" x2="20" y2="7" {...p} />
          <Circle cx="9.5" cy="7" r="2.3" {...p} fill="none" />
          <Line x1="4" y1="16.5" x2="20" y2="16.5" {...p} />
          <Circle cx="15" cy="16.5" r="2.3" {...p} fill="none" />
        </Svg>
      );
    default:
      return null;
  }
}

export const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'journal', label: 'Journal' },
  { key: 'insights', label: 'Insights' },
  { key: 'settings', label: 'Settings' },
];

export default function TabBar({ active, onChange }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const index = TABS.findIndex((tab) => tab.key === active);
  const x = useSharedValue(0);
  const segW = width / TABS.length || 0;

  useEffect(() => {
    x.value = withSpring(index * segW, { damping: 17, stiffness: 210 });
  }, [index, segW, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute', left: 20, right: 20,
        bottom: Math.max(insets.bottom, 12) + 6,
      }}
    >
      <GlassSurface radius={R.capsule} strong innerStyle={{ padding: 5 }}>
        <View
          style={{ flexDirection: 'row' }}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          {width > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                pill,
                {
                  position: 'absolute', top: 0, bottom: 0, width: segW,
                  borderRadius: R.capsule,
                  backgroundColor: t.scheme === 'dark'
                    ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.85)',
                  borderWidth: 1, borderColor: t.glass.specular,
                },
              ]}
            />
          )}
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const color = isActive ? t.text : t.textTertiary;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                onPress={() => { if (!isActive) { select(); onChange(tab.key); } }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 }}
              >
                <Icon name={tab.key} color={color} />
                <Txt v="caption" c={color}>{tab.label}</Txt>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}
