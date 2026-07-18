import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HearthProvider } from './src/state/HearthStore';
import HearthScreen from './src/screens/HearthScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <HearthProvider>
        <StatusBar hidden />
        <HearthScreen />
      </HearthProvider>
    </SafeAreaProvider>
  );
}
