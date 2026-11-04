import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import {colors, fontSize, spacing} from '../../theme';

/** Managerial home — "overall data of loyalty program". Node-scoped. */
export default function LoyaltyOverviewScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Overview of Loyalty Program" />
      <View style={styles.body}>
        <Text style={styles.placeholder}>
          Loyalty program overview — KPI cards (footfall, walkins, loyalty
          onboarding) + graphs land in the loyalty feature step.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  body: {flex: 1, padding: spacing.md},
  placeholder: {color: colors.muted, fontSize: fontSize.md},
});
