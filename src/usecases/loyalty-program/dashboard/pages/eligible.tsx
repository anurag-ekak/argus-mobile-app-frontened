import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TopNavbar from '../../../../components/TopNavbar';
import {useNodeScope} from '../../../../hooks/useNodeScope';
import {
  fetchCandidates,
  type LoyaltyCandidate,
} from '../../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../../theme';
import type {AppNavigationProp} from '../../../../navigation/types';

/** Eligible candidates — people whose visits crossed the loyalty threshold. */
export default function EligibleCandidatesPage() {
  const navigation = useNavigation<AppNavigationProp>();
  const {nodeId} = useNodeScope();
  const [candidates, setCandidates] = useState<LoyaltyCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCandidates(nodeId)
      .then(v => {
        if (!cancelled) {
          setCandidates(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCandidates([]);
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setCandidates(await fetchCandidates(nodeId));
    } catch {
      // keep current data on refresh failure
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopNavbar title="Eligible Candidates" back />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={c => c.visitor_id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({item}) => (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.name}>{item.person_name}</Text>
                <Text style={styles.meta}>
                  {item.visit_count} visits · {item.node_name ?? '—'}
                </Text>
              </View>
              <View style={styles.rowSide}>
                <Text style={[styles.status, item.status === 'Prime' && styles.statusPrime]}>
                  {item.status ?? 'Eligible'}
                </Text>
                <TouchableOpacity
                  style={styles.onboard}
                  onPress={() =>
                    navigation.navigate('LoyaltyOnboarding', {
                      visitorId: item.visitor_id,
                      nodeId: item.node_id,
                    })
                  }>
                  <Text style={styles.onboardLabel}>Onboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No eligible candidates.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  loader: {marginTop: spacing.lg},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {flex: 1},
  rowSide: {alignItems: 'flex-end'},
  name: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
  meta: {fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs},
  status: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  statusPrime: {color: colors.success},
  onboard: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  onboardLabel: {color: colors.white, fontWeight: '600'},
  empty: {textAlign: 'center', color: colors.muted, marginTop: spacing.lg},
});
