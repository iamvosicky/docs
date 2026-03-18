'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AppSidebar, MobileSidebar, SidebarProvider } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { LoadingPage } from '@/components/ui/loading';

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setShow(false);
      prevPath.current = pathname;
      const frame = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setShow(true);
    }
  }, [pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  // Middleware handles redirect — just show loading until Clerk loads
  if (!isLoaded || !isSignedIn) {
    return <LoadingPage />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <MobileSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar />
          <main id="main-content" className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
