'use client';

import Link from 'next/link';
import { Building2, FileText, User, ArrowRight } from 'lucide-react';

const settingsItems = [
  {
    href: '/app/settings/entities',
    icon: Building2,
    title: 'Subjekty',
    description: 'Uložené firmy a osoby pro rychlé vyplňování',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    iconColor: 'text-violet-500/70',
  },
  {
    href: '/app/settings',
    icon: User,
    title: 'Profil',
    description: 'Osobní údaje a nastavení účtu',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-500/70',
    disabled: true,
  },
  {
    href: '/app/settings',
    icon: FileText,
    title: 'Šablony formulářů',
    description: 'Uložené konfigurace pro rychlé generování',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-500/70',
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="pt-4 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Nastavení</h1>
        <p className="text-[13px] text-muted-foreground/60 mt-1">Konfigurace a profily</p>
      </div>

      <div className="space-y-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className={`flex items-center gap-4 rounded-2xl bg-card p-5 transition-all duration-200 ${
              item.disabled
                ? 'opacity-40'
                : 'hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5 cursor-pointer'
            }`}>
              <div className={`h-11 w-11 rounded-[14px] bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground/60 mt-0.5">{item.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
            </div>
          );

          if (item.disabled) return <div key={item.title}>{content}</div>;
          return <Link key={item.title} href={item.href}>{content}</Link>;
        })}
      </div>
    </div>
  );
}
