'use client';

import { useState } from 'react';
import { useEntityStore } from '@/lib/entity-store';
import { type SavedEntity, type EntityType, type CompanyData, type PersonData } from '@/types/saved-entity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Building2, User, Plus, Pencil, Trash2, Star, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { IcoLookup, type IcoLookupResult } from '@/components/ico-lookup';

type FilterType = 'all' | 'company' | 'person';

const emptyCompanyData: CompanyData = {
  name: '', ico: '', dic: '', address: '', city: '', zip: '', country: '',
  email: '', phone: '', bank_account: '', representative: '',
};

const emptyPersonData: PersonData = {
  name: '', birth_date: '', birth_number: '', address: '', email: '', phone: '',
};

export default function EntitiesPage() {
  const { entities, addEntity, updateEntity, deleteEntity, setDefault } = useEntityStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedEntity | null>(null);

  // Form state
  const [formType, setFormType] = useState<EntityType>('company');
  const [formLabel, setFormLabel] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const filtered = entities.filter(e => filter === 'all' || e.type === filter);

  const openAdd = (type: EntityType) => {
    setEditing(null);
    setFormType(type);
    setFormLabel('');
    setFormData(type === 'company' ? { ...emptyCompanyData } as any : { ...emptyPersonData } as any);
    setDialogOpen(true);
  };

  const openEdit = (entity: SavedEntity) => {
    setEditing(entity);
    setFormType(entity.type);
    setFormLabel(entity.label);
    setFormData({ ...(entity.data as unknown as Record<string, string>) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formLabel.trim()) { toast.error('Zadejte název'); return; }
    if (!formData.name?.trim()) { toast.error('Zadejte jméno / název společnosti'); return; }

    if (editing) {
      updateEntity(editing.id, { label: formLabel, type: formType, data: formData as any });
      toast.success('Subjekt upraven');
    } else {
      addEntity({ label: formLabel, type: formType, data: formData as any, isDefault: false });
      toast.success('Subjekt přidán');
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!editing) return;
    deleteEntity(editing.id);
    toast.success('Subjekt smazán');
    setDeleteDialogOpen(false);
    setEditing(null);
  };

  const companyFields: { key: keyof CompanyData; label: string; required?: boolean }[] = [
    { key: 'name', label: 'Název společnosti', required: true },
    { key: 'ico', label: 'IČO', required: true },
    { key: 'dic', label: 'DIČ' },
    { key: 'address', label: 'Adresa', required: true },
    { key: 'city', label: 'Město' },
    { key: 'zip', label: 'PSČ' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon' },
    { key: 'bank_account', label: 'Číslo účtu' },
    { key: 'representative', label: 'Jednatel / zástupce' },
  ];

  const personFields: { key: keyof PersonData; label: string; required?: boolean }[] = [
    { key: 'name', label: 'Celé jméno', required: true },
    { key: 'birth_date', label: 'Datum narození' },
    { key: 'birth_number', label: 'Rodné číslo' },
    { key: 'address', label: 'Adresa' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon' },
  ];

  const currentFields = formType === 'company' ? companyFields : personFields;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg shrink-0">
            <Link href="/app/settings"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Subjekty</h1>
            <p className="text-xs text-muted-foreground mt-1">Uložené firmy a osoby pro rychlé vyplňování</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl text-[13px]" onClick={() => openAdd('person')}>
            <User className="h-3.5 w-3.5 mr-1.5" />
            Osoba
          </Button>
          <Button className="rounded-xl text-[13px]" onClick={() => openAdd('company')}>
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Firma
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {([['all', 'Vše'], ['company', 'Firmy'], ['person', 'Osoby']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">{filtered.length} subjektů</span>
      </div>

      {/* Entity list */}
      {filtered.length > 0 ? (
        <div className="rounded-2xl border bg-card overflow-hidden">
          {filtered.map((entity, i) => (
            <div key={entity.id} className={`flex items-center gap-3.5 px-4 py-3.5 group transition-colors hover:bg-accent/40 ${i > 0 ? 'border-t' : ''}`}>
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                {entity.type === 'company' ? (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{entity.label}</p>
                  {entity.isDefault && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Výchozí</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {entity.type === 'company'
                    ? `IČ: ${(entity.data as CompanyData).ico} · ${(entity.data as CompanyData).address}`
                    : (entity.data as PersonData).address || (entity.data as PersonData).email || 'Osoba'
                  }
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!entity.isDefault && (
                  <button
                    onClick={() => { setDefault(entity.id); toast.success('Nastaveno jako výchozí'); }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
                    title="Nastavit jako výchozí"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => openEdit(entity)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-all"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => { setEditing(entity); setDeleteDialogOpen(true); }}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Zatím žádné subjekty</p>
          <p className="text-xs text-muted-foreground mb-4">Uložte firmu nebo osobu pro rychlejší vyplňování</p>
          <Button className="rounded-xl" onClick={() => openAdd('company')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Přidat firmu
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Upravit subjekt' : 'Nový subjekt'}</DialogTitle>
          </DialogHeader>

          {/* Type toggle (only for new) */}
          {!editing && (
            <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
              <button
                onClick={() => { setFormType('company'); setFormData({ ...emptyCompanyData } as any); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${formType === 'company' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                <Building2 className="h-3.5 w-3.5 inline mr-1.5" />Firma
              </button>
              <button
                onClick={() => { setFormType('person'); setFormData({ ...emptyPersonData } as any); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${formType === 'person' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                <User className="h-3.5 w-3.5 inline mr-1.5" />Osoba
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {/* ARES Lookup for companies */}
            {formType === 'company' && !editing && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4 text-primary" />
                  Vyhledat podle IČO
                </div>
                <IcoLookup
                  onResult={(result: IcoLookupResult) => {
                    const c = result.company;
                    const overrides = result.overrides;
                    // Auto-fill form fields from ARES data
                    setFormLabel(overrides.name || c.name);
                    setFormData(prev => ({
                      ...prev,
                      name: overrides.name || c.name,
                      ico: c.ico,
                      dic: overrides.dic || c.dic || '',
                      address: overrides.address || c.address,
                      city: c.addressParts.city || '',
                      zip: c.addressParts.postalCode?.replace(/\s/g, '') || '',
                      country: c.addressParts.country || '',
                      representative: c.executives[0]?.name || '',
                    }));
                    toast.success(`Údaje z ARES načteny pro ${c.name}`);
                  }}
                  onClear={() => {
                    setFormData({ ...emptyCompanyData } as any);
                    setFormLabel('');
                  }}
                  compact
                />
              </div>
            )}

            {/* Label */}
            <div>
              <Label className="text-xs text-muted-foreground">Název subjektu <span className="text-destructive">*</span></Label>
              <Input
                value={formLabel}
                onChange={e => setFormLabel(e.target.value)}
                placeholder="např. Moje Firma s.r.o."
                className="h-9 rounded-xl mt-1"
              />
            </div>

            <div className="h-px bg-border" />

            {/* Dynamic fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentFields.map(f => (
                <div key={f.key}>
                  <Label className="text-xs text-muted-foreground">
                    {f.label}
                    {f.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Input
                    value={formData[f.key] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="h-9 rounded-xl mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Zrušit</Button>
            <Button onClick={handleSave} className="rounded-xl">{editing ? 'Uložit' : 'Přidat'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Smazat subjekt?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Subjekt <strong>{editing?.label}</strong> bude trvale smazán.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">Zrušit</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">Smazat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
