'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText, ArrowRight, Layers, Plus, Clock,
  Play, ChevronRight, MoreHorizontal, Trash2, Upload
} from 'lucide-react';
import {
  getAllTemplates, getCustomTemplates,
  type CustomTemplate
} from '@/lib/template-schemas';
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
  if (days < 7) return `${days} d`;
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function docCount(n: number): string {
  if (n === 0) return '0 dokumentů';
  if (n === 1) return '1 dokument';
  if (n < 5) return `${n} dokumenty`;
  return `${n} dokumentů`;
}

export default function SetsPage() {
  const { user } = useAuth();
  const { sets, addSet, addTemplateToSet, deleteSet } = useDocumentSetStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const existingSetNames = new Set(sets.map(s => s.name));
  const availablePresets = predefinedSets.filter(p => !existingSetNames.has(p.name));

  const handleCreateFromPreset = (preset: PredefinedSet) => {
    const created = addSet(preset.name, preset.description);
    for (const tid of preset.templateIds) {
      addTemplateToSet(created.id, tid);
    }
    toast.success(`"${preset.name}" vytvořena`);
  };

  const handleDeleteSet = (id: string, name: string) => {
    deleteSet(id);
    toast.success(`"${name}" smazána`);
  };

  // Sort sets: most recently updated first
  const sortedSets = isClient ? [...sets].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ) : [];

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* ─── Header ─── */}
      <div className="pt-4 pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight leading-tight">
            Sady
          </h1>
          <p className="text-[13px] text-muted-foreground/60 mt-1">
            {isClient && sets.length > 0
              ? `${sets.length} ${sets.length === 1 ? 'sada' : sets.length < 5 ? 'sady' : 'sad'}`
              : 'Vaše pracovní sady dokumentů'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/upload">
            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium">
              <Upload className="h-3.5 w-3.5" />
              Importovat
            </Button>
          </Link>
          <Link href="/app/sets">
            <Button size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium">
              <Plus className="h-3.5 w-3.5" />
              Nová sada
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">

        {/* ═══════════════════════════════════════════════════
            SETS LIST (Primary content)
            ═══════════════════════════════════════════════════ */}
        {isClient && sortedSets.length > 0 && (
          <section>
            <div className="space-y-2">
              {sortedSets.map(docSet => {
                const previewDocs = docSet.templateIds
                  .slice(0, 3)
                  .map(id => getTemplate(id))
                  .filter(Boolean);

                return (
                  <div
                    key={docSet.id}
                    className="group rounded-xl bg-card transition-all duration-150 hover:shadow-sm"
                  >
                    <Link
                      href={docSet.templateIds.length > 0
                        ? `/app/generate?templates=${docSet.templateIds.join(',')}`
                        : `/app/sets/${docSet.id}`
                      }
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        {docSet.templateIds.length > 0 ? (
                          <Play className="h-4 w-4 text-primary/70 ml-0.5" />
                        ) : (
                          <Layers className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold leading-snug">{docSet.name}</h3>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground/50">
                          <span>{docCount(docSet.templateIds.length)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(docSet.updatedAt)}
                          </span>
                        </div>
                        {/* Preview docs */}
                        {previewDocs.length > 0 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {previewDocs.map((doc, i) => (
                              <span key={i} className="text-[11px] text-muted-foreground/30 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{doc!.name}</span>
                              </span>
                            ))}
                            {docSet.templateIds.length > 3 && (
                              <span className="text-[11px] text-muted-foreground/20">
                                +{docSet.templateIds.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/15 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>

                    {/* Delete on hover */}
                    <button
                      onClick={() => handleDeleteSet(docSet.id, docSet.name)}
                      className="absolute right-14 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground/30 hover:!text-destructive hover:bg-destructive/10 transition-all"
                      title="Smazat sadu"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            EMPTY STATE + PRESETS
            ═══════════════════════════════════════════════════ */}
        {isClient && sortedSets.length === 0 && (
          <section className="text-center py-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <Layers className="h-7 w-7 text-primary/40" />
            </div>
            <h2 className="text-[16px] font-semibold mb-1.5">Zatím žádné sady</h2>
            <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto mb-6">
              Sada = skupina dokumentů pro konkrétní situaci. Vytvořte první sadu, nebo importujte vlastní dokument.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/app/sets">
                <Button size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px]">
                  <Plus className="h-3.5 w-3.5" />
                  Nová sada
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px]">
                  <Upload className="h-3.5 w-3.5" />
                  Importovat dokument
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Preset templates */}
        {isClient && availablePresets.length > 0 && (
          <section>
            <p className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest mb-3">
              {sortedSets.length > 0 ? 'Vytvořit z předlohy' : 'Začněte z předlohy'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availablePresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleCreateFromPreset(preset)}
                  className="group rounded-xl bg-card p-4 text-left transition-all duration-150 hover:shadow-sm flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/8 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-emerald-500/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-medium leading-snug">{preset.name}</h3>
                    <p className="text-[11px] text-muted-foreground/40">{docCount(preset.templateIds.length)}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/15 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Quick links — secondary */}
        <section>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/30">
            <Link href="/upload" className="hover:text-muted-foreground transition-colors flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Nahrát dokument
            </Link>
            <span>·</span>
            <Link href="/app/settings/entities" className="hover:text-muted-foreground transition-colors">
              Subjekty
            </Link>
            <span>·</span>
            <Link href="/app/settings" className="hover:text-muted-foreground transition-colors">
              Nastavení
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
