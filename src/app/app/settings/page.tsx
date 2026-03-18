'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  User, Building2, Users, CreditCard, ArrowRight, Mail, Shield
} from 'lucide-react';

interface SettingsSection {
  label: string;
  items: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    disabled?: boolean;
    badge?: string;
  }[];
}

const sections: SettingsSection[] = [
  {
    label: 'Osobní',
    items: [
      {
        href: '/app/settings/profile',
        icon: User,
        title: 'Profil',
        description: 'Jméno, email a heslo',
      },
    ],
  },
  {
    label: 'Organizace',
    items: [
      {
        href: '/app/settings/organization',
        icon: Building2,
        title: 'Firma',
        description: 'Název, IČO, adresa, fakturační údaje',
      },
      {
        href: '/app/settings/team',
        icon: Users,
        title: 'Tým',
        description: 'Členové, role a pozvánky',
      },
    ],
  },
  {
    label: 'Předplatné',
    items: [
      {
        href: '/app/settings/billing',
        icon: CreditCard,
        title: 'Fakturace',
        description: 'Plán, platby a faktury',
        disabled: true,
        badge: 'Připravujeme',
      },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="pt-4 pb-8">
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-foreground">Nastavení</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Konfigurace účtu a organizace</p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.label}>
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.label}
            </h2>
            <div className="rounded-xl bg-card border border-border/50 divide-y divide-border/40">
              {section.items.map(item => {
                const Icon = item.icon;
                const inner = (
                  <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    item.disabled
                      ? 'opacity-40'
                      : 'hover:bg-accent/30 cursor-pointer'
                  } first:rounded-t-xl last:rounded-b-xl`}>
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-medium text-foreground">{item.title}</h3>
                        {item.badge && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                  </div>
                );

                if (item.disabled) return <div key={item.title}>{inner}</div>;
                return <Link key={item.title} href={item.href}>{inner}</Link>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
