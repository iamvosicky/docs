'use client';

import { useState, useEffect } from 'react';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { getAllTemplates, getCustomTemplates } from '@/lib/template-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FolderOpen, Plus, FileText, MoreHorizontal, Pencil, Trash2,
  ArrowRight, X, Search, Upload, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { StarButton } from '@/components/star-button';

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

  useEffect(() => setIsClient(true), []);

  const allTemplates = [...getAllTemplates(), ...getCustomTemplates().map(ct => ({
    id: `custom:${ct.id}`,
    name: ct.name,
    description: `${ct.fields.length} polí`,
    category: 'custom' as const,
    tags: [] as string[],
    schema: ct.schema,
  }))];

  const getTemplateName = (id: string) =>
    allTemplates.find(t => t.id === id)?.name || id;

  // Create set step 1: name
  const handleCreateName = () => {
    if (!newName.trim()) return;
    const created = addSet(newName.trim());
    setNewSetId(created.id);
    setCreateStep('documents');
  };

  // Create set step 2: done adding documents
  const handleCreateDone = () => {
    setCreating(false);
    setCreateStep('name');
    setNewName('');
    setNewSetId(null);
    setDocSearch('');
    toast.success('Sada vytvořena');
  };

  const handleCancelCreate = () => {
    // If we created a set but user cancels, delete it
    if (newSetId) deleteSet(newSetId);
    setCreating(false);
    setCreateStep('name');
    setNewName('');
    setNewSetId(null);
    setDocSearch('');
  };

  const handleAddDocToNewSet = (templateId: string) => {
    if (!newSetId) return;
    addTemplateToSet(newSetId, templateId);
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    updateSet(id, { name: editName.trim() });
    setEditingId(null);
    toast.success('Sada přejmenována');
  };

  const handleDelete = (id: string, name: string) => {
    deleteSet(id);
    toast.success(`Sada "${name}" smazána`);
  };

  if (!isClient) return null;

  const currentNewSet = newSetId ? sets.find(s => s.id === newSetId) : null;
  const availableForNewSet = allTemplates.filter(
    t => !currentNewSet?.templateIds.includes(t.id) &&
      (!docSearch || t.name.toLowerCase().includes(docSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sady dokumentů</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vyplňte sdílená data jednou a použijte je ve všech dokumentech
          </p>
        </div>
        {sets.length > 0 && !creating && (
          <Button
            onClick={() => setCreating(true)}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Nová sada
          </Button>
        )}
      </div>

      {/* Create flow */}
      {creating && (
        <div className="rounded-2xl border bg-card overflow-visible">
          {/* Step 1: Name */}
          {createStep === 'name' && (
            <div className="p-5">
              <p className="text-sm font-medium mb-3">Pojmenujte sadu</p>
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="např. Založení a.s."
                  autoFocus
                  className="rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateName();
                    if (e.key === 'Escape') handleCancelCreate();
                  }}
                />
                <Button onClick={handleCreateName} size="sm" className="rounded-xl px-5" disabled={!newName.trim()}>
                  Pokračovat
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button onClick={handleCancelCreate} variant="ghost" size="sm" className="rounded-xl">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Add documents */}
          {createStep === 'documents' && currentNewSet && (
            <div>
              <div className="px-5 py-3 border-b bg-muted/30 rounded-t-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{currentNewSet.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {currentNewSet.templateIds.length === 0
                      ? 'Přidejte dokumenty do sady'
                      : `${currentNewSet.templateIds.length} ${currentNewSet.templateIds.length === 1 ? 'dokument' : currentNewSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/upload">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Nahrát nový
                    </Button>
                  </Link>
                  <Button onClick={handleCreateDone} size="sm" className="rounded-xl text-xs px-4">
                    Hotovo
                  </Button>
                </div>
              </div>

              {/* Documents already added */}
              {currentNewSet.templateIds.length > 0 && (
                <div className="border-b">
                  {currentNewSet.templateIds.map(tid => (
                    <div key={tid} className="flex items-center gap-3 px-5 py-2.5">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm truncate">{getTemplateName(tid)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Search & add from existing templates */}
              <div className="p-3">
                {allTemplates.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Hledat šablonu..."
                      className="pl-9 h-8 rounded-xl text-sm"
                    />
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {availableForNewSet.length > 0 ? (
                    availableForNewSet.map(t => (
                      <button
                        key={t.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-accent/60 transition-colors"
                        onClick={() => handleAddDocToNewSet(t.id)}
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                        </div>
                        <Plus className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                      {docSearch ? 'Žádná šablona nenalezena' : 'Všechny šablony přidány'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {sets.length === 0 && !creating && (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-medium mb-1">
            Organizujte dokumenty do sad
          </h2>
          <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
            Vyplňte sdílená data jednou a použijte je ve všech dokumentech v sadě.
          </p>
          <p className="text-xs text-muted-foreground mb-6 max-w-sm mx-auto">
            Např. sada &bdquo;Založení a.s.&ldquo; může obsahovat zakladatelskou listinu,
            stanovy, souhlas se sídlem a prohlášení správce vkladu.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => setCreating(true)}
              className="rounded-xl gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Vytvořit sadu
            </Button>
            <Link href="/upload">
              <Button variant="outline" className="rounded-xl gap-1.5">
                <Upload className="h-4 w-4" />
                Nahrát dokument
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Set cards */}
      {sets.length > 0 && !creating && (
        <div className="grid gap-3">
          {sets.map((docSet) => (
            <div
              key={docSet.id}
              className="rounded-2xl border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  {editingId === docSet.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="h-8 rounded-lg text-sm max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(docSet.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={() => handleRename(docSet.id)}
                      />
                    </div>
                  ) : (
                    <Link href={`/app/sets/${docSet.id}`} className="block group">
                      <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                        {docSet.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {docSet.templateIds.length === 0
                          ? 'Prázdná — přidejte dokumenty'
                          : `${docSet.templateIds.length} ${docSet.templateIds.length === 1 ? 'dokument' : docSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}`}
                      </p>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 relative">
                  <StarButton starred={!!docSet.isStarred} onToggle={() => toggleStar(docSet.id)} />

                  {docSet.templateIds.length > 0 && (
                    <Link href={`/app/generate?template=${docSet.templateIds.join(',')}`}>
                      <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-muted-foreground hover:text-primary">
                        Generovat
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setMenuOpen(menuOpen === docSet.id ? null : docSet.id)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {menuOpen === docSet.id && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border bg-popover shadow-lg p-1">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left hover:bg-accent/60 transition-colors"
                        onClick={() => {
                          setEditingId(docSet.id);
                          setEditName(docSet.name);
                          setMenuOpen(null);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        Přejmenovat
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                          handleDelete(docSet.id, docSet.name);
                          setMenuOpen(null);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Smazat
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document list preview */}
              {docSet.templateIds.length > 0 && (
                <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {docSet.templateIds.slice(0, 5).map((tid) => (
                    <span
                      key={tid}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/60 text-[11px] text-muted-foreground"
                    >
                      <FileText className="h-2.5 w-2.5" />
                      {getTemplateName(tid)}
                    </span>
                  ))}
                  {docSet.templateIds.length > 5 && (
                    <span className="px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{docSet.templateIds.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
