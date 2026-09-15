import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../../api/modules/auth';
import type { UserDto } from '../../api/modules/auth';
import * as meApi from '../../api/modules/me';
import { clearCurrentUser, getCurrentUser, setCurrentUser } from '../../api/session';
import { clearTokens } from '../../api/tokenStore';

type AuthContextValue = {
  user: UserDto | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { inviteCode: string; email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (input: { name: string | null; showGoals: boolean }) => Promise<void>;
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => getCurrentUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async (input) => setUser(await authApi.login(input)),
      register: async (input) => setUser(await authApi.register(input)),
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
      updatePreferences: async (input) => {
        const updated = await meApi.updatePreferences(input);
        setCurrentUser(updated);
        setUser(updated);
      },
      // The backend revokes every session on a password change (PLAN.md
      // decision #10), including this one — clear local auth state to match.
      changePassword: async (input) => {
        await meApi.changePassword(input);
        clearTokens();
        clearCurrentUser();
        setUser(null);
      },
      deleteAccount: async () => {
        await meApi.deleteAccount();
        clearTokens();
        clearCurrentUser();
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
