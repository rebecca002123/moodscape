import React from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassSurface, GlassButton, Segmented, Txt } from '../components/Glass';
import { useEntries, useSettings } from '../state/store';
import { useTheme } from '../theme/theme';
import { tap, warn } from '../utils/haptics';

function Card({ title, children, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.duration(450).delay(delay)}>
      <GlassSurface innerStyle={{ padding: 18, gap: 14 }}>
        {!!title && <Txt v="headline">{title}</Txt>}
        {children}
      </GlassSurface>
    </Animated.View>
  );
}

export default function SettingsScreen({ topInset }) {
  const t = useTheme();
  const { settings, updateSettings } = useSettings();
  const { entries, clearAll, seedSample } = useEntries();

  const confirmClear = () => {
    warn();
    Alert.alert(
      'Erase everything?',
      `This permanently deletes all ${entries.length} check-in${entries.length === 1 ? '' : 's'} from this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: clearAll },
      ],
    );
  };

  const confirmSample = () => {
    const run = () => { tap(); seedSample(); };
    if (entries.length > 0) {
      Alert.alert(
        'Replace your journal with sample data?',
        'Your current check-ins will be overwritten by 6 weeks of demo entries.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: run },
        ],
      );
    } else {
      run();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: topInset + 18, paddingHorizontal: 20, paddingBottom: 150, gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Txt v="largeTitle">Settings</Txt>
        <Txt v="subhead" c="secondary">Make the glass yours</Txt>
      </View>

      <Card title="Appearance">
        <Segmented
          options={[
            { label: 'Auto', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
          value={settings.appearance}
          onChange={(v) => { tap(); updateSettings({ appearance: v }); }}
        />
        <Txt v="footnote" c="tertiary">
          Auto follows your system. The glass adapts either way.
        </Txt>
      </Card>

      <Card title="Feel" delay={60}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Txt v="body">Haptics</Txt>
            <Txt v="footnote" c="tertiary">Tiny taps when you touch the glass</Txt>
          </View>
          <Switch
            value={settings.haptics}
            onValueChange={(v) => updateSettings({ haptics: v })}
            trackColor={{ true: '#6E9BFF' }}
          />
        </View>
      </Card>

      <Card title="Your data" delay={120}>
        <Txt v="footnote" c="tertiary">
          Everything lives on this device. No account, no cloud, nothing leaves your phone.
        </Txt>
        <GlassButton small label="Fill with sample data" onPress={confirmSample} />
        <GlassButton
          small
          label="Erase all check-ins"
          onPress={confirmClear}
          textStyle={{ color: t.danger }}
        />
      </Card>

      <Card delay={180}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Txt v="headline">MoodScape</Txt>
          <Txt v="footnote" c="tertiary">Liquid Glass edition · 2.0</Txt>
          <Txt v="footnote" c="tertiary">Made with 💙 for Expo Go</Txt>
        </View>
      </Card>
    </ScrollView>
  );
}
