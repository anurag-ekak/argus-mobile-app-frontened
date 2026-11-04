import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import KpiCard from '../../../../components/KpiCard';
import TopNavbar from '../../../../components/TopNavbar';
import {BarChart, Heatmap} from '../../../../components/charts';
import {useNodeScope} from '../../../../hooks/useNodeScope';
import {fetchOrgNodes} from '../../../../services/node_service';
import {
  fetchRepeatHeatmap,
  fetchRepeatKpis,
  fetchRepeatLog,
  fetchWalkinFootfall,
  fetchWalkinKpis,
  fetchWalkinLog,
  type Footfall,
  type Heatmap as HeatmapData,
  type RepeatKPIs,
  type VisitLogRow,
  type WalkinKPIs,
} from '../../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../../theme';

type Mode = 'trends' | 'logs';
type LogKind = 'walkins' | 'repeat';

/** Visitors List — trends (walk-in + repeat KPIs, graphs, heatmap) + logs. */
export default function VisitorsPage() {
  const {nodeId} = useNodeScope();
  const [mode, setMode] = useState<Mode>('trends');
  const [logKind, setLogKind] = useState<LogKind>('walkins');
  const [nodeFilter, setNodeFilter] = useState<string | undefined>(nodeId ?? undefined);
  const [nodes, setNodes] = useState<{id: string; name: string}[]>([]);
  const [wk, setWk] = useState<WalkinKPIs | null>(null);
  const [rk, setRk] = useState<RepeatKPIs | null>(null);
  const [footfall, setFootfall] = useState<Footfall | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [logRows, setLogRows] = useState<VisitLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [logRefreshing, setLogRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOrgNodes()
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
  }, []);

  useEffect(() => {
    if (mode !== 'trends') {
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchWalkinKpis(nodeFilter).catch(() => null),
      fetchRepeatKpis(nodeFilter).catch(() => null),
      fetchWalkinFootfall(nodeFilter).catch(() => null),
      fetchRepeatHeatmap(nodeFilter).catch(() => null),
    ]).then(([w, r, f, h]) => {
      if (cancelled) {
        return;
      }
      setWk(w as WalkinKPIs | null);
      setRk(r as RepeatKPIs | null);
      setFootfall(f as Footfall | null);
      setHeatmap(h as HeatmapData | null);
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, nodeFilter]);

  useEffect(() => {
    if (mode !== 'logs') {
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetcher = logKind === 'walkins' ? fetchWalkinLog : fetchRepeatLog;
    fetcher(nodeFilter)
      .then(v => {
        if (!cancelled) {
          setLogRows(v.logs);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLogRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, logKind, nodeFilter]);

  const onLogRefresh = async () => {
    setLogRefreshing(true);
    try {
      const fetcher = logKind === 'walkins' ? fetchWalkinLog : fetchRepeatLog;
      setLogRows((await fetcher(nodeFilter)).logs);
    } catch {
      // keep current data on refresh failure
    } finally {
      setLogRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopNavbar title="Visitors List" back />
      <View style={styles.seg}>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'trends' && styles.segActive]}
          onPress={() => setMode('trends')}>
          <Text style={mode === 'trends' ? styles.segActiveLabel : styles.segLabel}>
            Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'logs' && styles.segActive]}
          onPress={() => setMode('logs')}>
          <Text style={mode === 'logs' ? styles.segActiveLabel : styles.segLabel}>
            Logs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, nodeFilter === undefined && styles.chipActive]}
          onPress={() => setNodeFilter(undefined)}>
          <Text style={nodeFilter === undefined ? styles.chipActiveLabel : styles.chipLabel}>
            All nodes
          </Text>
        </TouchableOpacity>
        {nodes.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[styles.chip, nodeFilter === n.id && styles.chipActive]}
            onPress={() => setNodeFilter(n.id)}>
            <Text style={nodeFilter === n.id ? styles.chipActiveLabel : styles.chipLabel}>
              {n.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {mode === 'trends' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" />
          ) : (
            <>
              <View style={styles.kpiRow}>
                <KpiCard label="Total New Visitors" value={wk?.new_today} accent={colors.accent} />
                <KpiCard label="Peak Visiting Hours" value={wk?.peak_time ?? '—'} accent={colors.success} />
              </View>
              <View style={styles.kpiRow}>
                <KpiCard label="Share of New Walk Ins" value={`${wk?.share ?? 0}%`} accent={colors.warning} />
                <KpiCard label="Total Visitors" value={rk?.rv_today} accent="#7C3AED" />
              </View>
              <View style={styles.kpiRow}>
                <KpiCard label="Peak Hours" value={rk?.peak_hour ?? '—'} accent={colors.accent} />
                <KpiCard label="Share of Repeaters" value={`${rk?.share ?? 0}%`} accent={colors.success} />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Walk-in Trends</Text>
                {footfall ? (
                  <BarChart
                    labels={footfall.labels}
                    data={footfall.data}
                    step={Math.max(1, Math.floor(footfall.labels.length / 6))}
                  />
                ) : (
                  <Text style={styles.empty}>No trend data.</Text>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Visit Timing Pattern</Text>
                {heatmap ? (
                  <Heatmap days={heatmap.days} hours={heatmap.hours} data={heatmap.data} />
                ) : (
                  <Text style={styles.empty}>No timing data.</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <>
          <View style={styles.seg}>
            <TouchableOpacity
              style={[styles.segBtn, logKind === 'walkins' && styles.segActive]}
              onPress={() => setLogKind('walkins')}>
              <Text style={logKind === 'walkins' ? styles.segActiveLabel : styles.segLabel}>
                New Walk-ins
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, logKind === 'repeat' && styles.segActive]}
              onPress={() => setLogKind('repeat')}>
              <Text style={logKind === 'repeat' ? styles.segActiveLabel : styles.segLabel}>
                Repeat Visitors
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" />
          ) : (
            <FlatList
              data={logRows}
              keyExtractor={(r, i) => r.uid ?? String(i)}
              refreshControl={
                <RefreshControl
                  refreshing={logRefreshing}
                  onRefresh={onLogRefresh}
                  tintColor={colors.accent}
                  colors={[colors.accent]}
                />
              }
              renderItem={({item}) => (
                <View style={styles.row}>
                  <Text style={styles.name}>
                    {item.visit_date} {item.visit_time}
                  </Text>
                  <Text style={styles.meta}>
                    {item.node_name ?? '—'}
                    {item.visit_count != null ? ` · ${item.visit_count} visits` : ''}
                  </Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No visitors.</Text>}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  seg: {flexDirection: 'row', padding: spacing.md},
  segBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  segActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  segLabel: {color: colors.text},
  segActiveLabel: {color: colors.white, fontWeight: '600'},
  chips: {paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm},
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {backgroundColor: colors.text, borderColor: colors.text},
  chipLabel: {color: colors.text},
  chipActiveLabel: {color: colors.white, fontWeight: '600'},
  content: {padding: spacing.md},
  loader: {marginTop: spacing.lg},
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
  row: {padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border},
  name: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
  meta: {fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs},
});
