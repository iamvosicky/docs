'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/auth/auth-provider';
import { useSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor, LogOut, User, Settings, Menu, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function AppTopbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setMobileOpen } = useSidebar();

  const handleLogout = () => {
    logout();
    toast.success('Odhlášení proběhlo úspěšně');
  };

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

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-7 w-7 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt={user?.name || 'User'} />
                <AvatarFallback className="bg-secondary text-muted-foreground text-[11px] font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
            <div className="px-2 py-2 mb-1">
              <p className="text-sm font-medium">{user?.name || 'Uživatel'}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2 text-[13px]">
              <Link href="/app/settings">
                <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2 text-[13px]">
              <Link href="/app/settings">
                <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Nastavení
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal uppercase tracking-wider">Motiv</DropdownMenuLabel>
            <div className="flex gap-0.5 px-1.5 py-1">
              {[
                { key: 'light', icon: Sun, label: 'Světlý' },
                { key: 'dark', icon: Moon, label: 'Tmavý' },
                { key: 'system', icon: Monitor, label: 'Auto' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-colors ${
                    theme === key ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2 text-[13px] text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Odhlásit se
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
