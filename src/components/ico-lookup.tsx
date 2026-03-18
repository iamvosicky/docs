"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Loader2, CheckCircle2, AlertCircle, Building2, User,
  ChevronDown, ChevronRight, Search, ExternalLink, Edit3,
  Shield, Users, X
} from 'lucide-react';
import { validateIco, isCompleteIco } from '@/lib/ico-validator';
import type { AresCompanyData, AresLookupResult, AresShareholder } from '@/lib/ares-client';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IcoLookupResult {
  /** The fetched company data */
  company: AresCompanyData;
  /** Which fields user has manually overridden */
  overrides: Record<string, string>;
}

interface IcoLookupProps {
  /** Called when company data is confirmed (auto or manual) */
  onResult: (result: IcoLookupResult) => void;
  /** Called when user clears the lookup */
  onClear?: () => void;
  /** Initial IČO value */
  initialIco?: string;
  /** Compact mode — less spacing */
  compact?: boolean;
}

type LookupState = 'idle' | 'validating' | 'loading' | 'success' | 'not-found' | 'error';

// ─── Component ───────────────────────────────────────────────────────────────

export function IcoLookup({ onResult, onClear, initialIco, compact }: IcoLookupProps) {
  const [ico, setIco] = useState(initialIco || '');
  const [state, setState] = useState<LookupState>('idle');
  const [error, setError] = useState('');
  const [company, setCompany] = useState<AresCompanyData | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showExecutives, setShowExecutives] = useState(false);
  const [showShareholders, setShowShareholders] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-lookup on debounce when IČO looks complete
  const handleIcoChange = useCallback((value: string) => {
    // Only allow digits and spaces
    const cleaned = value.replace(/[^\d\s]/g, '');
    setIco(cleaned);
    setError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const digits = cleaned.replace(/\s/g, '');
    if (digits.length === 8) {
      // Validate immediately
      const validation = validateIco(digits);
      if (!validation.valid) {
        setError(validation.error || 'Neplatné IČO');
        setState('idle');
        return;
      }
      // Debounce the actual lookup
      setState('validating');
      debounceRef.current = setTimeout(() => {
        performLookup(validation.normalized);
      }, 400);
    } else if (digits.length > 8) {
      setError('IČO má maximálně 8 číslic');
    } else {
      setState('idle');
      setCompany(null);
    }
  }, []);

  // Perform the ARES lookup
  const performLookup = useCallback(async (normalizedIco: string) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setState('loading');
    setError('');
    setCompany(null);
    setOverrides({});

    try {
      const res = await fetch(`/api/ares?ico=${normalizedIco}`, {
        signal: abortRef.current.signal,
      });

      const data: AresLookupResult = await res.json();

      if (data.success && data.data) {
        setState('success');
        setCompany(data.data);
        onResult({ company: data.data, overrides: {} });
      } else if (res.status === 404) {
        setState('not-found');
        setError(data.error || 'Subjekt nebyl nalezen');
      } else {
        setState('error');
        setError(data.error || 'Chyba při vyhledávání');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState('error');
      setError('Nepodařilo se kontaktovat registr');
    }
  }, [onResult]);

  // Manual retry
  const handleRetry = () => {
    const digits = ico.replace(/\s/g, '');
    const validation = validateIco(digits);
    if (validation.valid) {
      performLookup(validation.normalized);
    }
  };

  // Clear
  const handleClear = () => {
    setIco('');
    setState('idle');
    setError('');
    setCompany(null);
    setOverrides({});
    onClear?.();
  };

  // Override a field
  const handleOverride = (key: string, value: string) => {
    const newOverrides = { ...overrides, [key]: value };
    setOverrides(newOverrides);
    setEditingField(null);
    if (company) {
      onResult({ company, overrides: newOverrides });
    }
  };

  // Get display value (override or original)
  const getValue = (key: string, original?: string) => {
    return overrides[key] ?? original ?? '';
  };

  const isOverridden = (key: string) => key in overrides;

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* IČO Input */}
      <div>
        <Label htmlFor="ico-input" className="text-xs font-medium text-muted-foreground mb-1.5 block">
          IČO <span className="text-destructive">*</span>
          <span className="ml-1.5 text-[10px] text-muted-foreground/60 font-normal">8 číslic</span>
        </Label>
        <div className="relative">
          <Input
            id="ico-input"
            value={ico}
            onChange={e => handleIcoChange(e.target.value)}
            placeholder="Např. 27074358"
            maxLength={11}
            inputMode="numeric"
            className={`h-10 rounded-xl text-sm pr-10 ${
              error ? 'border-destructive focus-visible:ring-destructive/30' :
              state === 'success' ? 'border-green-500 focus-visible:ring-green-500/30' : ''
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {state === 'loading' || state === 'validating' ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : state === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : state === 'error' || state === 'not-found' ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
        </div>
        {error && (
          <p className="text-[11px] text-destructive mt-1 ml-1">{error}</p>
        )}
        {state === 'loading' && (
          <p className="text-[11px] text-muted-foreground mt-1 ml-1">Vyhledávám v registru ARES...</p>
        )}
      </div>

      {/* Not found state */}
      {state === 'not-found' && (
        <div className="rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Subjekt nebyl nalezen
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                IČO {ico} nebylo nalezeno v registru ARES. Můžete zadat údaje ručně.
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" onClick={handleRetry}>
                  Zkusit znovu
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-xs h-7" onClick={handleClear}>
                  Zadat jiné IČO
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="rounded-xl border border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Registr není dostupný
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" onClick={handleRetry}>
                  Zkusit znovu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success — Company data */}
      {state === 'success' && company && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Údaje z registru ARES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                company.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {company.statusLabel}
              </span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={handleClear}>
                <X className="h-3 w-3 mr-1" />
                Zrušit
              </Button>
            </div>
          </div>

          {/* Company fields */}
          <div className="divide-y">
            {/* Name */}
            <CompanyField
              label="Obchodní firma"
              value={getValue('name', company.name)}
              isAutoFilled={!isOverridden('name')}
              isEditing={editingField === 'name'}
              onEdit={() => setEditingField('name')}
              onSave={(v) => handleOverride('name', v)}
              onCancel={() => setEditingField(null)}
            />

            {/* IČO */}
            <CompanyField
              label="IČO"
              value={company.ico}
              isAutoFilled
              isEditing={false}
              onEdit={() => {}}
              onSave={() => {}}
              onCancel={() => {}}
              readOnly
            />

            {/* DIČ */}
            {company.dic && (
              <CompanyField
                label="DIČ"
                value={getValue('dic', company.dic)}
                isAutoFilled={!isOverridden('dic')}
                isEditing={editingField === 'dic'}
                onEdit={() => setEditingField('dic')}
                onSave={(v) => handleOverride('dic', v)}
                onCancel={() => setEditingField(null)}
              />
            )}

            {/* Legal form */}
            {company.legalForm && (
              <CompanyField
                label="Právní forma"
                value={company.legalForm}
                isAutoFilled
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                readOnly
              />
            )}

            {/* Address */}
            <CompanyField
              label="Sídlo"
              value={getValue('address', company.address)}
              isAutoFilled={!isOverridden('address')}
              isEditing={editingField === 'address'}
              onEdit={() => setEditingField('address')}
              onSave={(v) => handleOverride('address', v)}
              onCancel={() => setEditingField(null)}
            />

            {/* Registration */}
            {company.registration?.fileNumber && (
              <CompanyField
                label="Spisová značka"
                value={`${company.registration.fileNumber}${company.registration.court ? `, ${company.registration.court}` : ''}`}
                isAutoFilled
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                readOnly
              />
            )}

            {/* Date established */}
            {company.dateEstablished && (
              <CompanyField
                label="Datum vzniku"
                value={new Date(company.dateEstablished).toLocaleDateString('cs-CZ')}
                isAutoFilled
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                readOnly
              />
            )}
          </div>

          {/* Executives */}
          {company.executives.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => setShowExecutives(!showExecutives)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">Statutární orgán</span>
                  <span className="tag-pill px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {company.executives.length}
                  </span>
                </div>
                {showExecutives ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              {showExecutives && (
                <div className="px-5 pb-4 space-y-2">
                  {company.executives.map((exec, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium">{exec.name}</span>
                        <span className="text-muted-foreground ml-1.5">— {exec.role}</span>
                        {exec.dateFrom && (
                          <span className="text-muted-foreground/60 ml-1 text-xs">
                            (od {new Date(exec.dateFrom).toLocaleDateString('cs-CZ')})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shareholders */}
          {company.shareholders.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => setShowShareholders(!showShareholders)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">Společníci / akcionáři</span>
                  <span className="tag-pill px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {company.shareholders.length}
                  </span>
                </div>
                {showShareholders ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              {showShareholders && (
                <div className="px-5 pb-4 space-y-3">
                  {company.shareholders.map((sh, i) => (
                    <ShareholderRow key={i} shareholder={sh} />
                  ))}
                </div>
              )}
            </div>
          )}

          {company.shareholders.length === 0 && (
            <div className="border-t px-5 py-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Údaje o společnících nejsou dostupné z registru. Zadejte ručně.</span>
            </div>
          )}

          {/* Source footer */}
          <div className="border-t px-5 py-2 bg-muted/20 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/60">
              Zdroj: ARES (Ministerstvo financí ČR) &middot; Načteno {new Date(company.fetchedAt).toLocaleTimeString('cs-CZ')}
            </span>
            <a
              href={`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${company.ico}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
            >
              Zobrazit v ARES <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CompanyField({
  label,
  value,
  isAutoFilled,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  readOnly,
}: {
  label: string;
  value: string;
  isAutoFilled: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  readOnly?: boolean;
}) {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  return (
    <div className="px-5 py-2.5 flex items-center gap-3">
      <div className="w-28 shrink-0">
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              className="h-7 rounded-lg text-sm"
              onKeyDown={e => {
                if (e.key === 'Enter') onSave(editValue);
                if (e.key === 'Escape') onCancel();
              }}
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onSave(editValue)}>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{value || '—'}</span>
            {isAutoFilled && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium shrink-0">
                ARES
              </span>
            )}
            {!isAutoFilled && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shrink-0">
                Upraveno
              </span>
            )}
          </div>
        )}
      </div>
      {!readOnly && !isEditing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function ShareholderRow({ shareholder }: { shareholder: AresShareholder }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{shareholder.name}</span>
        {shareholder.percentage !== undefined && (
          <span className="tag-pill px-2 py-0.5 rounded text-[11px] font-medium">
            {shareholder.percentage} %
          </span>
        )}
      </div>
      {(shareholder.capitalContribution || shareholder.shareDescription) && (
        <div className="mt-1 text-xs text-muted-foreground">
          {shareholder.capitalContribution && (
            <span>Vklad: {shareholder.capitalContribution.toLocaleString('cs-CZ')} Kč</span>
          )}
          {shareholder.capitalContribution && shareholder.paidUp !== undefined && ' · '}
          {shareholder.paidUp !== undefined && (
            <span className={shareholder.paidUp ? 'text-green-600' : 'text-amber-600'}>
              {shareholder.paidUp ? 'Splaceno' : 'Nesplaceno'}
            </span>
          )}
          {shareholder.shareDescription && !shareholder.capitalContribution && (
            <span>{shareholder.shareDescription}</span>
          )}
        </div>
      )}
    </div>
  );
}
