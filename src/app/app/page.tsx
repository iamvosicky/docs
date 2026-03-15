'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Layers, Plus, Clock
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

  // Recent templates (custom first, then built-in)
  const recentTemplates = [
    ...customTemplates.map(ct => ({
      id: `custom:${ct.id}`,
      name: ct.name,
      desc: `${ct.fields.length} polí`,
      href: `/app/generate?template=custom:${ct.id}`,
      isCustom: true,
      date: ct.createdAt,
    })),
    ...allTemplates.slice(0, 4).map(t => ({
      id: t.id,
      name: t.name,
      desc: t.description,
      href: `/app/generate?template=${t.id}`,
      isCustom: false,
      date: '',
    })),
  ].slice(0, 6);

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
  const hasPinned = starredSets.length > 0 || starredTemplateItems.length > 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý den' : 'Dobrý večer';

  const handleCreateFromTemplate = (preset: PredefinedSet) => {
    const created = addSet(preset.name, preset.description);
    for (const tid of preset.templateIds) {
      addTemplateToSet(created.id, tid);
    }
    toast.success(`Sada "${preset.name}" vytvořena`);
  };

  // Check which presets haven't been created yet (by name match)
  const existingSetNames = new Set(sets.map(s => s.name));
  const availablePresets = predefinedSets.filter(p => !existingSetNames.has(p.name));

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* ─── Header ─── */}
      <div className="pt-4 pb-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground/60 mb-1">{greeting}</p>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight leading-tight">
              {user?.name || 'Dokumenty'}
            </h1>
          </div>
          <Link href="/upload">
            <Button
              size="sm"
              className="rounded-full h-9 px-4 gap-1.5 text-[13px] font-medium shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              Nahrát
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* ─── Pinned ─── */}
        {isClient && hasPinned && (
          <section>
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">
              Připnuto
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredSets.map(docSet => (
                <Link
                  key={docSet.id}
                  href={`/app/sets/${docSet.id}`}
                  className="group relative rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-violet-500/70" />
                    </div>
                    <StarButton starred onToggle={() => toggleSetStar(docSet.id)} />
                  </div>
                  <h3 className="text-[15px] font-semibold mb-0.5 leading-snug">{docSet.name}</h3>
                  <p className="text-[12px] text-muted-foreground/60">{docCount(docSet.templateIds.length)}</p>
                </Link>
              ))}
              {starredTemplateItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-500/70" />
                    </div>
                    <StarButton starred onToggle={() => toggleTemplateStar(item.id)} />
                  </div>
                  <h3 className="text-[15px] font-semibold mb-0.5 leading-snug">{item.name}</h3>
                  <p className="text-[12px] text-muted-foreground/60">Šablona</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Document Sets ─── */}
        {isClient && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                Sady dokumentů
              </p>
              <Link
                href="/app/sets"
                className="text-[12px] text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {sets.length > 0 ? 'Zobrazit vše' : 'Vytvořit sadu'}
              </Link>
            </div>

            {sets.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 sm:p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                  <Layers className="h-7 w-7 text-violet-500/50" />
                </div>
                <h3 className="text-[15px] font-semibold mb-1.5">Vytvořte první sadu</h3>
                <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto mb-5 leading-relaxed">
                  Seskupte související dokumenty a vyplňte sdílená data jednou pro všechny.
                </p>
                <Link href="/app/sets">
                  <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[12px] gap-1.5 font-medium">
                    <Plus className="h-3 w-3" />
                    Nová sada
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.slice(0, 6).map(docSet => (
                  <Link
                    key={docSet.id}
                    href={`/app/sets/${docSet.id}`}
                    className="group rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-violet-500/70" />
                      </div>
                      <StarButton
                        starred={!!docSet.isStarred}
                        onToggle={() => toggleSetStar(docSet.id)}
                      />
                    </div>
                    <h3 className="text-[15px] font-semibold mb-0.5 leading-snug">{docSet.name}</h3>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground/60">
                      <span>{docCount(docSet.templateIds.length)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(docSet.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Create new set card */}
                <Link
                  href="/app/sets"
                  className="rounded-2xl border border-dashed border-muted-foreground/10 p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-muted-foreground/20 hover:bg-card/50 min-h-[120px]"
                >
                  <Plus className="h-5 w-5 text-muted-foreground/30 mb-2" />
                  <span className="text-[13px] text-muted-foreground/50 font-medium">Nová sada</span>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ─── Recent Documents ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
              Šablony
            </p>
            <Link
              href="/app/templates"
              className="text-[12px] text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Zobrazit vše
            </Link>
          </div>

          <div className="rounded-2xl bg-card divide-y divide-border/50">
            {recentTemplates.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/30 first:rounded-t-2xl last:rounded-b-2xl group"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-blue-500/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium truncate">{t.name}</p>
                  <p className="text-[12px] text-muted-foreground/50 truncate">{t.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isClient && (
                    <StarButton
                      starred={isTemplateStar(t.id)}
                      onToggle={() => toggleTemplateStar(t.id)}
                    />
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Start from template ─── */}
        {isClient && availablePresets.length > 0 && (
          <section>
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">
              Začněte ze šablony
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePresets.map(preset => (
                <div
                  key={preset.id}
                  className="rounded-2xl bg-card p-5 flex flex-col"
                >
                  <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-3">
                    <Layers className="h-5 w-5 text-emerald-500/70" />
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug mb-1">{preset.name}</h3>
                  <p className="text-[12px] text-muted-foreground/60 leading-relaxed mb-3 flex-1">
                    {preset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/40">
                      {preset.templateIds.length} {preset.templateIds.length === 1 ? 'dokument' : preset.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-7 px-3 text-[11px] font-medium text-muted-foreground/60 hover:text-foreground"
                      onClick={() => handleCreateFromTemplate(preset)}
                    >
                      Vytvořit
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
