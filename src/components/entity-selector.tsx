"use client";

import { useState, useRef, useEffect } from 'react';
import { useEntityStore } from '@/lib/entity-store';
import { mapEntityToFields, type SavedEntity } from '@/types/saved-entity';
import { Building2, User, ChevronDown, Check, Search } from 'lucide-react';
import Link from 'next/link';

interface EntitySelectorProps {
  groupPrefix: string;
  fieldKeys: string[];
  onApply: (values: Record<string, string>) => void;
}

export function EntitySelector({ groupPrefix, fieldKeys, onApply }: EntitySelectorProps) {
  const { entities } = useEntityStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = entities.filter(e =>
    !search || e.label.toLowerCase().includes(search.toLowerCase()) ||
    (e.data as any).name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (entity: SavedEntity) => {
    const mapped = mapEntityToFields(entity, fieldKeys, groupPrefix);
    onApply(mapped);
    setApplied(entity.id);
    setOpen(false);
    setSearch('');
  };

  if (entities.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary transition-colors"
      >
        {applied ? (
          <>
            <Check className="h-3 w-3 text-primary" />
            <span className="text-primary">{entities.find(e => e.id === applied)?.label}</span>
          </>
        ) : (
          <>
            <Building2 className="h-3 w-3" />
            Vybrat subjekt
          </>
        )}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 rounded-xl border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search */}
          {entities.length > 3 && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Hledat..."
                  autoFocus
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-secondary/50 border-0 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring/30"
                />
              </div>
            </div>
          )}

          {/* Entity list */}
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length > 0 ? filtered.map(entity => (
              <button
                key={entity.id}
                type="button"
                onClick={() => handleSelect(entity)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent/60 ${
                  applied === entity.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {entity.type === 'company' ? (
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{entity.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {entity.type === 'company'
                      ? (entity.data as any).ico ? `IČ: ${(entity.data as any).ico}` : (entity.data as any).address
                      : (entity.data as any).address || (entity.data as any).email
                    }
                  </p>
                </div>
                {entity.isDefault && (
                  <span className="text-[10px] text-primary font-medium shrink-0">Výchozí</span>
                )}
                {applied === entity.id && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </button>
            )) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">Žádný subjekt nenalezen</p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-1.5">
            <Link
              href="/app/settings/entities"
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              Spravovat subjekty
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
