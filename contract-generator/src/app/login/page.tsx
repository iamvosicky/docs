'use client';

import { SignIn } from '@/components/auth/sign-in';
import { useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Contract Generator</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Vítejte zpět</h1>
          <p className="text-muted-foreground mt-1">Přihlaste se pro přístup k dokumentům</p>
        </div>

        <SignIn returnUrl={returnUrl} />
      </div>
    </div>
  );
}
