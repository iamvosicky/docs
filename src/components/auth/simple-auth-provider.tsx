'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie, setCookie, deleteCookie, triggerAuthChangeEvent } from '@/lib/auth-utils';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // We're now using the imported utility functions

  // Check if user is authenticated with our custom cookie
  useEffect(() => {
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

    // Check auth on mount
    checkAuth();

    // Listen for auth change events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
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

      // In a real implementation, we would redirect to Google OAuth
      // For now, we'll simulate a successful login

      // Set a cookie with the auth token
      setCookie('auth-token', 'google-demo-token', {
        maxAge: 86400,
        SameSite: 'Lax'
      });

      // Set user data
      setUser({
        id: 'google-user-id',
        email: 'google-user@example.com',
        name: 'Google User',
        role: 'user',
        image: 'https://via.placeholder.com/150',
      });

      // Redirect to the return URL
      router.push(returnUrl);
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

      // In a real implementation, we would redirect to Apple OAuth
      // For now, we'll simulate a successful login

      // Set a cookie with the auth token
      setCookie('auth-token', 'apple-demo-token', {
        maxAge: 86400,
        SameSite: 'Lax'
      });

      // Set user data
      setUser({
        id: 'apple-user-id',
        email: 'apple-user@example.com',
        name: 'Apple User',
        role: 'user',
        image: 'https://via.placeholder.com/150',
      });

      // Redirect to the return URL
      router.push(returnUrl);
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

      // Clear user data
      setUser(null);

      // Redirect to login page
      router.push('/login');
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
