"use client";

import { useState } from 'react';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, Check, ChevronDown } from 'lucide-react';

interface DocumentSetPickerProps {
  /** Called when a template is added to a set */
  onAdd: (setId: string, setName: string) => void;
  /** The template ID being added */
  templateId?: string;
}

/**
 * Lightweight inline picker for adding a document to a set.
 * Shows during or after upload flow.
 */
export function DocumentSetPicker({ onAdd, templateId }: DocumentSetPickerProps) {
  const { sets, addSet, addTemplateToSet } = useDocumentSetStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [added, setAdded] = useState<string | null>(null);

  const handleSelect = (setId: string, name: string) => {
    if (templateId) addTemplateToSet(setId, templateId);
    setAdded(setId);
    setOpen(false);
    onAdd(setId, name);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newSet = addSet(newName.trim());
    if (templateId) addTemplateToSet(newSet.id, templateId);
    setAdded(newSet.id);
    setOpen(false);
    setCreating(false);
    setNewName('');
    onAdd(newSet.id, newSet.name);
  };

  return (
    <div className="rounded-xl border bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Přidat do sady</span>
      </div>

      {added ? (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-3.5 w-3.5" />
          <span>Přidáno do &bdquo;{sets.find(s => s.id === added)?.name}&ldquo;</span>
        </div>
      ) : (
        <>
          {!open && !creating && (
            <div className="flex flex-wrap gap-2">
              {sets.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1"
                  onClick={() => setOpen(true)}
                >
                  Existující sada
                  <ChevronDown className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1"
                onClick={() => setCreating(true)}
              >
                <Plus className="h-3 w-3" />
                Nová sada
              </Button>
            </div>
          )}

          {open && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {sets.map((s) => (
                <button
                  key={s.id}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left hover:bg-accent/60 transition-colors"
                  onClick={() => handleSelect(s.id, s.name)}
                >
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {s.templateIds.length}
                  </span>
                </button>
              ))}
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left text-primary hover:bg-primary/5 transition-colors"
                onClick={() => { setOpen(false); setCreating(true); }}
              >
                <Plus className="h-3.5 w-3.5" />
                Vytvořit novou sadu
              </button>
            </div>
          )}

          {creating && (
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Název sady..."
                autoFocus
                className="rounded-xl h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                }}
              />
              <Button onClick={handleCreate} size="sm" className="rounded-xl h-8 px-4 text-xs">
                Vytvořit
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
