'use client';

import { UserManagement } from '@/components/dashboard/user-management';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield } from 'lucide-react';
import { useState } from 'react';

export default function TeamPage() {
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="pt-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tým</h1>
            <p className="text-[13px] text-muted-foreground/60 mt-1">Spravujte členy týmu a oprávnění</p>
          </div>
          <Button size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium shadow-sm">
            <UserPlus className="h-3.5 w-3.5" />
            Pozvat
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Permissions overview */}
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          className="w-full text-left rounded-2xl bg-card px-5 py-4 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02]"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-amber-500/70" />
            </div>
            <span className="text-[14px] font-medium flex-1">Přehled oprávnění</span>
            <span className="text-[12px] text-muted-foreground/50">{showPermissions ? 'Skrýt' : 'Zobrazit'}</span>
          </div>
        </button>

        {showPermissions && (
          <div className="rounded-2xl bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Oprávnění</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Admin</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Editor</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Čtenář</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { label: 'Generovat dokumenty', admin: true, editor: true, viewer: false },
                  { label: 'Spravovat šablony', admin: true, editor: true, viewer: false },
                  { label: 'AI Import', admin: true, editor: true, viewer: false },
                  { label: 'Stahovat dokumenty', admin: true, editor: true, viewer: true },
                  { label: 'Spravovat tým', admin: true, editor: false, viewer: false },
                  { label: 'Nastavení', admin: true, editor: false, viewer: false },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-3.5 text-[13px]">{row.label}</td>
                    <td className="text-center px-4 py-3.5 text-[13px] text-muted-foreground/60">{row.admin ? '✓' : '—'}</td>
                    <td className="text-center px-4 py-3.5 text-[13px] text-muted-foreground/60">{row.editor ? '✓' : '—'}</td>
                    <td className="text-center px-4 py-3.5 text-[13px] text-muted-foreground/60">{row.viewer ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User management */}
        <div className="rounded-2xl bg-card p-5">
          <UserManagement />
        </div>
      </div>
    </div>
  );
}
