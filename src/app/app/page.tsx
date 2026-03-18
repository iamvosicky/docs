'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Layers, Plus, Clock,
  Play, ChevronRight, Settings
} from 'lucide-react';
import {
  getAllTemplates, getCustomTemplates,
  type CustomTemplate
} from '@/lib/template-schemas';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { useStarredStore } from '@/lib/starred-store';
import { StarButton } from '@/components/star-button';
import { predefinedSets, type PredefinedSet } from '@/lib/predefined-sets';
import { getTemplate } from '@/lib/template-schemas';
import { toast } from 'sonner';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'právě teď';
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'včera';
  if (days < 7) return `před ${days} dny`;
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function docCount(n: number): string {
  if (n === 0) return 'prázdná';
  if (n === 1) return '1 dokument';
  if (n < 5) return `${n} dokumenty`;
  return `${n} dokumentů`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { sets, toggleStar: toggleSetStar, addSet, addTemplateToSet } = useDocumentSetStore();
  const { starredIds, toggle: toggleTemplateStar, isStarred: isTemplateStar } = useStarredStore();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isClient, setIsClient] = useState(false);

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setIsClient(true);
    setCustomTemplates(getCustomTemplates());
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý den' : 'Dobrý večer';

  const handleCreateFromTemplate = (preset: PredefinedSet) => {
    const created = addSet(preset.name, preset.description);
    for (const tid of preset.templateIds) {
      addTemplateToSet(created.id, tid);
    }
    toast.success(`Sada "${preset.name}" vytvořena`);
  };

  const existingSetNames = new Set(sets.map(s => s.name));
  const availablePresets = predefinedSets.filter(p => !existingSetNames.has(p.name));

  // Active sets = sets with templates, sorted by last updated
  const activeSets = isClient ? [...sets].filter(s => s.templateIds.length > 0).sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ) : [];

  // Recent templates for quick access
  const recentTemplates = [
    ...customTemplates.map(ct => ({
      id: `custom:${ct.id}`,
      name: ct.name,
      desc: `${ct.fields.length} polí`,
      href: `/app/generate?template=custom:${ct.id}`,
      isCustom: true,
    })),
    ...allTemplates.slice(0, 4).map(t => ({
      id: t.id,
      name: t.name,
      desc: t.description,
      href: `/app/generate?template=${t.id}`,
      isCustom: false,
    })),
  ].slice(0, 5);

  // Pinned items
  const starredSets = isClient ? sets.filter(s => s.isStarred) : [];
  const starredTemplateItems = isClient ? starredIds
    .map(id => {
      const builtin = allTemplates.find(t => t.id === id);
      if (builtin) return { id, name: builtin.name, href: `/app/generate?template=${id}` };
      const custom = customTemplates.find(ct => `custom:${ct.id}` === id);
      if (custom) return { id, name: custom.name, href: `/app/generate?template=${id}` };
      return null;
    })
    .filter(Boolean) as { id: string; name: string; href: string }[] : [];

  const hasActiveSets = activeSets.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* ─── Header ─── */}
      <div className="pt-4 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground/60 mb-1">{greeting}</p>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight leading-tight">
              {user?.name || 'Dokumenty'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/settings" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-10">

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: ACTIVE WORKFLOWS (Primary focus)
            Sets with progress — "Continue where you left off"
            ═══════════════════════════════════════════════════════ */}
        {isClient && hasActiveSets && (
          <section>
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">
              Pokračovat
            </p>
            <div className="space-y-3">
              {activeSets.slice(0, 4).map(docSet => (
                <Link
                  key={docSet.id}
                  href={`/app/generate?templates=${docSet.templateIds.join(',')}`}
                  className="group flex items-center gap-4 rounded-2xl bg-card p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5"
                >
                  <div className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                    <Play className="h-5 w-5 text-primary/70 ml-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold leading-snug">{docSet.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground/50">
                      <span>{docCount(docSet.templateIds.length)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(docSet.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StarButton
                      starred={!!docSet.isStarred}
                      onToggle={() => toggleSetStar(docSet.id)}
                    />
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: QUICK START (New workflow or single doc)
            ═══════════════════════════════════════════════════════ */}
        <section>
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">
            {hasActiveSets ? 'Nový dokument' : 'Začněte'}
          </p>

          {/* Preset sets — workflow starters */}
          {isClient && availablePresets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {availablePresets.slice(0, 3).map(preset => {
                const previewDocs = preset.templateIds
                  .slice(0, 3)
                  .map(id => getTemplate(id))
                  .filter(Boolean);

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleCreateFromTemplate(preset)}
                    className="group rounded-2xl bg-card p-4 text-left transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center shrink-0">
                        <Layers className="h-4 w-4 text-emerald-500/70" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold leading-snug">{preset.name}</h3>
                        <p className="text-[11px] text-muted-foreground/40">{docCount(preset.templateIds.length)}</p>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {previewDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{doc!.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground/30 group-hover:text-primary transition-colors flex items-center gap-1">
                      Vytvořit
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick template list */}
          <div className="rounded-2xl bg-card divide-y divide-border/50">
            {recentTemplates.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/30 first:rounded-t-2xl last:rounded-b-2xl group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 text-blue-500/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{t.name}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/15 group-hover:text-muted-foreground/40 transition-colors shrink-0" />
              </Link>
            ))}

            {/* Upload as last item in the list — de-emphasized */}
            <Link
              href="/upload"
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/30 last:rounded-b-2xl group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Upload className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-muted-foreground/60">Nahrát vlastní dokument</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/15 group-hover:text-muted-foreground/40 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: PINNED (Quick access to favorites)
            ═══════════════════════════════════════════════════════ */}
        {isClient && (starredSets.length > 0 || starredTemplateItems.length > 0) && (
          <section>
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">
              Připnuto
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {starredSets.map(docSet => (
                <Link
                  key={docSet.id}
                  href={`/app/generate?templates=${docSet.templateIds.join(',')}`}
                  className="group rounded-xl bg-card p-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-violet-500/50 shrink-0" />
                    <span className="text-[13px] font-medium truncate">{docSet.name}</span>
                  </div>
                </Link>
              ))}
              {starredTemplateItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group rounded-xl bg-card p-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-blue-500/50 shrink-0" />
                    <span className="text-[13px] font-medium truncate">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: ALL SETS (Full list, secondary)
            ═══════════════════════════════════════════════════════ */}
        {isClient && sets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                Všechny sady
              </p>
              <Link
                href="/app/sets"
                className="text-[12px] text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                Spravovat
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sets.map(docSet => (
                <Link
                  key={docSet.id}
                  href={`/app/sets/${docSet.id}`}
                  className="group rounded-xl bg-card p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <h3 className="text-[14px] font-medium mb-1 truncate">{docSet.name}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
                    <span>{docCount(docSet.templateIds.length)}</span>
                    <span>{timeAgo(docSet.updatedAt)}</span>
                  </div>
                </Link>
              ))}

              <Link
                href="/app/sets"
                className="rounded-xl border border-dashed border-muted-foreground/10 p-4 flex items-center justify-center transition-all duration-200 hover:border-muted-foreground/20 hover:bg-card/50"
              >
                <span className="text-[12px] text-muted-foreground/30 font-medium flex items-center gap-1.5">
                  <Plus className="h-3 w-3" />
                  Nová sada
                </span>
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
