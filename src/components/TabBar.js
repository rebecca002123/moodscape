import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassSurface, Txt } from './Glass';
import Icon from './icons';
import { useTheme, radius as R, SPECTRUM } from '../theme/theme';
import { select, thud } from '../utils/haptics';

export const TABS = [
  { key: 'today', label: 'Today', icon: 'tab-today' },
  { key: 'stats', label: 'Stats', icon: 'tab-stats' },
  { key: 'settings', label: 'Settings', icon: 'tab-settings' },
];

// Floating glass capsule with a sliding liquid pill, plus a spectrum-ringed
// "+" button riding alongside it.
export default function TabBar({ active, onChange, onAdd }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const index = TABS.findIndex((tab) => tab.key === active);
  const x = useSharedValue(0);
  const addScale = useSharedValue(1);
  const segW = width / TABS.length || 0;

  useEffect(() => {
    x.value = withSpring(index * segW, { damping: 17, stiffness: 210 });
  }, [index, segW, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute', left: 20, right: 20,
        bottom: Math.max(insets.bottom, 12) + 6,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
    >
      <GlassSurface radius={R.capsule} strong style={{ flex: 1 }} innerStyle={{ padding: 5 }}>
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
                    ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)',
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
                <Icon name={tab.icon} color={color} />
                <Txt v="caption" c={color}>{tab.label}</Txt>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New habit"
        onPress={() => { thud(); onAdd(); }}
        onPressIn={() => { addScale.value = withSpring(0.9, { damping: 16, stiffness: 400 }); }}
        onPressOut={() => { addScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
      >
        <Animated.View style={addStyle}>
          <LinearGradient
            colors={SPECTRUM}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 58, height: 58, borderRadius: 29, padding: 1.5,
              shadowColor: '#818CF8', shadowOpacity: 0.55, shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 }, elevation: 10,
            }}
          >
            <GlassSurface
              radius={28} strong shadow={false}
              style={{ flex: 1 }}
              innerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 55 }}
            >
              <Icon name="plus" color={t.text} size={26} />
            </GlassSurface>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}
