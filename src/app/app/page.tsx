'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  FileText, ArrowRight, Upload, Layers, Plus,
  MoreHorizontal, Pencil, Trash2, FolderOpen
} from 'lucide-react';
import { getAllTemplates, getCustomTemplates } from '@/lib/template-schemas';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { predefinedSets, type PredefinedSet } from '@/lib/predefined-sets';
import { getTemplate } from '@/lib/template-schemas';
import { toast } from 'sonner';

function docLabel(n: number): string {
  if (n === 0) return 'Prázdná sada';
  if (n === 1) return '1 dokument';
  if (n < 5) return `${n} dokumenty`;
  return `${n} dokumentů`;
}

const MAX_PREVIEW = 3;

export default function DashboardPage() {
  const { sets, addSet, addTemplateToSet, deleteSet } = useDocumentSetStore();
  const [isClient, setIsClient] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  const existingSetNames = new Set(sets.map(s => s.name));
  const availablePresets = predefinedSets.filter(p => !existingSetNames.has(p.name));

  const handleCreatePreset = (preset: PredefinedSet) => {
    const created = addSet(preset.name, preset.description);
    for (const tid of preset.templateIds) addTemplateToSet(created.id, tid);
    toast.success(`„${preset.name}" vytvořena`);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteSet(deleteTarget.id);
    toast.success(`„${deleteTarget.name}" smazána`);
    setDeleteTarget(null);
  };

  const sortedSets = isClient
    ? [...sets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  const setCount = isClient ? sets.length : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">

      {/* ─── HEADER ─── */}
      <div className="pt-6 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-foreground">Sady</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {setCount > 0
                ? `${setCount} ${setCount === 1 ? 'sada' : setCount < 5 ? 'sady' : 'sad'}`
                : 'Pracovní sady dokumentů'
              }
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/upload">
              <Button variant="outline" className="rounded-xl h-9 px-3.5 gap-1.5 text-[13px] font-medium">
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
            </Link>
            <Link href="/app/sets">
              <Button className="rounded-xl h-9 px-3.5 gap-1.5 text-[13px] font-medium">
                <Plus className="h-3.5 w-3.5" />
                Nová sada
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── SETS GRID ─── */}
      {isClient && sortedSets.length > 0 && (
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedSets.map(docSet => {
              const previewDocs = docSet.templateIds
                .slice(0, MAX_PREVIEW)
                .map(id => getTemplate(id))
                .filter(Boolean);
              const remaining = docSet.templateIds.length - previewDocs.length;
              const hasDocuments = docSet.templateIds.length > 0;

              return (
                <div key={docSet.id} className="relative">
                  <Link
                    href={hasDocuments
                      ? `/app/generate?templates=${docSet.templateIds.join(',')}`
                      : `/app/sets/${docSet.id}`
                    }
                    className="group flex flex-col rounded-2xl bg-card border border-border/60 p-5 min-h-[188px] transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {/* Top: Icon + Title + Meta */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        hasDocuments ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {hasDocuments ? (
                          <FolderOpen className="h-[18px] w-[18px] text-primary" />
                        ) : (
                          <Layers className="h-[18px] w-[18px] text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-8">
                        <h3 className="text-[15px] font-semibold leading-snug text-foreground truncate">
                          {docSet.name}
                        </h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {docLabel(docSet.templateIds.length)}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Document preview */}
                    <div className="flex-1 space-y-1.5">
                      {previewDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <FileText className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span className="truncate">{doc!.name}</span>
                        </div>
                      ))}
                      {remaining > 0 && (
                        <p className="text-[11px] text-muted-foreground/60 pl-5">
                          +{remaining} {remaining < 5 ? 'další' : 'dalších'}
                        </p>
                      )}
                      {!hasDocuments && (
                        <p className="text-[12px] text-muted-foreground/60">
                          Přidejte dokumenty do sady
                        </p>
                      )}
                    </div>

                    {/* Bottom: hover CTA */}
                    <div className="pt-3 mt-auto border-t border-border/30 flex items-center justify-end">
                      <span className="text-[12px] text-muted-foreground/0 group-hover:text-primary font-medium flex items-center gap-1 transition-colors">
                        {hasDocuments ? 'Otevřít' : 'Upravit'}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>

                  {/* Context menu — top right, always rendered but only visible on hover */}
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-60 text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          aria-label={`Akce pro ${docSet.name}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        <DropdownMenuItem asChild className="rounded-lg text-[13px] gap-2 cursor-pointer">
                          <Link href={`/app/sets/${docSet.id}`}>
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            Upravit sadu
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="rounded-lg text-[13px] gap-2 cursor-pointer text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteTarget({ id: docSet.id, name: docSet.name });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Smazat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {/* New set card */}
            <Link
              href="/app/sets"
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-5 min-h-[188px] text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Plus className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">Nová sada</span>
            </Link>
          </div>
        </section>
      )}

      {/* ─── EMPTY STATE ─── */}
      {isClient && sortedSets.length === 0 && (
        <section className="rounded-2xl border bg-card p-10 sm:p-14 text-center mb-12">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Layers className="h-8 w-8 text-primary/50" />
          </div>
          <h2 className="text-[18px] font-bold text-foreground mb-2">Začněte vytvořením sady</h2>
          <p className="text-[14px] text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Sada je skupina dokumentů pro konkrétní situaci — např. převod podílu, založení firmy, nebo pracovní smlouva.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/app/sets">
              <Button className="rounded-xl h-10 px-5 gap-2 text-[13px] font-medium">
                <Plus className="h-4 w-4" />
                Nová sada
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline" className="rounded-xl h-10 px-5 gap-2 text-[13px] font-medium">
                <Upload className="h-4 w-4" />
                Importovat dokument
              </Button>
            </Link>
          </div>
          <p className="text-[12px] text-muted-foreground/70 mt-5">
            Importujte vlastní dokument — vytvoříme z něj šablonu, kterou pak jen vyklikáte.
          </p>
        </section>
      )}

      {/* ─── PRESETS ─── */}
      {isClient && availablePresets.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-[14px] font-semibold text-foreground/70">Připravené sady</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Začněte z předlohy — dokumenty jsou připravené</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePresets.map(preset => {
              const count = preset.templateIds.length;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleCreatePreset(preset)}
                  className="group rounded-xl border border-border/50 bg-card p-4 text-left transition-all duration-150 hover:border-emerald-500/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-semibold text-foreground leading-snug">{preset.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{docLabel(count)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── DELETE CONFIRMATION ─── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Smazat tuto sadu?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sada <strong>„{deleteTarget?.name}"</strong> bude trvale smazána. Tato akce je nevratná.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteTarget(null)}>
              Zrušit
            </Button>
            <Button variant="destructive" className="rounded-xl" onClick={confirmDelete}>
              Smazat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
