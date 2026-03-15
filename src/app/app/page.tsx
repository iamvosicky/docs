'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Trash2, Building2, User,
  FolderOpen, Plus, Layers, Star
} from 'lucide-react';
import { useEntityStore } from '@/lib/entity-store';
import { type CompanyData } from '@/types/saved-entity';
import {
  getAllTemplates, getCustomTemplates, deleteCustomTemplate,
  type CustomTemplate
} from '@/lib/template-schemas';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { useStarredStore } from '@/lib/starred-store';
import { StarButton } from '@/components/star-button';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { entities } = useEntityStore();
  const { sets, toggleStar: toggleSetStar } = useDocumentSetStore();
  const { starredIds, toggle: toggleTemplateStar, isStarred: isTemplateStar } = useStarredStore();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isClient, setIsClient] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý den' : 'Dobrý večer';

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setIsClient(true);
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string, name: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Šablona "${name}" smazána`);
  };

  // Build template list
  const templates = [
    ...customTemplates.slice(0, 3).map(ct => ({
      key: `custom-${ct.id}`,
      id: `custom:${ct.id}`,
      name: ct.name,
      desc: `${ct.fields.length} polí · Vlastní`,
      href: `/app/generate?template=custom:${ct.id}`,
      icon: 'upload' as const,
      customId: ct.id,
      customName: ct.name,
    })),
    ...allTemplates.slice(0, customTemplates.length > 0 ? 4 : 6).map(t => ({
      key: `builtin-${t.id}`,
      id: t.id,
      name: t.name,
      desc: t.description,
      href: `/app/generate?template=${t.id}`,
      icon: 'file' as const,
      customId: null as string | null,
      customName: null as string | null,
    })),
  ];

  // Pinned items
  const starredSets = isClient ? sets.filter(s => s.isStarred) : [];
  const starredTemplateIds = isClient ? starredIds : [];
  const starredTemplateItems = starredTemplateIds
    .map(id => {
      const builtin = allTemplates.find(t => t.id === id);
      if (builtin) return { id, name: builtin.name, desc: builtin.description, href: `/app/generate?template=${id}` };
      const custom = customTemplates.find(ct => `custom:${ct.id}` === id);
      if (custom) return { id, name: custom.name, desc: `${custom.fields.length} polí`, href: `/app/generate?template=${id}` };
      return null;
    })
    .filter(Boolean) as { id: string; name: string; desc: string; href: string }[];
  const hasPinned = starredSets.length > 0 || starredTemplateItems.length > 0;

  let animDelay = 80;
  const nextDelay = () => { animDelay += 80; return `${animDelay}ms`; };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div
        className="pt-2 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDuration: '350ms', animationDelay: nextDelay() }}
      >
        <p className="text-sm font-medium text-muted-foreground/70 mb-0.5">{greeting},</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {user?.name || 'uživateli'}
        </h1>
      </div>

      {/* ★ Pinned */}
      {isClient && hasPinned && (
        <section
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDuration: '350ms', animationDelay: nextDelay() }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-semibold">Připnuto</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {starredSets.map(docSet => (
              <Link
                key={`pin-set-${docSet.id}`}
                href={`/app/sets/${docSet.id}`}
                className="group relative rounded-2xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{docSet.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {docSet.templateIds.length} {docSet.templateIds.length === 1 ? 'dokument' : docSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}
                      </p>
                    </div>
                  </div>
                  <StarButton starred onToggle={() => toggleSetStar(docSet.id)} />
                </div>
                {docSet.templateIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {docSet.templateIds.slice(0, 3).map(tid => {
                      const t = allTemplates.find(x => x.id === tid) || customTemplates.find(x => `custom:${x.id}` === tid);
                      return (
                        <span key={tid} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground truncate max-w-[120px]">
                          {t ? ('name' in t ? t.name : '') : tid}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Link>
            ))}
            {starredTemplateItems.map(item => (
              <Link
                key={`pin-tpl-${item.id}`}
                href={item.href}
                className="group relative rounded-2xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <StarButton starred onToggle={() => toggleTemplateStar(item.id)} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Document Sets */}
      {isClient && (
        <section
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDuration: '350ms', animationDelay: nextDelay() }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sady dokumentů</h2>
            <Link href="/app/sets" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              {sets.length > 0 ? 'Zobrazit vše' : 'Vytvořit'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {sets.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/50 p-6 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Žádné sady</p>
              <p className="text-xs text-muted-foreground mb-3">
                Seskupte dokumenty a sdílejte data mezi nimi
              </p>
              <Link href="/app/sets">
                <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs">
                  <Plus className="h-3 w-3" />
                  Vytvořit sadu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-visible">
              {sets.slice(0, 5).map((docSet, i) => (
                <div key={docSet.id} className={`flex items-center gap-3.5 px-4 py-3.5 group transition-colors hover:bg-accent/40 ${i > 0 ? 'border-t' : ''}`}>
                  <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/app/sets/${docSet.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                      {docSet.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {docSet.templateIds.length === 0
                        ? 'Prázdná sada'
                        : `${docSet.templateIds.length} ${docSet.templateIds.length === 1 ? 'dokument' : docSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarButton
                      starred={!!docSet.isStarred}
                      onToggle={() => toggleSetStar(docSet.id)}
                    />
                    {docSet.templateIds.length > 0 && (
                      <Button variant="ghost" size="sm" asChild className="rounded-xl h-7 px-2.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/app/generate?template=${docSet.templateIds.join(',')}`}>Generovat</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {sets.length > 5 && (
                <div className="border-t px-4 py-2.5 text-center">
                  <Link href="/app/sets" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    +{sets.length - 5} dalších sad
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Saved Entities */}
      {entities.length > 0 && (
        <section
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDuration: '350ms', animationDelay: nextDelay() }}
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
        style={{ animationDuration: '350ms', animationDelay: nextDelay() }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Šablony</h2>
          <Link href="/app/templates" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            Zobrazit vše
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border bg-card overflow-visible">
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
              <div className="flex items-center gap-1">
                {isClient && (
                  <StarButton
                    starred={isTemplateStar(t.id)}
                    onToggle={() => toggleTemplateStar(t.id)}
                  />
                )}
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
