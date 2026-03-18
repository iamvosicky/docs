'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = pathname?.startsWith('/app');
  const isAuthRoute = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  // App routes have their own layout (sidebar + topbar)
  // Auth routes have their own layout (centered, minimal header)
  if (isAppRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 DocGen. Všechna práva vyhrazena.
            </p>
            <p className="text-xs text-muted-foreground">
              Next.js &middot; Cloudflare
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
