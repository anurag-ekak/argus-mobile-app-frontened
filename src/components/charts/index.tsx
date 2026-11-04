// Dependency-free chart primitives (pure Views — no react-native-svg needed,
// so the app stays a no-native-dep build). Layouts mirror the web dashboard:
// arrivals/footfall = vertical bars, conversion/node ranking = horizontal bars,
// loyal vs eligible = split bar, visit timing = heatmap.
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, spacing} from '../../theme';

// ─── BarChart (vertical bars) ────────────────────────────────────────────────

export function BarChart({
  labels,
  data,
  height = 150,
  color = colors.accent,
  step = 1,
}: {
  labels: string[];
  data: number[];
  height?: number;
  color?: string;
  /** Label thinning — show every `step`-th x label. */
  step?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <View style={[styles.barWrap, {height}]}>
      {data.map((v, i) => (
        <View key={i} style={styles.barCol}>
          <Text style={styles.barValue}>{v > 0 ? v : ''}</Text>
          <View
            style={[
              styles.bar,
              {
                height: Math.max((v / max) * (height - 40), v > 0 ? 3 : 0),
                backgroundColor: color,
              },
            ]}
          />
          {i % step === 0 ? (
            <Text style={styles.barLabel} numberOfLines={1}>
              {labels[i] ?? ''}
            </Text>
          ) : (
            <View style={styles.barLabelGap} />
          )}
        </View>
      ))}
    </View>
  );
}

// ─── HBarChart (horizontal bars) ─────────────────────────────────────────────

export function HBarChart({
  items,
  color = colors.accent,
}: {
  items: {label: string; value: number}[];
  color?: string;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={styles.hRow}>
          <Text style={styles.hLabel} numberOfLines={1}>
            {it.label}
          </Text>
          <View style={styles.hTrack}>
            <View
              style={[
                styles.hFill,
                {width: `${Math.max((it.value / max) * 100, 2)}%`, backgroundColor: color},
              ]}
            />
          </View>
          <Text style={styles.hValue}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── SplitBar (two-segment share bar) ────────────────────────────────────────

export function SplitBar({
  left,
  right,
  leftLabel,
  rightLabel,
  leftColor = colors.accent,
  rightColor = colors.success,
}: {
  left: number;
  right: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
}) {
  const total = left + right || 1;
  return (
    <View>
      <View style={styles.splitTrack}>
        <View style={[styles.splitSeg, {flex: left / total, backgroundColor: leftColor}]} />
        <View style={[styles.splitSeg, {flex: right / total, backgroundColor: rightColor}]} />
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: leftColor}]} />
          <Text style={styles.legendText}>
            {leftLabel} ({left})
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: rightColor}]} />
          <Text style={styles.legendText}>
            {rightLabel} ({right})
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Heatmap (visit timing pattern) ─────────────────────────────────────────

export function Heatmap({
  days,
  hours,
  data,
}: {
  days: string[];
  hours: string[];
  data: number[][];
}) {
  const max = Math.max(...data.flat(), 1);
  return (
    <View>
      <View style={styles.hmHeader}>
        <View style={styles.hmCorner} />
        {days.map((d, i) => (
          <Text key={i} style={styles.hmDay} numberOfLines={1}>
            {d}
          </Text>
        ))}
      </View>
      {hours.map((h, hi) => (
        <View key={hi} style={styles.hmRow}>
          <Text style={styles.hmHour} numberOfLines={1}>
            {h}
          </Text>
          {days.map((_, di) => {
            const v = data[hi]?.[di] ?? 0;
            return (
              <View
                key={di}
                style={[
                  styles.hmCell,
                  {backgroundColor: colors.accent, opacity: 0.08 + 0.92 * (v / max)},
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  barWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing.md,
  },
  barCol: {flex: 1, alignItems: 'center', justifyContent: 'flex-end'},
  barValue: {fontSize: 9, color: colors.muted},
  bar: {width: 14, borderRadius: 4},
  barLabel: {fontSize: 9, color: colors.muted, marginTop: 4},
  barLabelGap: {height: 15},
  hRow: {flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm},
  hLabel: {width: 110, fontSize: fontSize.sm, color: colors.text},
  hTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  hFill: {height: 14, borderRadius: 7},
  hValue: {width: 40, textAlign: 'right', fontSize: fontSize.sm, color: colors.text},
  splitTrack: {flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden'},
  splitSeg: {height: 18},
  legendRow: {flexDirection: 'row', marginTop: spacing.sm, gap: spacing.md},
  legendItem: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 6},
  legendText: {fontSize: fontSize.sm, color: colors.text},
  hmHeader: {flexDirection: 'row', marginBottom: 2},
  hmCorner: {width: 34},
  hmDay: {flex: 1, fontSize: 8, color: colors.muted, textAlign: 'center'},
  hmRow: {flexDirection: 'row', marginBottom: 2},
  hmHour: {width: 34, fontSize: 8, color: colors.muted},
  hmCell: {flex: 1, height: 14, marginHorizontal: 1, borderRadius: 2},
});
