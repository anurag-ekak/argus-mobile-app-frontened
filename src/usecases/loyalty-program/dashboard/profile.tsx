import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import {
  fetchMemberDetail,
  fetchMemberStats,
  type LoyaltyMember,
  type MemberStats,
} from '../../../services/loyalty_service';
import {colors, fontSize, radius, spacing} from '../../../theme';
import type {RootStackParamList} from '../../../navigation/types';

/** Loyalty Profile — "data of a single loyal member". Distinct from own Profile. */
export default function LoyaltyProfilePage() {
  const route = useRoute<RouteProp<RootStackParamList, 'LoyaltyProfile'>>();
  const {memberId} = route.params;
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMemberDetail(memberId), fetchMemberStats(memberId)])
      .then(([m, s]) => {
        if (!cancelled) {
          setMember(m);
          setStats(s);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMember(null);
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
  }, [memberId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader title="Loyalty Profile" />
      <View style={styles.card}>
        <Text style={styles.name}>{member?.person_name ?? 'Member'}</Text>
        <Text style={styles.meta}>
          Tier: {member?.tier ?? '—'} · Status: {member?.status ?? '—'}
        </Text>
        <Text style={styles.meta}>Email: {member?.email ?? '—'}</Text>
        <Text style={styles.meta}>Phone: {member?.phone ?? '—'}</Text>
        <Text style={styles.meta}>
          Total visits: {stats?.total_visits ?? '—'} · Nodes:{' '}
          {stats?.unique_nodes ?? '—'}
        </Text>
        <Text style={styles.meta}>
          First seen: {stats?.first_seen ?? '—'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  screen: {flex: 1, backgroundColor: colors.background},
  card: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {fontSize: fontSize.xl, fontWeight: '700', color: colors.text},
  meta: {fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm},
});
