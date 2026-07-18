import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme, type, radius as R } from '../theme/theme';

// ---------------------------------------------------------------------------
// GlassSurface — the base Liquid Glass pane: real blur, a whisper of fill,
// a hairline stroke, a bright specular top edge and a soft lifting shadow.
// ---------------------------------------------------------------------------

export function GlassSurface({
  children, style, innerStyle, radius = R.card, strong = false, shadow = true,
}) {
  const t = useTheme();
  const g = t.glass;
  return (
    <View
      style={[
        shadow && {
          shadowColor: g.shadow,
          shadowOpacity: g.shadowOpacity,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        },
        { borderRadius: radius },
        style,
      ]}
    >
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <BlurView
          intensity={g.intensity}
          tint={g.blurTint}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: strong ? g.fillStrong : g.fill }]}
        />
        <LinearGradient
          colors={[
            t.scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)',
            'rgba(255,255,255,0.0)',
            t.scheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.12)',
          ]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, borderWidth: 1, borderColor: g.stroke },
          ]}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', top: 0, left: radius * 0.6, right: radius * 0.6,
            height: 1, borderRadius: 1, backgroundColor: g.specular, opacity: 0.6,
          }}
        />
        <View style={innerStyle}>{children}</View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// GlassPressable — springy press feedback on any glass pane.
// ---------------------------------------------------------------------------

export function GlassPressable({
  children, onPress, onLongPress, style, innerStyle, radius = R.card,
  strong, shadow = true, disabled, accessibilityLabel,
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => { scale.value = withSpring(0.965, { damping: 18, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 300 }); }}
    >
      <Animated.View style={aStyle}>
        <GlassSurface style={style} innerStyle={innerStyle} radius={radius} strong={strong} shadow={shadow}>
          {children}
        </GlassSurface>
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// GlassButton — capsule action. `tint` (a [from,to] gradient) makes it a
// prominent, colour-filled action; otherwise it is a quiet glass capsule.
// ---------------------------------------------------------------------------

export function GlassButton({ label, onPress, tint, style, textStyle, disabled, small }) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pad = small ? { paddingVertical: 10, paddingHorizontal: 18 } : { paddingVertical: 16, paddingHorizontal: 26 };
  const inner = (
    <Text
      style={[
        small ? type.footnote : type.headline,
        { color: tint ? '#0B0F1E' : t.text, textAlign: 'center' },
        disabled && { opacity: 0.4 },
        textStyle,
      ]}
    >
      {label}
    </Text>
  );
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 18, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 300 }); }}
      style={style}
    >
      <Animated.View style={aStyle}>
        {tint ? (
          <View
            style={{
              borderRadius: R.capsule,
              shadowColor: tint[1], shadowOpacity: 0.55, shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 }, elevation: 8,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <LinearGradient
              colors={tint}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[{ borderRadius: R.capsule }, pad]}
            >
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute', top: 1.5, left: 14, right: 14, height: 1,
                  borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.75)',
                }}
              />
              {inner}
            </LinearGradient>
          </View>
        ) : (
          <GlassSurface radius={R.capsule} innerStyle={pad} strong>
            {inner}
          </GlassSurface>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Chip — a small glass toggle capsule (tags, filters).
// ---------------------------------------------------------------------------

export function Chip({ label, active, onPress, activeColor }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }}>
      <View
        style={{
          borderRadius: R.capsule,
          paddingVertical: 8, paddingHorizontal: 14,
          backgroundColor: active
            ? (activeColor || (t.scheme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(20,28,60,0.10)'))
            : t.glass.fill,
          borderWidth: 1,
          borderColor: active ? t.glass.specular : t.glass.stroke,
        }}
      >
        <Text style={[type.footnote, { color: active ? t.text : t.textSecondary }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Segmented — glass segmented control with a sliding liquid pill.
// ---------------------------------------------------------------------------

export function Segmented({ options, value, onChange, style }) {
  const t = useTheme();
  const [width, setWidth] = React.useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const segW = width / options.length || 0;

  React.useEffect(() => {
    x.value = withSpring(index * segW, { damping: 20, stiffness: 260 });
  }, [index, segW, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <GlassSurface radius={R.capsule} style={style} shadow={false} innerStyle={{ padding: 3 }}>
      <View
        style={{ flexDirection: 'row' }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 6)}
      >
        {width > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              pill,
              {
                position: 'absolute', top: 0, bottom: 0, width: segW,
                borderRadius: R.capsule,
                backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.9)',
                borderWidth: 1, borderColor: t.glass.specular,
                shadowColor: t.glass.shadow, shadowOpacity: 0.2, shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
              },
            ]}
          />
        )}
        {options.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: o.value === value }}
            style={{ flex: 1, paddingVertical: 9, alignItems: 'center' }}
          >
            <Text
              style={[
                type.footnote,
                { color: o.value === value ? t.text : t.textSecondary },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// Txt — tiny typographic helper bound to the theme.
// ---------------------------------------------------------------------------

export function Txt({ v = 'body', c, style, children, ...rest }) {
  const t = useTheme();
  const color = c === 'secondary' ? t.textSecondary
    : c === 'tertiary' ? t.textTertiary
      : c || t.text;
  return (
    <Text style={[type[v], { color }, style]} {...rest}>
      {children}
    </Text>
  );
}
