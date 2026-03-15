'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, FileText, FolderOpen, Sparkles, Layers,
  Users, Settings, Activity, Plus, ChevronLeft, ChevronRight,
  FileText as LogoIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, createContext, useContext } from 'react';

// ─── Sidebar context ───
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Nav items ───
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/templates', label: 'Šablony', icon: FileText },
  { href: '/app/documents', label: 'Dokumenty', icon: FolderOpen },
  { href: '/app/sets', label: 'Sady', icon: Layers },
  { href: '/app/import', label: 'AI Import', icon: Sparkles },
];

const teamNav: NavItem[] = [
  { href: '/app/team', label: 'Uživatelé', icon: Users },
];

const systemNav: NavItem[] = [
  { href: '/app/settings', label: 'Nastavení', icon: Settings },
  { href: '/app/activity', label: 'Aktivita', icon: Activity, adminOnly: true },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/app' && pathname?.startsWith(item.href + '/'));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground')} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function NavSection({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  const { isAdmin } = useAuth();
  const filtered = items.filter(i => !i.adminOnly || isAdmin);
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
          {label}
        </p>
      )}
      {collapsed && <div className="pt-3" />}
      {filtered.map(item => (
        <NavLink key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

// ─── Sidebar ───
export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-card/30 h-screen sticky top-0 transition-all duration-200 shrink-0 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both',
        collapsed ? 'w-[64px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 shrink-0', collapsed ? 'justify-center px-2' : 'px-4')}>
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <LogoIcon className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-semibold text-[15px] tracking-tight">DocGen</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <NavSection label="Hlavní" items={mainNav} collapsed={collapsed} />
        <NavSection label="Tým" items={teamNav} collapsed={collapsed} />
        <NavSection label="Systém" items={systemNav} collapsed={collapsed} />
      </nav>

      {/* Bottom */}
      <div className={cn('p-2 space-y-2 shrink-0')}>
        <Button
          asChild
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full rounded-xl text-[13px]', collapsed && 'h-8 w-8')}
        >
          <Link href="/app/templates">
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-1">Nový dokument</span>}
          </Link>
        </Button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Skrýt</span>
            </>
          )}
        </button>
      </div>

      {/* User */}
      {!collapsed && user && (
        <div className="border-t px-3 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium truncate leading-tight">{user.name || 'Uživatel'}</p>
              <p className="text-[10px] text-muted-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Mobile sidebar ───
export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { user, isAdmin } = useAuth();

  if (!mobileOpen) return null;

  const allItems = [
    ...mainNav,
    ...teamNav,
    ...systemNav.filter(i => !i.adminOnly || isAdmin),
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
        onClick={() => setMobileOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-[260px] bg-card border-r shadow-xl md:hidden flex flex-col animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <LogoIcon className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">DocGen</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {allItems.map(item => (
            <NavLink key={item.href} item={item} collapsed={false} />
          ))}
        </nav>

        <div className="border-t p-3 space-y-3">
          <Button asChild className="w-full rounded-xl text-[13px]">
            <Link href="/app/templates">
              <Plus className="h-4 w-4 mr-1.5" />
              Nový dokument
            </Link>
          </Button>

          {user && (
            <div className="flex items-center gap-2.5 px-1">
              <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate">{user.name || 'Uživatel'}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
