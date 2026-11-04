import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {getUsecaseModuleByCode} from '../lib/usecaseRegistry';
import OrgOverviewScreen from '../screens/home/OrgOverviewScreen';
import MyProfileScreen from '../screens/home/MyProfileScreen';
import {colors} from '../theme';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const loyalty = getUsecaseModuleByCode('loyalty_program');

function Unavailable({label}: {label: string}) {
  return <Text style={styles.unavailable}>{label} unavailable</Text>;
}

function makeScreen(
  Component: React.ComponentType | undefined,
  label: string,
): React.ComponentType {
  function Screen() {
    return Component ? <Component /> : <Unavailable label={label} />;
  }
  return Screen;
}

const LoyaltyOverviewTab = makeScreen(loyalty?.pages?.org, 'Loyalty Program');
const TodayTab = makeScreen(loyalty?.childPages?.arrivals, "Today's Arrival");

/**
 * Home tab is role-dependent:
 *   Super Admin    → Overview of Argus (core)
 *   Managerial     → Overview of Loyalty Program (pack pages.org)
 *   Waiter/Employee → Today's Loyal (pack childPages.arrivals)
 */
function HomeTab() {
  const {role} = useAuth();
  if (role === 'super_admin') {
    return <OrgOverviewScreen />;
  }
  if (role === 'managerial') {
    const Overview = loyalty?.pages?.org;
    return Overview ? (
      <Overview />
    ) : (
      <Unavailable label="Overview of Loyalty Program" />
    );
  }
  const Arrivals = loyalty?.childPages?.arrivals;
  return Arrivals ? <Arrivals /> : <Unavailable label="Today's Loyal" />;
}

function glyphIcon(glyph: string) {
  return function TabIcon({color}: {color: string}) {
    return <Text style={[styles.icon, {color}]}>{glyph}</Text>;
  };
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{tabBarIcon: glyphIcon('🏠')}}
      />
      <Tab.Screen
        name="Loyalty"
        component={LoyaltyOverviewTab}
        options={{tabBarIcon: glyphIcon('⭐')}}
      />
      <Tab.Screen
        name="Today"
        component={TodayTab}
        options={{tabBarIcon: glyphIcon('📅')}}
      />
      <Tab.Screen
        name="Profile"
        component={MyProfileScreen}
        options={{tabBarIcon: glyphIcon('👤')}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  unavailable: {padding: 16, color: colors.muted},
  icon: {fontSize: 18},
});
