'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/app';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Přihlášení se nezdařilo');
        setIsLoading(false);
        return;
      }

      // Cookie is set by the server (HttpOnly) — trigger client-side event
      window.dispatchEvent(new Event('auth-change'));

      router.push(returnUrl);
      router.refresh();
    } catch {
      setError('Chyba připojení k serveru');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 hero-gradient">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.6_0.2_310)] items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vitejte zpet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prihlaste se pro pristup k dokumentum
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-11"
              onClick={() => {
                // TODO: Implement real Google OAuth via NextAuth
                window.location.href = '/api/auth/signin/google';
              }}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11"
              onClick={() => {
                // TODO: Implement real Apple OAuth via NextAuth
                window.location.href = '/api/auth/signin/apple';
              }}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">nebo e-mailem</span>
            </div>
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                placeholder="vas@email.cz"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                placeholder="Heslo"
                required
                minLength={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Prihlasovani...
                </>
              ) : (
                <>
                  Prihlasit se
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Demo: admin@docs.cz / admin123</p>
            <p>Demo: user@docs.cz / user123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Prihlasenim souhlasit s{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            podminkami pouziti
          </Link>{' '}
          a{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            ochranou udaju
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
