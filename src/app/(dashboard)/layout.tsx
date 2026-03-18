'use client';

import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '@/components/ui/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
}
