'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie, setCookie, deleteCookie, triggerAuthChangeEvent } from '@/lib/auth-utils';
import { signIn, signOut, useSession } from 'next-auth/react';

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
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle NextAuth session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session && session.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || 'user@example.com',
        name: session.user.name || 'User',
        role: session.user.role || 'user',
        image: session.user.image,
      });
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated with our custom cookie
    const checkAuth = () => {
      try {
        // Use our utility function to check for the auth token
        const authToken = getCookie('auth-token');
        const hasAuthToken = !!authToken;

        if (hasAuthToken) {
          // In a real implementation, we would decode the JWT token
          // or fetch the user data from an API
          // For now, we'll use a placeholder user
          setUser({
            email: 'user@example.com',
            name: 'User',
            role: 'admin',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      checkAuth();

      // Listen for cookie changes
      const handleStorageChange = () => {
        checkAuth();
      };

      // Listen for storage events (for cross-tab synchronization)
      window.addEventListener('storage', handleStorageChange);

      // Listen for custom auth change events
      window.addEventListener('authChange', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authChange', handleStorageChange);
      };
    } else {
      // Server-side rendering - set loading to false
      setIsLoading(false);
    }
  }, [session, status]);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Set a cookie with the auth token
      setCookie('auth-token', 'demo-token', {
        maxAge: 86400,
        SameSite: 'Lax'
      });

      // Set user data
      setUser({
        email,
        name: email.split('@')[0],
        role: 'admin',
      });

      // Trigger auth change events
      triggerAuthChangeEvent();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get the return URL from the search params or use the homepage
      const returnUrl = searchParams?.get('returnUrl') || '/';

      // Use NextAuth to sign in with Google
      await signIn('google', { callbackUrl: returnUrl });
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get the return URL from the search params or use the homepage
      const returnUrl = searchParams?.get('returnUrl') || '/';

      // Use NextAuth to sign in with Apple
      await signIn('apple', { callbackUrl: returnUrl });
    } catch (error) {
      console.error('Apple login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear the auth cookie
      deleteCookie('auth-token', { SameSite: 'Lax' });

      // Sign out from NextAuth
      signOut({ callbackUrl: '/login' });

      // Clear user data
      setUser(null);

      // Trigger auth change events
      triggerAuthChangeEvent();
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
