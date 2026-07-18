import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MemoryProvider } from './src/state/MemoryStore';
import WorldScreen from './src/screens/WorldScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MemoryProvider>
          <StatusBar hidden />
          <WorldScreen />
        </MemoryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
