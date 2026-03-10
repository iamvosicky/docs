'use client';

import Link from 'next/link';
import { Settings, Building2, FileText, User, ChevronRight } from 'lucide-react';

const settingsItems = [
  {
    href: '/app/settings/entities',
    icon: Building2,
    title: 'Subjekty',
    description: 'Uložené firmy a osoby pro rychlé vyplňování dokumentů',
  },
  {
    href: '/app/settings',
    icon: User,
    title: 'Profil',
    description: 'Vaše osobní údaje a nastavení účtu',
    disabled: true,
  },
  {
    href: '/app/settings',
    icon: FileText,
    title: 'Šablony formulářů',
    description: 'Uložené konfigurace formulářů pro rychlé generování',
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Nastavení</h1>
        <p className="text-xs text-muted-foreground mt-1">Konfigurace a profily</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className={`flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors ${item.disabled ? 'opacity-50' : 'hover:bg-muted/30 cursor-pointer'}`}>
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          );

          if (item.disabled) return <div key={item.title}>{content}</div>;
          return <Link key={item.title} href={item.href}>{content}</Link>;
        })}
      </div>
    </div>
  );
}
