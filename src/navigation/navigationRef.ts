import {CommonActions, createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './types';

/** App-wide navigation ref so the side drawer (outside the navigator) can
 *  navigate without a useNavigation hook. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateTo(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(name, params));
  }
}
