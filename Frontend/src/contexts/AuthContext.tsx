import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, type AuthUser, type GoogleAuthResult, type GoogleRegistrationInput, type ProfileInput, type RegistrationResponse } from '../services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: FormData) => Promise<RegistrationResponse>;
  authenticateWithGoogle: (credential: string, intent: 'login' | 'register') => Promise<GoogleAuthResult>;
  registerWithGoogle: (data: GoogleRegistrationInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi.getSession()
      .then(({ user: sessionUser }) => setUser(sessionUser))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (email, password) => {
      const { user: sessionUser } = await authApi.login({ email, password });
      setUser(sessionUser);
    },
    register: async (data) => {
      return await authApi.register(data);
    },
    authenticateWithGoogle: async (credential, intent) => {
      const result = await authApi.authenticateWithGoogle(credential, intent);
      if ('user' in result) setUser(result.user);
      return result;
    },
    registerWithGoogle: async (data) => {
      const { user: sessionUser } = await authApi.registerWithGoogle(data);
      setUser(sessionUser);
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
    },
    updateProfile: async (data) => {
      const { user: updatedUser } = await authApi.updateProfile(data);
      setUser(updatedUser);
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
};
