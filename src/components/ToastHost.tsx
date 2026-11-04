import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, radius, spacing} from '../theme';

export type ToastKind = 'success' | 'error' | 'info';

export default function ToastHost({
  toast,
}: {
  toast: {message: string; kind: ToastKind} | null;
}) {
  if (!toast) {
    return null;
  }
  const bg =
    toast.kind === 'success'
      ? colors.success
      : toast.kind === 'error'
      ? colors.danger
      : colors.text;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.toast, {backgroundColor: bg}]}>
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 48,
    alignItems: 'center',
  },
  toast: {
    maxWidth: 420,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  text: {color: colors.white, fontSize: fontSize.md, fontWeight: '600'},
});
