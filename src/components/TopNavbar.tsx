import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSidebar} from '../context/SidebarContext';
import {fetchLoyaltyNotifications} from '../services/loyalty_service';
import {colors, fontSize, spacing} from '../theme';
import type {AppNavigationProp} from '../navigation/types';

/**
 * Top navbar on every authenticated page (mirrors the web Appnavbar):
 * hamburger (opens the side drawer) + title + notification bell (with unread
 * badge) + settings.
 */
export default function TopNavbar({title}: {title: string; back?: boolean}) {
  const navigation = useNavigation<AppNavigationProp>();
  const {openSidebar} = useSidebar();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchLoyaltyNotifications(50)
      .then(list => {
        if (!cancelled) {
          setUnread(list.filter(n => !n.is_read).length);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.side} onPress={openSidebar}>
        <Text style={styles.hamburger}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('LoyaltyNotifications')}>
          <View>
            <Text style={styles.icon}>🔔</Text>
            {unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('LoyaltySettings')}>
          <Text style={styles.icon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  side: {minWidth: 40, alignItems: 'flex-start'},
  hamburger: {fontSize: 22, color: colors.text, fontWeight: '700'},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {flexDirection: 'row', minWidth: 56, justifyContent: 'flex-end'},
  iconBtn: {paddingHorizontal: spacing.xs},
  icon: {fontSize: 18},
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {color: colors.white, fontSize: 10, fontWeight: '700'},
});
