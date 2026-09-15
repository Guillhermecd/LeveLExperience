import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../../api/modules/auth';
import type { UserDto } from '../../api/modules/auth';
import * as meApi from '../../api/modules/me';
import { getCurrentUser, setCurrentUser } from '../../api/session';

type AuthContextValue = {
  user: UserDto | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { inviteCode: string; email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => getCurrentUser());

  useEffect(() => {
    // The cached user (from a previous login/register response) can be
    // stale after a long session — refresh preferences like showGoals
    // against the server once on boot (PLAN.md Fase 5).
    if (!user) return;
    let cancelled = false;
    meApi
      .getMe()
      .then((fresh) => {
        if (cancelled) return;
        setCurrentUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        // Keep the cached user; the board itself will surface any auth failure.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount, not on every user change
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async (input) => setUser(await authApi.login(input)),
      register: async (input) => setUser(await authApi.register(input)),
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
