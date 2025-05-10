'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="default"
          >
            Go to Home
          </Button>
        </div>
      </body>
    </html>
  );
}
