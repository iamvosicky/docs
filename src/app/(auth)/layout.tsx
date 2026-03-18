import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[16px] tracking-tight">DocGen</span>
        </Link>
      </header>

      {/* Centered auth content */}
      <main className="flex-1 flex items-center justify-center pb-16">
        {children}
      </main>
    </div>
  );
}
