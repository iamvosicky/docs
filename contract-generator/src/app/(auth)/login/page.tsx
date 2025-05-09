'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn } from "@/components/auth/sign-in";
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingPage } from '@/components/ui/loading';

// Client component that uses useSearchParams
function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isClient, isLoading, isAuthenticated, router, returnUrl]);

  return (
    <div className="container mx-auto px-4 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
        <div className="flex flex-col space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Sign in to access the contract generation platform
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <SignIn returnUrl={returnUrl} />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Contact your administrator
          </a>
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginContent />
    </Suspense>
  );
}
