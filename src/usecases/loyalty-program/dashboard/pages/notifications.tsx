import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';
import ScreenHeader from '../../../../components/ScreenHeader';
import {
  fetchLoyaltyNotifications,
  type LoyaltyNotification,
} from '../../../../services/loyalty_service';
import {colors, fontSize, spacing} from '../../../../theme';

export default function LoyaltyNotificationsPage() {
  const [items, setItems] = useState<LoyaltyNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLoyaltyNotifications()
      .then(v => {
        if (!cancelled) {
          setItems(v);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
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
    <View style={styles.screen}>
      <ScreenHeader title="Notifications" />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={n => n.id}
          renderItem={({item}) => (
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  loader: {marginTop: spacing.lg},
  row: {padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: fontSize.lg, color: colors.text, fontWeight: '600'},
  body: {fontSize: fontSize.md, color: colors.muted, marginTop: spacing.xs},
  empty: {textAlign: 'center', color: colors.muted, marginTop: spacing.lg},
});
