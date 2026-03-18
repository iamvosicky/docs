"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, AlertCircle, Search, X, Building2, ExternalLink
} from 'lucide-react';
import { validateIco } from '@/lib/ico-validator';
import type { AresCompanyData, AresLookupResult } from '@/lib/ares-client';
import { mapAresToFormFields, type AutofilledFieldMeta } from '@/lib/ares-form-autofill';
import { toast } from 'sonner';

interface FormIcoAutofillProps {
  /** Group prefix (e.g. "buyer", "seller", "KUP", "PROD") */
  groupPrefix: string;
  /** All field keys in this group */
  fieldKeys: string[];
  /** Current IČO value from form (if already filled) */
  currentIcoValue?: string;
  /** Called when fields should be auto-filled */
  onAutofill: (values: Record<string, string>, meta: Record<string, AutofilledFieldMeta>) => void;
  /** Called when autofill is cleared */
  onClear?: () => void;
}

type LookupState = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

/**
 * Compact inline IČO autofill for form groups.
 * Sits inside the form group header and auto-fills fields when IČO is entered.
 */
export function FormIcoAutofill({
  groupPrefix,
  fieldKeys,
  currentIcoValue,
  onAutofill,
  onClear,
}: FormIcoAutofillProps) {
  const [expanded, setExpanded] = useState(false);
  const [ico, setIco] = useState(currentIcoValue || '');
  const [state, setState] = useState<LookupState>('idle');
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // If current IČO value changes externally, sync
  useEffect(() => {
    if (currentIcoValue && currentIcoValue !== ico) {
      setIco(currentIcoValue);
    }
  }, [currentIcoValue]);

  const handleLookup = useCallback(async (normalizedIco: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setState('loading');
    setError('');

    try {
      const res = await fetch(`/api/ares?ico=${normalizedIco}`, {
        signal: abortRef.current.signal,
      });
      const data: AresLookupResult = await res.json();

      if (data.success && data.data) {
        setState('success');
        setCompanyName(data.data.name);

        // Map ARES data to form fields
        const { values, meta } = mapAresToFormFields(data.data, fieldKeys, groupPrefix);
        onAutofill(values, meta);
        toast.success(`${data.data.name} — údaje načteny z ARES`);
      } else if (res.status === 404) {
        setState('not-found');
        setError('Nenalezeno');
      } else {
        setState('error');
        setError(data.error || 'Chyba');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState('error');
      setError('Registr nedostupný');
    }
  }, [fieldKeys, groupPrefix, onAutofill]);

  const handleIcoChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^\d]/g, '').slice(0, 8);
    setIco(cleaned);
    setError('');
    setState('idle');
    setCompanyName('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (cleaned.length === 8) {
      const validation = validateIco(cleaned);
      if (!validation.valid) {
        setError(validation.error || 'Neplatné IČO');
        return;
      }
      debounceRef.current = setTimeout(() => {
        handleLookup(validation.normalized);
      }, 400);
    }
  }, [handleLookup]);

  const handleClear = () => {
    setIco('');
    setState('idle');
    setError('');
    setCompanyName('');
    setExpanded(false);
    onClear?.();
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Collapsed state — just a small trigger button
  if (!expanded && state !== 'success') {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary transition-colors"
      >
        <Search className="h-3 w-3" />
        Vyhledat podle IČO
      </button>
    );
  }

  // Success state — compact confirmation
  if (state === 'success') {
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3" />
          <span className="max-w-[200px] truncate">{companyName}</span>
          <span className="text-green-600/60">ARES</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // Expanded state — inline lookup
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-[200px]">
        <Input
          value={ico}
          onChange={e => handleIcoChange(e.target.value)}
          placeholder="IČO (8 číslic)"
          maxLength={8}
          inputMode="numeric"
          autoFocus
          className={`h-7 rounded-lg text-xs pr-7 ${
            error ? 'border-destructive' : ''
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {state === 'loading' ? (
            <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
          ) : error ? (
            <AlertCircle className="h-3 w-3 text-destructive" />
          ) : (
            <Search className="h-3 w-3 text-muted-foreground/40" />
          )}
        </div>
      </div>
      {error && (
        <span className="text-[10px] text-destructive whitespace-nowrap">{error}</span>
      )}
      <button
        type="button"
        onClick={() => { setExpanded(false); setIco(''); setState('idle'); setError(''); }}
        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
