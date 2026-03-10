'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Trash2, Building2, User
} from 'lucide-react';
import { useEntityStore } from '@/lib/entity-store';
import { type CompanyData } from '@/types/saved-entity';
import {
  getAllTemplates, getCustomTemplates, deleteCustomTemplate,
  type CustomTemplate
} from '@/lib/template-schemas';
import { HomeQuickButtons } from '@/components/home-quick-buttons';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { entities } = useEntityStore();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý den' : 'Dobrý večer';

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string, name: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Šablona "${name}" smazána`);
  };

  const templates = [
    ...customTemplates.slice(0, 3).map(ct => ({
      key: `custom-${ct.id}`,
      name: ct.name,
      desc: `${ct.fields.length} polí · Vlastní`,
      href: `/app/generate?template=custom:${ct.id}`,
      icon: 'upload' as const,
      customId: ct.id,
      customName: ct.name,
    })),
    ...allTemplates.slice(0, customTemplates.length > 0 ? 4 : 6).map(t => ({
      key: `builtin-${t.id}`,
      name: t.name,
      desc: t.description,
      href: `/app/generate?template=${t.id}`,
      icon: 'file' as const,
      customId: null as string | null,
      customName: null as string | null,
    })),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div
        className="pt-2 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDuration: '350ms', animationDelay: '80ms' }}
      >
        <p className="text-sm font-medium text-muted-foreground/70 mb-0.5">{greeting},</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {user?.name || 'uživateli'}
        </h1>
      </div>

      {/* Document Sets */}
      <section
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDuration: '350ms', animationDelay: '160ms' }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Sady dokumentů</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Vyberte životní situaci a vygenerujte kompletní sadu</p>
        </div>
        <HomeQuickButtons />
      </section>

      {/* Saved Entities */}
      {entities.length > 0 && (
        <section
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDuration: '350ms', animationDelay: '240ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Subjekty</h2>
            <Link href="/app/settings/entities" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              Spravovat
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {entities.slice(0, 5).map(entity => (
              <div
                key={entity.id}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-card text-sm"
              >
                {entity.type === 'company' ? (
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium text-[13px]">{entity.label}</span>
                {entity.type === 'company' && (entity.data as CompanyData).ico && (
                  <span className="text-[11px] text-muted-foreground">IČ: {(entity.data as CompanyData).ico}</span>
                )}
                {entity.isDefault && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Výchozí</span>
                )}
              </div>
            ))}
            {entities.length > 5 && (
              <Link
                href="/app/settings/entities"
                className="inline-flex items-center px-3 py-2 rounded-xl border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                +{entities.length - 5} dalších
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Templates */}
      <section
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDuration: '350ms', animationDelay: `${entities.length > 0 ? 320 : 240}ms` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Šablony</h2>
          <Link href="/app/templates" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            Zobrazit vše
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          {templates.map((t, i) => (
            <div key={t.key} className={`flex items-center gap-3.5 px-4 py-3.5 group transition-colors hover:bg-accent/40 ${i > 0 ? 'border-t' : ''}`}>
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                {t.icon === 'upload' ? (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" asChild className="rounded-xl h-7 px-2.5 text-xs">
                  <Link href={t.href}>Použít</Link>
                </Button>
                {t.customId && (
                  <button
                    onClick={() => handleDeleteCustom(t.customId!, t.customName!)}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
