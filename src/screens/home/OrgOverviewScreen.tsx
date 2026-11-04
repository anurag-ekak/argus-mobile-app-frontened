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
import KpiCard from '../../components/KpiCard';
import TopNavbar from '../../components/TopNavbar';
import {
  fetchOrgOverviewStats,
  type OrgOverviewStats,
} from '../../services/overview_service';
import {colors, fontSize, radius, spacing} from '../../theme';
import {resolveUsecaseIcon} from '../../lib/usecaseIcons';
import type {AppNavigationProp} from '../../navigation/types';

/** Overview of Argus — four org KPI cards + the usecase tab (Loyalty Program). */
export default function OrgOverviewScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const [stats, setStats] = useState<OrgOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOrgOverviewStats()
      .then(v => {
        if (!cancelled) {
          setStats(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats(null);
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
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TopNavbar title="Overview of Argus" />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <>
          <View style={styles.kpiRow}>
            <KpiCard label="Branches" value={stats?.total_branches} accent={colors.accent} />
            <KpiCard label="Cameras" value={stats?.total_cameras} accent={colors.success} />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard label="Profiles" value={stats?.total_profiles} accent={colors.warning} />
            <KpiCard label="EXE Tokens" value={stats?.total_exe_tokens} accent="#7C3AED" />
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.usecaseCard}
        onPress={() => navigation.navigate('Loyalty' as never)}>
        <View style={styles.usecaseIconWrap}>
          <Text style={styles.usecaseIcon}>{resolveUsecaseIcon('award')}</Text>
        </View>
        <View style={styles.usecaseMeta}>
          <Text style={styles.usecaseTitle}>Loyalty Program</Text>
          <Text style={styles.usecaseSub}>
            Turn repeat walk-ins into loyalty members with tiers.
          </Text>
        </View>
        <Text style={styles.usecaseChevron}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  loader: {marginTop: spacing.lg},
  kpiRow: {flexDirection: 'row', marginHorizontal: -spacing.xs},
  usecaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  usecaseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  usecaseIcon: {fontSize: 20},
  usecaseMeta: {flex: 1},
  usecaseTitle: {fontSize: fontSize.lg, fontWeight: '700', color: colors.text},
  usecaseSub: {fontSize: fontSize.sm, color: colors.muted, marginTop: 2},
  usecaseChevron: {fontSize: fontSize.xl, color: colors.muted},
});
