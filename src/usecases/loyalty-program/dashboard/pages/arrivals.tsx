import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import KpiCard from '../../../../components/KpiCard';
import TopNavbar from '../../../../components/TopNavbar';
import {useNodeScope} from '../../../../hooks/useNodeScope';
import {fetchOrgNodes} from '../../../../services/node_service';
import {
  fetchArrivals,
  type LoyaltyArrival,
} from '../../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../../theme';

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayISO(): string {
  return iso(new Date());
}

function fmtTime(isoStr: string | null): string {
  if (!isoStr) {
    return '—';
  }
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'});
}

/** Waiter/Employee home — "data of loyal people on the corresponding day". */
export default function TodaysLoyalPage() {
  const {nodeId} = useNodeScope();
  const [date, setDate] = useState(todayISO());
  const [nodeFilter, setNodeFilter] = useState<string | undefined>(nodeId ?? undefined);
  const [nodes, setNodes] = useState<{id: string; name: string}[]>([]);
  const [arrivals, setArrivals] = useState<LoyaltyArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    let cancelled = false;
    setLoading(true);
    fetchArrivals(date, nodeFilter)
      .then(v => {
        if (!cancelled) {
          setArrivals(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArrivals([]);
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
  }, [date, nodeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setArrivals(await fetchArrivals(date, nodeFilter));
    } catch {
      // keep current data on refresh failure
    } finally {
      setRefreshing(false);
    }
  };

  const uniqueVisited = new Set(arrivals.map(a => a.member_id)).size;
  const sorted = [...arrivals].sort((a, b) =>
    (b.last_seen_at ?? '').localeCompare(a.last_seen_at ?? ''),
  );

  return (
    <View style={styles.screen}>
      <TopNavbar title="Today's Arrival" />
      <FlatList
        data={sorted}
        keyExtractor={a => a.member_id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.kpiRow}>
              <KpiCard label="Total Loyal Visited" value={uniqueVisited} accent={colors.accent} />
              <KpiCard label="Arrivals" value={arrivals.length} accent={colors.success} />
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

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Date</Text>
              <TextInput
                style={styles.dateInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayISO())}>
                <Text style={styles.todayLabel}>Today</Text>
              </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator style={styles.loader} size="large" /> : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.person_name}</Text>
            <Text style={styles.meta}>
              {item.tier} · {item.visit_count} visits · {fmtTime(item.last_seen_at)}
            </Text>
            <Text style={styles.meta}>{item.node_name ?? '—'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No loyal arrivals.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  kpiRow: {flexDirection: 'row', marginHorizontal: -spacing.xs, paddingHorizontal: spacing.md},
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
  dateRow: {flexDirection: 'row', alignItems: 'center', padding: spacing.md},
  dateLabel: {color: colors.muted, fontSize: fontSize.md, marginRight: spacing.sm},
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  todayBtn: {
    marginLeft: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  todayLabel: {color: colors.white, fontWeight: '600'},
  loader: {marginTop: spacing.lg},
  row: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
  meta: {fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs},
  empty: {textAlign: 'center', color: colors.muted, marginTop: spacing.lg},
});
