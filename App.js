import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/state/store';
import { ThemeProvider } from './src/theme/theme';
import AppShell from './src/AppShell';

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
