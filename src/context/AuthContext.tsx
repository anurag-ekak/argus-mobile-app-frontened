import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {apiFetch, clearAuthTokens, getRefreshToken, setAuthTokens} from '../lib/api';
import {API_ROUTES} from '../config/api_routes';
import type {
  AppRole,
  LoginPayload,
  MeResponse,
  Organization,
  Scope,
  User,
} from '../types/auth';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  permissions: string[];
  scope: Scope | null;
  role: AppRole | null;
  can: (code: string) => boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Role identification ("Identify User Role" in the board), derived from the
 * server-computed session — never hardcoded:
 *   - scope.root_visible === true            → super_admin (org-wide)
 *   - loyalty.edit / loyalty.onboard granted → managerial (node-scoped)
 *   - otherwise                              → waiter (node-scoped, read-only)
 */
export function deriveRole(
  user: User | null,
  permissions: string[],
  scope: Scope | null,
): AppRole | null {
  if (!user) {
    return null;
  }
  if (scope?.root_visible) {
    return 'super_admin';
  }
  if (
    permissions.includes('loyalty.edit') ||
    permissions.includes('loyalty.onboard')
  ) {
    return 'managerial';
  }
  return 'waiter';
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(true);

  const role = deriveRole(user, permissions, scope);

  const refreshSession = async () => {
    const clearState = () => {
      setUser(null);
      setOrganization(null);
      setPermissions([]);
      setScope(null);
    };
    const applySession = (data: MeResponse) => {
      setUser(data.user);
      setOrganization(data.organization);
      setPermissions(data.permissions ?? []);
      setScope(data.scope ?? null);
    };
    try {
      applySession(await apiFetch<MeResponse>(API_ROUTES.AUTH.ME));
    } catch {
      const rt = getRefreshToken();
      if (rt) {
        try {
          const refreshed = await apiFetch<{
            access_token: string;
            refresh_token: string;
          }>(API_ROUTES.AUTH.REFRESH, {
            method: 'POST',
            body: {refresh_token: rt},
          });
          setAuthTokens(refreshed.access_token, refreshed.refresh_token);
          applySession(await apiFetch<MeResponse>(API_ROUTES.AUTH.ME));
        } catch {
          clearState();
        }
      } else {
        clearState();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload) => {
    const res = await apiFetch<{access_token: string; refresh_token: string}>(
      API_ROUTES.AUTH.LOGIN,
      {method: 'POST', body: payload},
    );
    setAuthTokens(res.access_token, res.refresh_token);
    await refreshSession();
  };

  const logout = async () => {
    try {
      const rt = getRefreshToken();
      await apiFetch(API_ROUTES.AUTH.LOGOUT, {
        method: 'POST',
        body: rt ? {refresh_token: rt} : undefined,
      });
    } catch {
      // session already gone — ignore
    } finally {
      clearAuthTokens();
      setUser(null);
      setOrganization(null);
      setPermissions([]);
      setScope(null);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const can = (code: string) => permissions.includes(code);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        permissions,
        scope,
        role,
        can,
        loading,
        login,
        logout,
        refreshSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
