'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Layers, Plus, Clock,
  Play, ChevronRight, Trash2, Timer
} from 'lucide-react';
import { getAllTemplates, getCustomTemplates } from '@/lib/template-schemas';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { predefinedSets, type PredefinedSet } from '@/lib/predefined-sets';
import { getTemplate } from '@/lib/template-schemas';
import { toast } from 'sonner';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'právě teď';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'včera';
  if (days < 7) return `před ${days} dny`;
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function docLabel(n: number): string {
  if (n === 0) return '0 dokumentů';
  if (n === 1) return '1 dokument';
  if (n < 5) return `${n} dokumenty`;
  return `${n} dokumentů`;
}

export default function DashboardPage() {
  const { sets, addSet, addTemplateToSet, deleteSet } = useDocumentSetStore();
  const [isClient, setIsClient] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  const existingSetNames = new Set(sets.map(s => s.name));
  const availablePresets = predefinedSets.filter(p => !existingSetNames.has(p.name));

  const handleCreatePreset = (preset: PredefinedSet) => {
    const created = addSet(preset.name, preset.description);
    for (const tid of preset.templateIds) addTemplateToSet(created.id, tid);
    toast.success(`„${preset.name}" vytvořena`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSet(id);
    setDeletingId(null);
    toast.success(`„${name}" smazána`);
  };

  const sortedSets = isClient
    ? [...sets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  const setCount = isClient ? sets.length : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">

      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div className="pt-6 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight">Sady</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {setCount > 0
                ? `${setCount} ${setCount === 1 ? 'sada' : setCount < 5 ? 'sady' : 'sad'} dokumentů`
                : 'Pracovní sady dokumentů'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/upload">
              <Button variant="outline" className="rounded-xl h-10 px-4 gap-2 text-[13px] font-medium">
                <Upload className="h-4 w-4" />
                Importovat
              </Button>
            </Link>
            <Link href="/app/sets">
              <Button className="rounded-xl h-10 px-4 gap-2 text-[13px] font-medium">
                <Plus className="h-4 w-4" />
                Nová sada
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SETS GRID
          ═══════════════════════════════════════════════════════════ */}
      {isClient && sortedSets.length > 0 && (
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedSets.map(docSet => {
              const previewDocs = docSet.templateIds
                .slice(0, 4)
                .map(id => getTemplate(id))
                .filter(Boolean);
              const remaining = docSet.templateIds.length - previewDocs.length;
              const hasDocuments = docSet.templateIds.length > 0;

              return (
                <div
                  key={docSet.id}
                  className="group relative rounded-2xl bg-card border border-border/50 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/[0.03] dark:hover:shadow-white/[0.01]"
                >
                  <Link
                    href={hasDocuments
                      ? `/app/generate?templates=${docSet.templateIds.join(',')}`
                      : `/app/sets/${docSet.id}`
                    }
                    className="block p-5"
                  >
                    {/* Card header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className={`h-11 w-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                        hasDocuments
                          ? 'bg-gradient-to-br from-primary/12 to-primary/6'
                          : 'bg-muted/60'
                      }`}>
                        {hasDocuments ? (
                          <Play className="h-5 w-5 text-primary/70 ml-0.5" />
                        ) : (
                          <Layers className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold leading-snug mb-1">{docSet.name}</h3>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground/60">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {docLabel(docSet.templateIds.length)}
                          </span>
                          {hasDocuments && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              ~{Math.max(2, docSet.templateIds.length * 2)} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document preview chips */}
                    {previewDocs.length > 0 && (
                      <div className="space-y-1.5">
                        {previewDocs.map((doc, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground/45">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/20 shrink-0" />
                            <span className="truncate">{doc!.name}</span>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <p className="text-[11px] text-muted-foreground/25 pl-3">
                            +{remaining} {remaining < 5 ? 'další' : 'dalších'}
                          </p>
                        )}
                      </div>
                    )}

                    {!hasDocuments && (
                      <p className="text-[12px] text-muted-foreground/35 italic">
                        Prázdná sada — klikněte pro přidání dokumentů
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                      <span className="text-[11px] text-muted-foreground/35 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(docSet.updatedAt)}
                      </span>
                      <span className="text-[11px] text-muted-foreground/25 group-hover:text-primary font-medium flex items-center gap-0.5 transition-colors">
                        {hasDocuments ? 'Otevřít' : 'Upravit'}
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>

                  {/* Delete button — hover only */}
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(docSet.id, docSet.name); }}
                    className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Smazat sadu"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}

            {/* New set card */}
            <Link
              href="/app/sets"
              className="rounded-2xl border-2 border-dashed border-border/40 p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] min-h-[180px]"
            >
              <div className="h-11 w-11 rounded-[14px] bg-muted/40 flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <span className="text-[14px] font-medium text-muted-foreground/50">Nová sada</span>
              <span className="text-[11px] text-muted-foreground/30 mt-0.5">Vytvořte prázdnou sadu</span>
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          EMPTY STATE
          ═══════════════════════════════════════════════════════════ */}
      {isClient && sortedSets.length === 0 && (
        <section className="rounded-2xl border bg-card p-10 sm:p-14 text-center mb-10">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5">
            <Layers className="h-8 w-8 text-primary/40" />
          </div>
          <h2 className="text-[18px] font-bold mb-2">Začněte vytvořením sady</h2>
          <p className="text-[14px] text-muted-foreground/60 max-w-md mx-auto mb-8 leading-relaxed">
            Sada je skupina dokumentů pro konkrétní situaci — např. převod podílu, založení firmy, nebo pracovní smlouva.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/app/sets">
              <Button className="rounded-xl h-11 px-5 gap-2 text-[14px] font-medium">
                <Plus className="h-4 w-4" />
                Nová sada
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline" className="rounded-xl h-11 px-5 gap-2 text-[14px] font-medium">
                <Upload className="h-4 w-4" />
                Importovat dokument
              </Button>
            </Link>
          </div>
          <p className="text-[12px] text-muted-foreground/40 mt-4">
            Importujte vlastní dokument — vytvoříme z něj šablonu, kterou pak jen vyklikáte.
          </p>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRESETS — "Start from template"
          ═══════════════════════════════════════════════════════════ */}
      {isClient && availablePresets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-muted-foreground/70">Připravené sady</h2>
              <p className="text-[12px] text-muted-foreground/40 mt-0.5">Začněte z předlohy — dokumenty jsou připravené</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePresets.map(preset => {
              const previewDocs = preset.templateIds.slice(0, 3).map(id => getTemplate(id)).filter(Boolean);

              return (
                <button
                  key={preset.id}
                  onClick={() => handleCreatePreset(preset)}
                  className="group rounded-xl border border-border/40 bg-card/50 p-4 text-left transition-all duration-150 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/8 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4 text-emerald-600/50 dark:text-emerald-400/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-semibold leading-snug">{preset.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {previewDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/35">
                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/20" />
                        <span className="truncate">{doc!.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground/35">{docLabel(preset.templateIds.length)}</span>
                    <span className="text-emerald-600/0 group-hover:text-emerald-600/70 dark:group-hover:text-emerald-400/70 font-medium flex items-center gap-0.5 transition-all">
                      Vytvořit
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
