import {Platform} from 'react-native';

/**
 * API base URL. Config-only — never hardcode this value inside feature code.
 *
 * Android emulator reaches the host machine via 10.0.2.2; iOS simulator and
 * physical devices use the LAN address. Override per environment before a
 * device build (same rule as the web app's NEXT_PUBLIC_API_URL).
 */
const LAN_API_URL = 'http://localhost:8000';

export const API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : LAN_API_URL;
