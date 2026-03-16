'use client';

import { useState, useEffect, useRef } from 'react';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { getAllTemplates, getCustomTemplates, getTemplate } from '@/lib/template-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FolderOpen, Plus, FileText, MoreHorizontal, Pencil, Trash2,
  ArrowRight, X, Search, Upload, Check, Layers, Clock, Star
} from 'lucide-react';
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

export default function DocumentSetsPage() {
  const { sets, addSet, deleteSet, updateSet, addTemplateToSet, toggleStar } = useDocumentSetStore();
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState<'name' | 'documents'>('name');
  const [newName, setNewName] = useState('');
  const [newSetId, setNewSetId] = useState<string | null>(null);
  const [docSearch, setDocSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsClient(true), []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const allTemplates = [...getAllTemplates(), ...getCustomTemplates().map(ct => ({
    id: `custom:${ct.id}`,
    name: ct.name,
    description: `${ct.fields.length} polí`,
    category: 'custom' as const,
    tags: [] as string[],
    schema: ct.schema,
  }))];

  const getTemplateName = (id: string) => {
    const t = getTemplate(id);
    if (t) return t.name;
    const ct = allTemplates.find(x => x.id === id);
    return ct?.name || id;
  };

  // Create flow
  const handleCreateName = () => {
    if (!newName.trim()) return;
    const created = addSet(newName.trim());
    setNewSetId(created.id);
    setCreateStep('documents');
  };

  const handleCreateDone = () => {
    setCreating(false);
    setCreateStep('name');
    setNewName('');
    setNewSetId(null);
    setDocSearch('');
    toast.success('Sada vytvořena');
  };

  const handleCancelCreate = () => {
    if (newSetId) deleteSet(newSetId);
    setCreating(false);
    setCreateStep('name');
    setNewName('');
    setNewSetId(null);
    setDocSearch('');
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    updateSet(id, { name: editName.trim() });
    setEditingId(null);
    toast.success('Přejmenováno');
  };

  const handleDelete = (id: string, name: string) => {
    deleteSet(id);
    setMenuOpen(null);
    toast.success(`"${name}" smazána`);
  };

  if (!isClient) return null;

  const currentNewSet = newSetId ? sets.find(s => s.id === newSetId) : null;
  const availableForNewSet = allTemplates.filter(
    t => !currentNewSet?.templateIds.includes(t.id) &&
      (!docSearch || t.name.toLowerCase().includes(docSearch.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* ─── Header ─── */}
      <div className="pt-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sady dokumentů</h1>
            <p className="text-[13px] text-muted-foreground/60 mt-1">
              Vyplňte sdílená data jednou a použijte je ve všech dokumentech
            </p>
          </div>
          {sets.length > 0 && !creating && (
            <Button
              onClick={() => setCreating(true)}
              size="sm"
              className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nová sada
            </Button>
          )}
        </div>
      </div>

      {/* ─── Create flow ─── */}
      {creating && (
        <div className="rounded-2xl border bg-card overflow-hidden mb-8">
          {createStep === 'name' && (
            <>
              <div className="px-5 py-3 border-b bg-muted/30">
                <span className="text-sm font-medium">Nová sada dokumentů</span>
              </div>
              <div className="p-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Název sady <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="např. Založení a.s."
                    autoFocus
                    className="rounded-xl h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateName();
                      if (e.key === 'Escape') handleCancelCreate();
                    }}
                  />
                  <Button onClick={handleCreateName} className="rounded-xl h-10 px-5 text-[13px]" disabled={!newName.trim()}>
                    Pokračovat
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button onClick={handleCancelCreate} variant="ghost" className="rounded-xl h-10 px-3">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {createStep === 'documents' && currentNewSet && (
            <>
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{currentNewSet.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {currentNewSet.templateIds.length === 0
                      ? 'Přidejte dokumenty'
                      : docCount(currentNewSet.templateIds.length)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href="/upload">
                    <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Nahrát
                    </Button>
                  </Link>
                  <Button onClick={handleCreateDone} size="sm" className="rounded-xl text-xs px-4">
                    Hotovo
                  </Button>
                </div>
              </div>

              {currentNewSet.templateIds.length > 0 && (
                <div className="border-b">
                  {currentNewSet.templateIds.map(tid => (
                    <div key={tid} className="flex items-center gap-2.5 px-5 py-2.5 text-sm">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{getTemplateName(tid)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3">
                {allTemplates.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Hledat šablonu..."
                      className="pl-9 h-9 rounded-xl"
                    />
                  </div>
                )}
                <div className="max-h-52 overflow-y-auto">
                  {availableForNewSet.length > 0 ? (
                    availableForNewSet.map(t => (
                      <button
                        key={t.id}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/30 transition-colors"
                        onClick={() => addTemplateToSet(newSetId!, t.id)}
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate flex-1">{t.name}</span>
                        <Plus className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                      {docSearch ? 'Žádná šablona nenalezena' : 'Všechny šablony přidány'}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Empty state ─── */}
      {sets.length === 0 && !creating && (
        <div className="rounded-2xl bg-card p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
            <Layers className="h-7 w-7 text-violet-500/40" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5">Vytvořte první sadu</h3>
          <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto mb-5 leading-relaxed">
            Seskupte související dokumenty a vyplňte sdílená data jednou pro všechny.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setCreating(true)} size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium">
              <Plus className="h-3.5 w-3.5" />
              Nová sada
            </Button>
            <Link href="/upload">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] text-muted-foreground/60">
                <Upload className="h-3.5 w-3.5" />
                Nahrát
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Set cards (grid) ─── */}
      {sets.length > 0 && !creating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((docSet) => {
            const previewDocs = docSet.templateIds.slice(0, 4);
            const remaining = docSet.templateIds.length - previewDocs.length;

            return (
              <div key={docSet.id} className="relative group">
                {editingId === docSet.id ? (
                  <div className="rounded-2xl bg-card p-5">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="rounded-xl h-9 text-[14px] mb-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(docSet.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-xl h-7 text-[11px] px-3" onClick={() => handleRename(docSet.id)}>Uložit</Button>
                      <Button size="sm" variant="ghost" className="rounded-xl h-7 text-[11px] px-3" onClick={() => setEditingId(null)}>Zrušit</Button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/app/sets/${docSet.id}`}
                    className="rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5 flex flex-col h-full"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-violet-500/70" />
                      </div>
                      <div className="flex items-center gap-1" ref={menuOpen === docSet.id ? menuRef : undefined}>
                        {docSet.isStarred && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuOpen(menuOpen === docSet.id ? null : docSet.id);
                          }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/70 hover:bg-muted/50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpen === docSet.id && (
                          <div className="absolute right-3 top-12 z-50 w-44 rounded-xl border bg-popover shadow-lg p-1 animate-in fade-in slide-in-from-top-1 duration-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleStar(docSet.id);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left hover:bg-accent/60 transition-colors"
                            >
                              <Star className={`h-3.5 w-3.5 ${docSet.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                              {docSet.isStarred ? 'Odepnout' : 'Připnout'}
                            </button>
                            {docSet.templateIds.length > 0 && (
                              <Link
                                href={`/app/generate?template=${docSet.templateIds.join(',')}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left hover:bg-accent/60 transition-colors"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                Generovat
                              </Link>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingId(docSet.id);
                                setEditName(docSet.name);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left hover:bg-accent/60 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Přejmenovat
                            </button>
                            <div className="my-1 border-t" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(docSet.id, docSet.name);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Smazat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title + meta */}
                    <h3 className="text-[15px] font-semibold leading-snug mb-0.5">{docSet.name}</h3>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground/60 mb-4">
                      <span>{docCount(docSet.templateIds.length)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(docSet.updatedAt)}
                      </span>
                    </div>

                    {/* Document preview */}
                    {previewDocs.length > 0 && (
                      <div className="space-y-1.5 mb-3 flex-1">
                        {previewDocs.map((tid) => (
                          <div key={tid} className="flex items-center gap-2 text-[12px] text-muted-foreground/50">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate">{getTemplateName(tid)}</span>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <p className="text-[11px] text-muted-foreground/30 pl-5">
                            +{remaining} {remaining < 5 ? 'další' : 'dalších'}
                          </p>
                        )}
                      </div>
                    )}

                    {docSet.templateIds.length === 0 && (
                      <p className="text-[12px] text-muted-foreground/40 mb-3 flex-1">
                        Přidejte dokumenty do sady
                      </p>
                    )}

                    {/* Bottom action hint */}
                    <div className="flex items-center justify-end pt-2 border-t border-border/30 mt-auto">
                      <span className="text-[12px] text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors flex items-center gap-1">
                        Otevřít
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}

          {/* New set card */}
          <button
            onClick={() => setCreating(true)}
            className="rounded-2xl border border-dashed border-muted-foreground/10 p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-muted-foreground/20 hover:bg-card/50 min-h-[200px]"
          >
            <Plus className="h-5 w-5 text-muted-foreground/30 mb-2" />
            <span className="text-[13px] text-muted-foreground/50 font-medium">Nová sada</span>
          </button>
        </div>
      )}
    </div>
  );
}
