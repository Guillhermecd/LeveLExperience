import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../../api/modules/auth';
import type { UserDto } from '../../api/modules/auth';
import { getCurrentUser } from '../../api/session';

type AuthContextValue = {
  user: UserDto | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { inviteCode: string; email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
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
