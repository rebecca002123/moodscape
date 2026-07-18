import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuroraBackground from './components/AuroraBackground';
import TabBar from './components/TabBar';
import TodayScreen from './screens/TodayScreen';
import JournalScreen from './screens/JournalScreen';
import InsightsScreen from './screens/InsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme } from './theme/theme';

// All four screens stay mounted; the active one fades and floats in.
// Lighter than a navigation library and it keeps scroll positions alive.
function Pane({ active, children }) {
  const v = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(active ? 1 : 0, { duration: 260 });
  }, [active, v]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 14 }, { scale: 0.985 + v.value * 0.015 }],
  }));
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents={active ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
}

export default function AppShell() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('today');
  const [accent, setAccent] = useState(null);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <AuroraBackground accent={tab === 'today' ? accent : null} />
      <Pane active={tab === 'today'}>
        <TodayScreen topInset={insets.top} onAccent={setAccent} />
      </Pane>
      <Pane active={tab === 'journal'}>
        <JournalScreen topInset={insets.top} />
      </Pane>
      <Pane active={tab === 'insights'}>
        <InsightsScreen topInset={insets.top} />
      </Pane>
      <Pane active={tab === 'settings'}>
        <SettingsScreen topInset={insets.top} />
      </Pane>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}
