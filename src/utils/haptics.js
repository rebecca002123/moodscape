import * as Haptics from 'expo-haptics';

let enabled = true;

export function setHapticsEnabled(on) {
  enabled = on;
}

const safe = (fn) => { if (enabled) fn().catch(() => {}); };

export const tap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const thud = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const select = () => safe(() => Haptics.selectionAsync());
export const success = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
