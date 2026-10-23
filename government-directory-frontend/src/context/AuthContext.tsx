import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { UserProfile } from '../types';
import { authApi, tokenStore } from '../services/api';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => tokenStore.getUser());
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.get()) { setUser(null); setLoading(false); return; }
    try {
      const profile = await authApi.profile();
      tokenStore.setUser(profile);
      setUser(profile);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refreshProfile(); }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    tokenStore.set(result.accessToken);
    tokenStore.setUser(result.user);
    setUser(result.user);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut, refreshProfile }), [user, loading, signIn, signOut, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}