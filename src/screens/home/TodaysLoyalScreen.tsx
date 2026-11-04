import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import {colors, fontSize, spacing} from '../../theme';

/** Waiter/Employee home — "data of loyal people on the corresponding day". Node-scoped. */
export default function TodaysLoyalScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Today's Loyal" />
      <View style={styles.body}>
        <Text style={styles.placeholder}>
          Today's loyal members — daily table + search/filters land in the
          loyalty feature step.
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
