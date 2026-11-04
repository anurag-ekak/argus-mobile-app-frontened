import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useSidebar} from '../context/SidebarContext';
import {resolveUsecaseIcon} from '../lib/usecaseIcons';
import {navigateTo, navigationRef} from '../navigation/navigationRef';
import {colors, fontSize, radius, spacing} from '../theme';

function initialsOf(name: string | undefined, email: string | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return (email?.[0] ?? 'U').toUpperCase();
}

/**
 * Side drawer — mirrors the web AppSidebar: "Overview" + the usecase
 * ("Loyalty Program") with its child tabs (Loyalty List / Visitors List /
 * Today's Arrival). Uses emoji glyphs to stay dependency-free.
 */
export default function SidebarDrawer() {
  const {open, closeSidebar} = useSidebar();
  const {user, role, logout} = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [active, setActive] = useState('');
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (open) {
      translateX.setValue(-300);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [open, translateX]);

  useEffect(() => {
    const update = () => {
      const r = navigationRef.getCurrentRoute() as
        | {name?: string; state?: {index?: number; routes?: {name: string}[]}}
        | undefined;
      const name = r?.name ?? '';
      if (name === 'MainTabs') {
        const s = r?.state;
        setActive(`tab:${s?.routes?.[s?.index ?? 0]?.name ?? ''}`);
      } else {
        setActive(name);
      }
    };
    update();
    return navigationRef.addListener('state', update);
  }, []);

  if (!open) {
    return null;
  }

  const go = (action: () => void) => {
    closeSidebar();
    action();
  };

  const loyaltyActive =
    active === 'LoyaltyList' || active === 'Visitors' || active === 'tab:Loyalty';

  return (
    <Modal transparent visible animationType="fade" onRequestClose={closeSidebar}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeSidebar} />
        <Animated.View style={[styles.panel, {transform: [{translateX}]}]}>
          <View style={styles.header}>
            <Text style={styles.brand}>ARGUS</Text>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initialsOf(user?.name, user?.email)}
                </Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name ?? user?.email ?? 'Account'}
                </Text>
                <Text style={styles.userRole}>
                  {role ? role.replace(/_/g, ' ') : ''}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.body}>
            <TouchableOpacity
              style={[styles.item, active === 'tab:Home' && styles.itemActive]}
              onPress={() => go(() => navigateTo('MainTabs', {screen: 'Home'}))}>
              <Text style={styles.itemIcon}>{resolveUsecaseIcon('home')}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  active === 'tab:Home' && styles.itemLabelActive,
                ]}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, loyaltyActive && styles.itemActive]}
              onPress={() => setExpanded(v => !v)}>
              <Text style={styles.itemIcon}>{resolveUsecaseIcon('award')}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  loyaltyActive && styles.itemLabelActive,
                ]}>
                Loyalty Program
              </Text>
              <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
            </TouchableOpacity>

            {expanded ? (
              <View style={styles.children}>
                <TouchableOpacity
                  style={[styles.item, styles.childItem, active === 'LoyaltyList' && styles.itemActive]}
                  onPress={() => go(() => navigateTo('LoyaltyList'))}>
                  <Text style={styles.itemIcon}>{resolveUsecaseIcon('users')}</Text>
                  <Text style={[styles.itemLabel, active === 'LoyaltyList' && styles.itemLabelActive]}>
                    Loyalty List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.item, styles.childItem, active === 'Visitors' && styles.itemActive]}
                  onPress={() => go(() => navigateTo('Visitors'))}>
                  <Text style={styles.itemIcon}>{resolveUsecaseIcon('footprints')}</Text>
                  <Text style={[styles.itemLabel, active === 'Visitors' && styles.itemLabelActive]}>
                    Visitors List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.item, styles.childItem, active === 'tab:Today' && styles.itemActive]}
                  onPress={() => go(() => navigateTo('MainTabs', {screen: 'Today'}))}>
                  <Text style={styles.itemIcon}>{resolveUsecaseIcon('calendar-clock')}</Text>
                  <Text style={[styles.itemLabel, active === 'tab:Today' && styles.itemLabelActive]}>
                    Today's Arrival
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            style={styles.logout}
            onPress={() => go(() => logout())}>
            <Text style={styles.logoutLabel}>Log out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, flexDirection: 'row'},
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  panel: {
    width: 290,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {fontSize: fontSize.xxl, fontWeight: '800', color: colors.text},
  userRow: {flexDirection: 'row', alignItems: 'center', marginTop: spacing.md},
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {color: colors.white, fontWeight: '700', fontSize: fontSize.sm},
  userMeta: {flex: 1},
  userName: {fontSize: fontSize.md, fontWeight: '600', color: colors.text},
  userRole: {fontSize: fontSize.sm, color: colors.muted, textTransform: 'capitalize'},
  body: {flex: 1, padding: spacing.sm},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  itemActive: {backgroundColor: colors.text},
  itemIcon: {fontSize: 16, marginRight: spacing.sm},
  itemLabel: {flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '600'},
  itemLabelActive: {color: colors.white},
  chevron: {fontSize: fontSize.md, color: colors.muted},
  children: {paddingLeft: spacing.md, borderLeftWidth: 1, borderLeftColor: colors.border, marginLeft: spacing.md},
  childItem: {paddingVertical: spacing.sm},
  logout: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutLabel: {color: colors.danger, fontWeight: '600', fontSize: fontSize.md},
});
