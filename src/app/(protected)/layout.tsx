'use client';

import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '@/components/ui/loading';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  // Middleware handles redirect — just show loading until Clerk loads
  if (!isLoaded || !isSignedIn) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {children}
    </div>
  );
}
