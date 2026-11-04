import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import {useAuth} from '../../context/AuthContext';
import {colors, fontSize, radius, spacing} from '../../theme';

/** Own profile (personal details, info) — distinct from Loyalty Profile. */
export default function MyProfileScreen() {
  const {user, organization, role} = useAuth();
  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader title="My Profile" />
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name ?? user?.username ?? '—'}</Text>
        <Text style={styles.meta}>Email: {user?.email ?? '—'}</Text>
        <Text style={styles.meta}>Username: {user?.username ?? '—'}</Text>
        <Text style={styles.meta}>Role: {role ?? '—'}</Text>
        <Text style={styles.meta}>
          Organisation: {organization?.name ?? '—'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
