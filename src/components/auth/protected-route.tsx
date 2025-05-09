'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { LoadingPage } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    // If admin only and user is not an admin, redirect to home
    if (!isLoading && adminOnly && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  // If not authenticated or (admin only and not admin), don't render children
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  // Render children if authenticated and has proper permissions
  return <>{children}</>;
}
