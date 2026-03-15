'use client';

import { useState, useEffect } from 'react';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { getAllTemplates, getCustomTemplates } from '@/lib/template-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FolderOpen, Plus, FileText, MoreHorizontal, Pencil, Trash2,
  ArrowRight, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentSetsPage() {
  const { sets, addSet, deleteSet, updateSet } = useDocumentSetStore();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
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

  const handleCreate = () => {
    if (!newName.trim()) return;
    addSet(newName.trim());
    setNewName('');
    setCreating(false);
    toast.success('Sada vytvořena');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sady dokumentů</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Seskupte související dokumenty do sad
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

      {/* Create inline */}
      {creating && (
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-medium mb-3">Pojmenujte sadu</p>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="např. Založení a.s."
              autoFocus
              className="rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
            />
            <Button onClick={handleCreate} size="sm" className="rounded-xl px-5">
              Vytvořit
            </Button>
            <Button
              onClick={() => { setCreating(false); setNewName(''); }}
              variant="ghost"
              size="sm"
              className="rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Sada &bdquo;Založení a.s.&ldquo; může obsahovat zakladatelskou listinu,
            stanovy, souhlas se sídlem a prohlášení správce vkladu.
          </p>
          <Button
            onClick={() => setCreating(true)}
            className="rounded-xl gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Vytvořit první sadu
          </Button>
        </div>
      )}

      {/* Set cards */}
      {sets.length > 0 && (
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
                          ? 'Prázdná sada'
                          : `${docSet.templateIds.length} ${docSet.templateIds.length === 1 ? 'dokument' : docSet.templateIds.length < 5 ? 'dokumenty' : 'dokumentů'}`}
                      </p>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 relative">
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
