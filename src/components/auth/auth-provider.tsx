'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: (redirectUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    fetchUser();

    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Prihlaseni se nezdarilo' };
      }

      setUser(data.user);
      window.dispatchEvent(new Event('auth-change'));
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Chyba pripojeni k serveru' };
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const returnUrl = searchParams?.get('returnUrl') || '/app';
    window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(returnUrl)}`;
  };

  const loginWithApple = async (): Promise<void> => {
    const returnUrl = searchParams?.get('returnUrl') || '/app';
    window.location.href = `/api/auth/signin/apple?callbackUrl=${encodeURIComponent(returnUrl)}`;
  };

  const logout = async (redirectUrl = '/login') => {
    try {
      await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
      setUser(null);
      window.dispatchEvent(new Event('auth-change'));
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
