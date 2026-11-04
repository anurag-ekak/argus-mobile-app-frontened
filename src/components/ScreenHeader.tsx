import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {colors, fontSize, spacing} from '../theme';

export default function ScreenHeader({title}: {title: string}) {
  const {logout} = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity style={styles.side} onPress={logout}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  side: {minWidth: 56},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  back: {color: colors.accent, fontSize: fontSize.md, fontWeight: '600'},
  logout: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'right',
  },
});
