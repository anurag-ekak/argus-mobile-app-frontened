import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, radius, spacing} from '../theme';

export default function KpiCard({
  label,
  value,
  sub,
  accent = colors.accent,
  icon = '•',
  loading = false,
}: {
  label: string;
  value: number | string | undefined;
  sub?: string;
  accent?: string;
  icon?: string;
  loading?: boolean;
}) {
  if (loading) {
    return <View style={[styles.card, styles.skeleton]} />;
  }
  return (
    <View style={styles.card}>
      <View style={styles.chip}>
        <Text style={[styles.chipIcon, {color: accent}]}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value ?? '—'}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeleton: {
    backgroundColor: colors.bgMuted,
    borderColor: colors.bgMuted,
    minHeight: 96,
  },
  chip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  chipIcon: {fontSize: 14},
  value: {fontSize: fontSize.xl, fontWeight: '700', color: colors.text},
  label: {fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs},
  sub: {fontSize: 10, color: colors.muted, marginTop: 2},
});
