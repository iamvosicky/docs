'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingPage } from '@/components/ui/loading';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return <LoadingPage />;
  }

  // If not authenticated, don't render children (will redirect in useEffect)
  if (!isAuthenticated) {
    return <LoadingPage />;
  }

  // Render children if authenticated
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
}
