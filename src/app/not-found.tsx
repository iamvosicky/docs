'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Loading component for Suspense fallback
function NotFoundLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      <p>Please wait while we load the page.</p>
    </div>
  );
}

// Main component content
function NotFoundContent() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4">404 - Stránka nenalezena</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Omlouváme se, ale stránka, kterou hledáte, neexistuje.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
      >
        Zpět na hlavní stránku
      </Link>
    </div>
  );
}

// Export the component wrapped in Suspense
export default function NotFound() {
  // We don't actually use searchParams here, but we need to wrap it in Suspense
  // because Next.js detected that we're using useSearchParams() somewhere
  const searchParams = useSearchParams();
  
  return (
    <Suspense fallback={<NotFoundLoading />}>
      <NotFoundContent />
    </Suspense>
  );
}
