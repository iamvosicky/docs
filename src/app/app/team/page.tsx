'use client';

import { UserManagement } from '@/components/dashboard/user-management';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Shield, Edit3, Eye } from 'lucide-react';
import { useState } from 'react';

export default function TeamPage() {
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Tým</h1>
          <p className="text-xs text-muted-foreground mt-1">Spravujte členy týmu a oprávnění</p>
        </div>
        <Button className="rounded-xl">
          <UserPlus className="h-4 w-4 mr-1.5" />
          Pozvat uživatele
        </Button>
      </div>

      {/* Permissions overview */}
      <button
        onClick={() => setShowPermissions(!showPermissions)}
        className="w-full text-left rounded-2xl border bg-muted/20 px-5 py-3 text-sm hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium">Přehled oprávnění</span>
          <span className="text-xs text-muted-foreground ml-auto">{showPermissions ? 'Skrýt' : 'Zobrazit'}</span>
        </div>
      </button>

      {showPermissions && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Oprávnění</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-primary">Admin</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-green-600 dark:text-green-400">Editor</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">Čtenář</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { label: 'Generovat dokumenty', admin: true, editor: true, viewer: false },
                { label: 'Spravovat šablony', admin: true, editor: true, viewer: false },
                { label: 'AI Import', admin: true, editor: true, viewer: false },
                { label: 'Stahovat dokumenty', admin: true, editor: true, viewer: true },
                { label: 'Spravovat tým', admin: true, editor: false, viewer: false },
                { label: 'Nastavení', admin: true, editor: false, viewer: false },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="px-5 py-2.5 text-sm">{row.label}</td>
                  <td className="text-center px-3 py-2.5">{row.admin ? '✓' : '—'}</td>
                  <td className="text-center px-3 py-2.5">{row.editor ? '✓' : '—'}</td>
                  <td className="text-center px-3 py-2.5">{row.viewer ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User management table */}
      <div className="rounded-2xl border bg-card p-5">
        <UserManagement />
      </div>
    </div>
  );
}
