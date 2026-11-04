import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Loyalty: undefined;
  Today: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  LoyaltyProfile: {memberId: string};
  LoyaltyOnboarding: {visitorId?: string; nodeId?: string} | undefined;
  Visitors: undefined;
  EligibleCandidates: undefined;
  LoyaltyNotifications: undefined;
  LoyaltyList: undefined;
  LoyaltySettings: undefined;
};

/** Navigation available to screens rendered inside a tab (can also push root-stack screens). */
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
