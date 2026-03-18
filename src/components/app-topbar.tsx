'use client';

import { useTheme } from 'next-themes';
import { useSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Sun, Moon, Menu, FileText } from 'lucide-react';
import Link from 'next/link';

export function AppTopbar() {
  const { theme, setTheme } = useTheme();
  const { setMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both">
      <div className="flex h-12 items-center px-4 gap-3">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg md:hidden text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>

        {/* Mobile logo */}
        <Link href="/app" className="flex items-center gap-2 md:hidden">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <FileText className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">DocGen</span>
        </Link>

        <div className="flex-1" />

        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Přepnout motiv</span>
        </Button>

        {/* Clerk User Button */}
        <UserButton />
      </div>
    </header>
  );
}
