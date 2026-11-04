import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import KpiCard from '../../../../components/KpiCard';
import TopNavbar from '../../../../components/TopNavbar';
import {useNodeScope} from '../../../../hooks/useNodeScope';
import {
  fetchLoyaltyKPIs,
  fetchMembers,
  searchMembers,
  type LoyaltyKPIs,
  type LoyaltyMember,
} from '../../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../../theme';
import type {AppNavigationProp} from '../../../../navigation/types';

function fmtDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Loyalty List — 4 KPI cards + search + member table + Add member. */
export default function LoyaltyMembersPage() {
  const navigation = useNavigation<AppNavigationProp>();
  const {nodeId} = useNodeScope();
  const [kpis, setKpis] = useState<LoyaltyKPIs | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMembers({nodeId})
      .then(v => {
        if (!cancelled) {
          setMembers(v.members);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMembers([]);
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
  }, [nodeId]);

  useEffect(() => {
    let cancelled = false;
    fetchLoyaltyKPIs(nodeId)
      .then(v => {
        if (!cancelled) {
          setKpis(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKpis(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const onSearch = async () => {
    const q = query.trim();
    setLoading(true);
    try {
      if (!q) {
        setMembers((await fetchMembers({nodeId})).members);
      } else {
        setMembers(await searchMembers(q));
      }
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [m, k] = await Promise.all([
        fetchMembers({nodeId}),
        fetchLoyaltyKPIs(nodeId),
      ]);
      setMembers(m.members);
      setKpis(k);
    } catch {
      // keep current data on refresh failure
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopNavbar title="Loyalty List" back />
      <FlatList
        data={members}
        keyExtractor={m => m.id}
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
              <KpiCard
                label="Total Loyal Members"
                value={kpis?.total_members}
                accent={colors.accent}
              />
              <KpiCard label="Eligible" value={kpis?.eligible_count} accent={colors.success} />
            </View>
            <View style={styles.kpiRow}>
              <KpiCard
                label="Onboarded This Month"
                value={kpis?.newly_onboarded}
                accent={colors.warning}
              />
              <KpiCard
                label="Avg Visits / Member"
                sub="This month"
                value={kpis?.avg_visits_per_member_month}
                accent={colors.purple}
              />
            </View>
            <View style={styles.toolbar}>
              <TextInput
                style={styles.input}
                placeholder="Search member"
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={onSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
                <Text style={styles.searchLabel}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('EligibleCandidates')}>
                <Text style={styles.addLabel}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.cellName]}>Member</Text>
              <Text style={[styles.headerCell, styles.cellLast]}>Last visit</Text>
              <Text style={[styles.headerCell, styles.cellVisits]}>Visits</Text>
            </View>
            {loading ? <ActivityIndicator style={styles.loader} size="large" /> : null}
          </View>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('LoyaltyProfile', {memberId: item.id})}>
            <View style={styles.cellName}>
              <Text style={styles.name} numberOfLines={1}>
                {item.person_name}
              </Text>
              {item.email ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {item.email}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.meta, styles.cellLast]} numberOfLines={1}>
              {fmtDate(item.last_visit_at)}
            </Text>
            <Text style={[styles.name, styles.cellVisits]}>{item.visit_count}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No members.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  kpiRow: {flexDirection: 'row', marginHorizontal: -spacing.xs, paddingHorizontal: spacing.md},
  toolbar: {flexDirection: 'row', padding: spacing.md},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  searchBtn: {
    marginLeft: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  searchLabel: {color: colors.white, fontWeight: '600'},
  addBtn: {
    marginLeft: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  addLabel: {color: colors.white, fontWeight: '700'},
  loader: {marginTop: spacing.lg},
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgMuted,
  },
  headerCell: {fontSize: fontSize.sm, color: colors.muted, fontWeight: '700'},
  cellName: {flex: 1, paddingRight: spacing.sm},
  cellLast: {width: 92},
  cellVisits: {width: 48, textAlign: 'right'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
  meta: {fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs},
  empty: {textAlign: 'center', color: colors.muted, marginTop: spacing.lg},
});
