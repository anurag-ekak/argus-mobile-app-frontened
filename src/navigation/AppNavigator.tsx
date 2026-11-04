import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {getUsecaseModuleByCode} from '../lib/usecaseRegistry';
import {navigationRef} from './navigationRef';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AppTabs from './AppTabs';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Resolved once at module load — the generated manifest is populated at build
// time (npm run gen runs before typecheck). Core never imports the pack folder.
const loyalty = getUsecaseModuleByCode('loyalty_program');

function Unavailable({label}: {label: string}) {
  return (
    <View style={styles.center}>
      <Text style={styles.unavailable}>{label} unavailable</Text>
    </View>
  );
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

const LoyaltyProfileScreen = makeScreen(loyalty?.profile, 'Loyalty Profile');
const LoyaltyOnboardingScreen = makeScreen(
  loyalty?.childPages?.onboarding,
  'Loyalty Onboarding',
);
const VisitorsScreen = makeScreen(loyalty?.childPages?.visitors, 'Visitors');
const EligibleCandidatesScreen = makeScreen(
  loyalty?.childPages?.eligible,
  'Eligible Candidates',
);
const LoyaltyNotificationsScreen = makeScreen(
  loyalty?.childPages?.notifications,
  'Notifications',
);
const LoyaltyListScreen = makeScreen(loyalty?.childPages?.loyalty, 'Loyalty List');
const SettingsComponent = loyalty?.settings;
function LoyaltySettingsScreen() {
  return SettingsComponent ? (
    <SettingsComponent useCaseId="" />
  ) : (
    <Unavailable label="Loyalty Settings" />
  );
}

export default function AppNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={AppTabs} />
            <Stack.Screen name="LoyaltyProfile" component={LoyaltyProfileScreen} />
            <Stack.Screen name="LoyaltyOnboarding" component={LoyaltyOnboardingScreen} />
            <Stack.Screen name="Visitors" component={VisitorsScreen} />
            <Stack.Screen
              name="EligibleCandidates"
              component={EligibleCandidatesScreen}
            />
            <Stack.Screen
              name="LoyaltyNotifications"
              component={LoyaltyNotificationsScreen}
            />
            <Stack.Screen name="LoyaltyList" component={LoyaltyListScreen} />
            <Stack.Screen
              name="LoyaltySettings"
              component={LoyaltySettingsScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  unavailable: {color: '#6B7280', fontSize: 14},
});
