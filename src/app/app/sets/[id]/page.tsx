'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { getAllTemplates, getCustomTemplates } from '@/lib/template-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  ArrowLeft, Plus, FileText, Trash2, ArrowRight, Search,
  Pencil, X, Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentSetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { sets, updateSet, deleteSet, addTemplateToSet, removeTemplateFromSet } = useDocumentSetStore();
  const [isClient, setIsClient] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const docSet = sets.find(s => s.id === id);
  if (!docSet) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Sada nenalezena</p>
        <Link href="/app/sets">
          <Button variant="ghost" className="mt-4 rounded-xl gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Zpět na sady
          </Button>
        </Link>
      </div>
    );
  }

  const allTemplates = [
    ...getAllTemplates(),
    ...getCustomTemplates().map(ct => ({
      id: `custom:${ct.id}`,
      name: ct.name,
      description: `${ct.fields.length} polí · Vlastní šablona`,
      category: 'custom' as const,
      tags: [] as string[],
      schema: ct.schema,
    })),
  ];

  const getTemplateName = (tid: string) =>
    allTemplates.find(t => t.id === tid)?.name || tid;

  const getTemplateDesc = (tid: string) =>
    allTemplates.find(t => t.id === tid)?.description || '';

  const availableTemplates = allTemplates.filter(
    t => !docSet.templateIds.includes(t.id) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRename = () => {
    if (!editName.trim()) return;
    updateSet(id, { name: editName.trim() });
    setEditing(false);
    toast.success('Sada přejmenována');
  };

  const handleDelete = () => {
    deleteSet(id);
    router.push('/app/sets');
    toast.success(`Sada "${docSet.name}" smazána`);
  };

  const handleAdd = (templateId: string) => {
    addTemplateToSet(id, templateId);
    toast.success('Dokument přidán');
  };

  const handleRemove = (templateId: string) => {
    removeTemplateFromSet(id, templateId);
    toast.success('Dokument odebrán');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/app/sets"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Sady dokumentů
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="h-9 rounded-xl text-base font-semibold max-w-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRename}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold">{docSet.name}</h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => { setEditing(true); setEditName(docSet.name); }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {docSet.templateIds.length > 0 && (
              <Link href={`/app/generate?template=${docSet.templateIds.join(',')}`}>
                <Button size="sm" className="rounded-xl gap-1.5">
                  Generovat
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Smazat sadu
            </Button>
          </div>
        </div>
      </div>

      {/* Documents in set */}
      <div className="rounded-2xl border bg-card">
        <div className="px-5 py-3 border-b bg-muted/30 rounded-t-2xl flex items-center justify-between">
          <span className="text-sm font-medium">
            {docSet.templateIds.length === 0
              ? 'Žádné dokumenty'
              : `${docSet.templateIds.length} ${docSet.templateIds.length === 1 ? 'dokument' : docSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}`}
          </span>
          {!adding && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs gap-1 text-muted-foreground hover:text-primary"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-3 w-3" />
              Přidat dokument
            </Button>
          )}
        </div>

        {docSet.templateIds.length === 0 && !adding && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Tato sada je prázdná
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Přidat dokument
            </Button>
          </div>
        )}

        {docSet.templateIds.length > 0 && (
          <div className="divide-y">
            {docSet.templateIds.map((tid) => (
              <div
                key={tid}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{getTemplateName(tid)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{getTemplateDesc(tid)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleRemove(tid)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add document panel */}
      {adding && (
        <div className="rounded-2xl border bg-card">
          <div className="px-5 py-3 border-b bg-muted/30 rounded-t-2xl flex items-center justify-between">
            <span className="text-sm font-medium">Přidat dokument</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => { setAdding(false); setSearch(''); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {availableTemplates.length > 5 && (
            <div className="px-5 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Hledat šablonu..."
                  autoFocus
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="p-2 max-h-64 overflow-y-auto">
            {availableTemplates.length > 0 ? (
              availableTemplates.map((t) => (
                <button
                  key={t.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-accent/60 transition-colors"
                  onClick={() => handleAdd(t.id)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                {search ? 'Žádná šablona nenalezena' : 'Všechny šablony již přidány'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
