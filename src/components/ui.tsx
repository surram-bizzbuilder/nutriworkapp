import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const colors = {
  bg: '#F6F7F2',
  card: '#FFFFFF',
  ink: '#1D2421',
  muted: '#66706B',
  line: '#E3E7E0',
  brand: '#2E7D5B',
  brandSoft: '#DDEFE5',
  accent: '#F2994A',
  accentSoft: '#FDEBDB',
  danger: '#C2483D',
  dangerSoft: '#F8DEDB',
  protein: '#5B7FDB',
  carbs: '#E2A93B',
  fat: '#D46A8C',
  fiber: '#4FA37A',
};

export const space = (n: number) => n * 4;

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, variant !== 'primary' && { color: colors.brand }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, suffix, ...props }: TextInputProps & { label: string; suffix?: string }) {
  return (
    <View style={{ marginBottom: space(4) }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.brand, limit }: { value: number; max: number; color?: string; limit?: boolean }) {
  const pct = max > 0 ? value / max : 0;
  const over = pct > 1;
  const barColor = limit && over ? colors.danger : color;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: barColor }]} />
    </View>
  );
}

export function Ring({ value, max, size = 140, stroke = 12, children }: { value: number; max: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max * 1.05;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? colors.danger : colors.brand}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: space(4),
    marginBottom: space(3),
    borderWidth: 1,
    borderColor: colors.line,
  },
  h1: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: space(1) },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: space(2) },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: space(3.5),
    paddingHorizontal: space(5),
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: colors.brandSoft },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  chip: {
    paddingVertical: space(2),
    paddingHorizontal: space(3.5),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    marginRight: space(2),
    marginBottom: space(2),
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.ink, fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: space(1.5) },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: space(3),
  },
  input: { flex: 1, paddingVertical: space(3), fontSize: 16, color: colors.ink },
  suffix: { color: colors.muted, marginLeft: space(2) },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
