import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NestProvider, useNest } from './src/state/NestStore';
import { palette } from './src/theme';
import Onboarding from './src/screens/Onboarding';
import MainShell from './src/screens/MainShell';

function Root() {
  const { loaded, settings } = useNest();
  if (!loaded) return <View style={{ flex: 1, backgroundColor: palette.cream }} />;
  return settings.onboarded ? <MainShell /> : <Onboarding />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NestProvider>
        <StatusBar style="dark" />
        <Root />
      </NestProvider>
    </SafeAreaProvider>
  );
}
