'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FileText, Plus, Upload, Search, ArrowRight,
  FolderOpen, Trash2, Calendar, Grid3X3, List
} from 'lucide-react';
import {
  getAllTemplates, getCustomTemplates, deleteCustomTemplate,
  type Template, type CustomTemplate
} from '@/lib/template-schemas';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type CategoryFilter = 'all' | 'contract' | 'company' | 'employment' | 'purchase' | 'custom';

const categoryLabels: Record<string, string> = {
  all: 'Vše',
  contract: 'Smlouvy',
  company: 'Založení firmy',
  employment: 'Zaměstnání',
  purchase: 'Koupě',
  custom: 'Vlastní',
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string, name: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Šablona "${name}" smazána`);
  };

  // Filter templates
  const filteredBuiltin = allTemplates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category === 'custom') return false;
    if (category !== 'all' && t.category !== category) return false;
    return true;
  });

  const filteredCustom = customTemplates.filter(ct => {
    if (search && !ct.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && category !== 'custom') return false;
    return true;
  });

  const categories: CategoryFilter[] = ['all', 'contract', 'company', 'employment', 'purchase'];
  if (customTemplates.length > 0) categories.push('custom');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Šablony</h1>
          <p className="text-xs text-muted-foreground mt-1">Spravujte a používejte šablony dokumentů</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/app/import">
              <Upload className="h-4 w-4 mr-1.5" />
              Import
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/app/generate">
              <Plus className="h-4 w-4 mr-1.5" />
              Nová šablona
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat šablony..."
            className="pl-10 h-9 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Template grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Custom templates */}
          {filteredCustom.map((ct) => (
            <div key={ct.id} className="group relative rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm flex flex-col">
              <button
                onClick={() => handleDeleteCustom(ct.id, ct.name)}
                className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Upload className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="min-w-0 pr-6">
                  <h3 className="font-semibold text-base leading-tight mb-1">{ct.name}</h3>
                  {ct.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{ct.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <span className="tag-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  <FileText className="h-3 w-3" />
                  {ct.fields.length} polí
                </span>
                <span className="tag-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  Vlastní
                </span>
                {ct.createdAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <Calendar className="h-3 w-3" />
                    {new Date(ct.createdAt).toLocaleDateString('cs-CZ')}
                  </span>
                )}
              </div>

              <div className="mt-auto">
                <Button asChild className="w-full rounded-xl" size="sm">
                  <Link href={`/app/generate?template=custom:${ct.id}`}>
                    Použít šablonu
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {/* Built-in templates */}
          {filteredBuiltin.map((t) => (
            <div key={t.id} className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base leading-tight mb-1">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <span className="tag-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  <FileText className="h-3 w-3" />
                  {Object.keys(t.schema.properties).length} polí
                </span>
                <span className="tag-pill px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  {categoryLabels[t.category] || t.category}
                </span>
              </div>

              <div className="mt-auto">
                <Button asChild className="w-full rounded-xl" size="sm">
                  <Link href={`/app/generate?template=${t.id}`}>
                    Použít šablonu
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="rounded-2xl border bg-card overflow-hidden divide-y">
          {filteredCustom.map((ct) => (
            <div key={ct.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors group">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Upload className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{ct.name}</p>
                <p className="text-xs text-muted-foreground">{ct.fields.length} polí &middot; Vlastní</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" asChild className="rounded-lg h-7 px-2 text-xs">
                  <Link href={`/app/generate?template=custom:${ct.id}`}>Použít</Link>
                </Button>
                <button
                  onClick={() => handleDeleteCustom(ct.id, ct.name)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {filteredBuiltin.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <span className="tag-pill px-2 py-0.5 rounded text-[10px] font-medium hidden sm:inline">
                {categoryLabels[t.category] || t.category}
              </span>
              <Button variant="ghost" size="sm" asChild className="rounded-lg h-7 px-2 text-xs shrink-0">
                <Link href={`/app/generate?template=${t.id}`}>Použít</Link>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredBuiltin.length === 0 && filteredCustom.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Žádné šablony nenalezeny</p>
          <p className="text-xs text-muted-foreground">Zkuste změnit vyhledávání nebo filtr</p>
        </div>
      )}
    </div>
  );
}
