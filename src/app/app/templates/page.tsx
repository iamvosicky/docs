'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FileText, Plus, Upload, Search, ArrowRight, Trash2
} from 'lucide-react';
import {
  getAllTemplates, getCustomTemplates, deleteCustomTemplate,
  type Template, type CustomTemplate
} from '@/lib/template-schemas';
import { useStarredStore } from '@/lib/starred-store';
import { StarButton } from '@/components/star-button';
import { toast } from 'sonner';

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
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toggle: toggleStar, isStarred } = useStarredStore();

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setIsClient(true);
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Šablona "${name}" smazána`);
  };

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

  const hasResults = filteredBuiltin.length > 0 || filteredCustom.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* ─── Header ─── */}
      <div className="pt-4 pb-8">
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight">Šablony</h1>
          <div className="flex items-center gap-2">
            <Link href="/app/import">
              <Button variant="ghost" size="sm" className="rounded-full h-8 px-3.5 text-[12px] text-muted-foreground/70 hover:text-foreground gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="sm" className="rounded-full h-8 px-4 text-[12px] gap-1.5 font-medium shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                Nová šablona
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat šablony..."
            className="pl-11 h-11 rounded-2xl bg-muted/30 border-0 text-[14px] placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-ring/30"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 ${
                category === cat
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Template Grid ─── */}
      {hasResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Custom templates */}
          {filteredCustom.map((ct) => {
            const templateId = `custom:${ct.id}`;
            return (
              <Link
                key={ct.id}
                href={`/app/generate?template=${templateId}`}
                className="group relative rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5 flex flex-col"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteCustom(e, ct.id, ct.name)}
                  className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-violet-500/70" />
                  </div>
                  {isClient && (
                    <StarButton
                      starred={isStarred(templateId)}
                      onToggle={() => toggleStar(templateId)}
                    />
                  )}
                </div>

                <h3 className="text-[15px] font-semibold leading-snug mb-1">{ct.name}</h3>
                {ct.description && (
                  <p className="text-[13px] text-muted-foreground/60 line-clamp-2 mb-3 leading-relaxed">{ct.description}</p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/40">
                    {ct.fields.length} polí
                  </span>
                  <span className="text-[12px] text-muted-foreground/40 group-hover:text-foreground transition-colors flex items-center gap-1">
                    Použít
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Built-in templates */}
          {filteredBuiltin.map((t) => (
            <Link
              key={t.id}
              href={`/app/generate?template=${t.id}`}
              className="group rounded-2xl bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-white/[0.02] hover:-translate-y-0.5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500/60" />
                </div>
                {isClient && (
                  <StarButton
                    starred={isStarred(t.id)}
                    onToggle={() => toggleStar(t.id)}
                  />
                )}
              </div>

              <h3 className="text-[15px] font-semibold leading-snug mb-1">{t.name}</h3>
              <p className="text-[13px] text-muted-foreground/60 line-clamp-2 mb-3 leading-relaxed">{t.description}</p>

              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground/40">
                  {Object.keys(t.schema.properties).length} polí · {categoryLabels[t.category] || t.category}
                </span>
                <span className="text-[12px] text-muted-foreground/40 group-hover:text-foreground transition-colors flex items-center gap-1">
                  Použít
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* ─── Empty state ─── */
        <div className="rounded-2xl bg-card p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-blue-500/40" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5">
            {search || category !== 'all' ? 'Žádné šablony nenalezeny' : 'Zatím žádné šablony'}
          </h3>
          <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto mb-5 leading-relaxed">
            {search || category !== 'all'
              ? 'Zkuste změnit vyhledávání nebo filtr.'
              : 'Vytvořte svou první šablonu nebo importujte existující.'}
          </p>
          {!search && category === 'all' && (
            <div className="flex gap-2 justify-center">
              <Link href="/upload">
                <Button size="sm" className="rounded-full h-8 px-4 text-[12px] gap-1.5 font-medium">
                  <Plus className="h-3 w-3" />
                  Vytvořit
                </Button>
              </Link>
              <Link href="/app/import">
                <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[12px] gap-1.5 font-medium">
                  <Upload className="h-3 w-3" />
                  Import
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
