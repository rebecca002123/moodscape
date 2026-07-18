import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Backdrop from './components/Backdrop';
import TabBar from './components/TabBar';
import HabitEditor from './components/HabitEditor';
import TodayScreen from './screens/TodayScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme } from './theme/theme';

// All screens stay mounted; the active one fades and floats in. Lighter
// than a navigation library, and scroll positions survive tab hops.
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
  const [editor, setEditor] = useState({ open: false, habit: null });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Backdrop />
      <Pane active={tab === 'today'}>
        <TodayScreen
          topInset={insets.top}
          onEditHabit={(habit) => setEditor({ open: true, habit })}
        />
      </Pane>
      <Pane active={tab === 'stats'}>
        <StatsScreen topInset={insets.top} />
      </Pane>
      <Pane active={tab === 'settings'}>
        <SettingsScreen topInset={insets.top} />
      </Pane>
      <TabBar
        active={tab}
        onChange={setTab}
        onAdd={() => setEditor({ open: true, habit: null })}
      />
      <HabitEditor
        visible={editor.open}
        habit={editor.habit}
        onClose={() => setEditor({ open: false, habit: null })}
      />
    </View>
  );
}
