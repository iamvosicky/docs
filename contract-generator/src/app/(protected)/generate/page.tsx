'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';

function GenerateRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const template = searchParams?.get('template');
    const templates = searchParams?.get('templates');

    if (template) {
      // Single template → go to template detail page
      router.replace(`/template/${template}`);
    } else if (templates) {
      // Multiple templates → go to multi-document form
      router.replace(`/multi-document/form?templates=${templates}`);
    } else {
      // No template specified → back to home to pick one
      router.replace('/');
    }
  }, [router, searchParams]);

  return <LoadingPage />;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <GenerateRedirect />
    </Suspense>
  );
}
