import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import KpiCard from '../../../components/KpiCard';
import TopNavbar from '../../../components/TopNavbar';
import {BarChart, HBarChart, SplitBar} from '../../../components/charts';
import {
  fetchOverviewArrivalsTrend,
  fetchOverviewLeaderboard,
  fetchOverviewNodes,
  fetchOverviewOnboarded,
  fetchOverviewSummary,
  type LoyaltySeries,
  type OverviewLeaderboard,
  type OverviewNode,
} from '../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../theme';
import type {AppNavigationProp} from '../../../navigation/types';

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayISO(): string {
  return iso(new Date());
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
}

const RANGES = [
  {label: '7D', days: 6},
  {label: '14D', days: 13},
  {label: '30D', days: 29},
];

interface Kpi {
  loyal: number;
  eligible: number;
  frequency: number;
  onboarded: number;
  best: OverviewLeaderboard['best_node'] | null;
  fastest: OverviewLeaderboard['fastest_node'] | null;
}

const NAV_ITEMS: {label: string; screen: string}[] = [
  {label: 'Loyalty List', screen: 'LoyaltyList'},
  {label: 'Visitors List', screen: 'Visitors'},
  {label: "Today's Arrival", screen: 'Today'},
  {label: 'Notifications', screen: 'LoyaltyNotifications'},
  {label: 'Loyalty Settings', screen: 'LoyaltySettings'},
];

/** Managerial home — "overall data of loyalty program" (web Overview page). */
export default function LoyaltyOverviewPage() {
  const navigation = useNavigation<AppNavigationProp>();
  const [rangeKey, setRangeKey] = useState(0);
  const [from, setFrom] = useState(daysAgoISO(6));
  const [to, setTo] = useState(todayISO());
  const [kpi, setKpi] = useState<Kpi>({
    loyal: 0,
    eligible: 0,
    frequency: 0,
    onboarded: 0,
    best: null,
    fastest: null,
  });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [trend, setTrend] = useState<LoyaltySeries | null>(null);
  const [nodes, setNodes] = useState<OverviewNode[]>([]);

  const applyRange = (idx: number) => {
    setRangeKey(idx);
    setFrom(daysAgoISO(RANGES[idx].days));
    setTo(todayISO());
  };

  useEffect(() => {
    let cancelled = false;
    setKpiLoading(true);
    Promise.all([
      fetchOverviewSummary(to).catch(() => null),
      fetchOverviewOnboarded(from, to).catch(() => null),
      fetchOverviewLeaderboard(from, to).catch(() => null),
    ]).then(([s, o, l]) => {
      if (cancelled) {
        return;
      }
      const sum = s as {
        total_members: number;
        eligible_count: number;
        visit_frequency: number;
      } | null;
      const onb = o as {count: number} | null;
      const lead = l as OverviewLeaderboard | null;
      setKpi({
        loyal: sum?.total_members ?? 0,
        eligible: sum?.eligible_count ?? 0,
        frequency: sum?.visit_frequency ?? 0,
        onboarded: onb?.count ?? 0,
        best: lead?.best_node ?? null,
        fastest: lead?.fastest_node ?? null,
      });
    }).finally(() => {
      if (!cancelled) {
        setKpiLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  useEffect(() => {
    let cancelled = false;
    fetchOverviewArrivalsTrend(from, to)
      .then(v => {
        if (!cancelled) {
          setTrend(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrend(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  useEffect(() => {
    let cancelled = false;
    fetchOverviewNodes(to)
      .then(v => {
        if (!cancelled) {
          setNodes(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNodes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [to]);

  return (
    <View style={styles.screen}>
      <TopNavbar title="Loyalty Program" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterRow}>
          {RANGES.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.filterBtn, rangeKey === i && styles.filterActive]}
              onPress={() => applyRange(i)}>
              <Text
                style={
                  rangeKey === i ? styles.filterActiveLabel : styles.filterLabel
                }>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {kpiLoading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : (
          <>
            <View style={styles.kpiRow}>
              <KpiCard label="Total Loyal Members" value={kpi.loyal} accent={colors.accent} />
              <KpiCard label="Eligible" value={kpi.eligible} accent={colors.success} />
            </View>
            <View style={styles.kpiRow}>
              <KpiCard label="Onboarded" value={kpi.onboarded} accent={colors.warning} />
              <KpiCard label="Visit Frequency" value={kpi.frequency} accent="#7C3AED" />
            </View>
            <View style={styles.kpiRow}>
              <KpiCard
                label="Best Performing Node"
                value={kpi.best?.node_name ?? '—'}
                sub={`${kpi.best?.arrivals ?? 0} arrivals`}
                accent={colors.accent}
              />
              <KpiCard
                label="Fastest Growing Node"
                value={kpi.fastest?.node_name ?? '—'}
                sub={`${kpi.fastest?.onboarded ?? 0} onboarded`}
                accent={colors.success}
              />
            </View>
          </>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loyal Member Arrivals</Text>
          {trend ? (
            <BarChart
              labels={trend.labels}
              data={trend.data}
              step={Math.max(1, Math.floor(trend.labels.length / 6))}
            />
          ) : (
            <Text style={styles.empty}>No trend data.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loyal vs Eligible</Text>
          <SplitBar
            left={kpi.loyal}
            right={kpi.eligible}
            leftLabel="Loyal"
            rightLabel="Eligible"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conversion % by Node</Text>
          {nodes.length ? (
            <HBarChart
              items={nodes.map(n => ({
                label: n.node_name ?? '—',
                value: Math.round(n.conversion_pct),
              }))}
              color={colors.success}
            />
          ) : (
            <Text style={styles.empty}>No node data.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loyal Members by Node</Text>
          {nodes.length ? (
            <HBarChart
              items={nodes.map(n => ({label: n.node_name ?? '—', value: n.loyal}))}
              color={colors.accent}
            />
          ) : (
            <Text style={styles.empty}>No node data.</Text>
          )}
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={styles.navButton}
              onPress={() => navigation.navigate(item.screen as never)}>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  loader: {marginTop: spacing.lg},
  filterRow: {flexDirection: 'row', marginBottom: spacing.md},
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  filterLabel: {color: colors.text},
  filterActiveLabel: {color: colors.white, fontWeight: '700'},
  kpiRow: {flexDirection: 'row', marginHorizontal: -spacing.xs},
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cardTitle: {fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm},
  empty: {color: colors.muted, fontSize: fontSize.sm, marginTop: spacing.sm},
  nav: {marginTop: spacing.md},
  navButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  navLabel: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
});
