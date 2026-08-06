import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ScoreProvider } from './src/state/ScoreStore';
import SummitScreen from './src/screens/SummitScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <ScoreProvider>
        <StatusBar style="light" />
        <SummitScreen />
      </ScoreProvider>
    </SafeAreaProvider>
  );
}
