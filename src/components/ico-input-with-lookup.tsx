"use client";

import { useState, useCallback, useRef, useEffect, useId } from 'react';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, AlertCircle, Undo2, Search
} from 'lucide-react';
import { validateIco } from '@/lib/ico-validator';
import type { AresCompanyData, AresLookupResult } from '@/lib/ares-client';
import { mapAresToFormFields } from '@/lib/ares-form-autofill';

// ─── Types ───────────────────────────────────────────────────────────────────

type LookupState = 'idle' | 'loading' | 'preview' | 'applied' | 'not-found' | 'error';

interface IcoInputWithLookupProps {
  fieldKey: string;
  value: string;
  groupFieldKeys: string[];
  groupPrefix: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onAutofill: (values: Record<string, string>) => void;
  onBlur?: () => void;
  hasError?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function IcoInputWithLookup({
  fieldKey,
  value,
  groupFieldKeys,
  groupPrefix,
  placeholder,
  disabled,
  className,
  onChange,
  onAutofill,
  onBlur,
  hasError,
}: IcoInputWithLookupProps) {
  const [state, setState] = useState<LookupState>('idle');
  const [company, setCompany] = useState<AresCompanyData | null>(null);
  const [error, setError] = useState('');
  const [previousValues, setPreviousValues] = useState<Record<string, string> | null>(null);
  const [optionFocused, setOptionFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [announcement, setAnnouncement] = useState('');

  // Stable IDs for ARIA
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionId = `${uid}-option`;
  const descriptionId = `${uid}-desc`;

  const isDropdownOpen = state === 'preview' || state === 'not-found' || state === 'error';

  // ─── Screen reader announcements ─────────────────────────────────────
  const announce = useCallback((msg: string) => {
    setAnnouncement('');
    // Force re-render so screen reader picks up the change
    requestAnimationFrame(() => setAnnouncement(msg));
  }, []);

  // ─── Close dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setState('idle');
        setOptionFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ─── ARES lookup ─────────────────────────────────────────────────────
  const performLookup = useCallback(async (normalizedIco: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setState('loading');
    setError('');
    setCompany(null);
    announce('Ověřuji v registru ARES');

    try {
      const res = await fetch(`/api/ares?ico=${normalizedIco}`, {
        signal: abortRef.current.signal,
      });
      const data: AresLookupResult = await res.json();

      if (data.success && data.data) {
        setCompany(data.data);
        setState('preview');
        setOptionFocused(false);
        announce(`Nalezen 1 výsledek: ${data.data.name}. Potvrďte klávesou Enter nebo klikněte na Použít.`);
      } else if (res.status === 404) {
        setState('not-found');
        setError('Subjekt nebyl nalezen v registru');
        announce('Subjekt nebyl nalezen v registru ARES');
      } else {
        setState('error');
        setError(data.error || 'Nepodařilo se vyhledat');
        announce('Chyba při načítání z registru');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState('error');
      setError('Registr není dostupný');
      announce('Registr není dostupný');
    }
  }, [announce]);

  // ─── Input change ────────────────────────────────────────────────────
  const handleChange = useCallback((val: string) => {
    const digits = val.replace(/[^\d]/g, '').slice(0, 8);
    onChange(digits);
    setError('');
    setOptionFocused(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (state === 'applied') {
      setState('idle');
      setCompany(null);
    }

    if (digits.length === 8) {
      const validation = validateIco(digits);
      if (!validation.valid) {
        setError(validation.error || '');
        setState('idle');
        announce(validation.error || 'Neplatné IČO');
        return;
      }
      debounceRef.current = setTimeout(() => {
        performLookup(validation.normalized);
      }, 500);
    } else {
      setState('idle');
      setCompany(null);
    }
  }, [onChange, performLookup, state, announce]);

  // ─── Confirm autofill ────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!company) return;
    const { values } = mapAresToFormFields(company, groupFieldKeys, groupPrefix);
    setPreviousValues(values);
    onAutofill(values);
    setState('applied');
    setOptionFocused(false);
    announce(`Údaje byly automaticky doplněny z ARES pro ${company.name}`);
    // Return focus to input
    inputRef.current?.focus();
  }, [company, groupFieldKeys, groupPrefix, onAutofill, announce]);

  // ─── Undo ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (!previousValues) return;
    const cleared: Record<string, string> = {};
    for (const key of Object.keys(previousValues)) {
      cleared[key] = '';
    }
    onAutofill(cleared);
    setState('idle');
    setCompany(null);
    setPreviousValues(null);
    onChange('');
    announce('Automaticky doplněné údaje byly vráceny');
    inputRef.current?.focus();
  }, [previousValues, onAutofill, onChange, announce]);

  // ─── Dismiss dropdown ────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setState('idle');
    setCompany(null);
    setOptionFocused(false);
    inputRef.current?.focus();
  }, []);

  // ─── Keyboard navigation ────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (state === 'preview' && company) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOptionFocused(true);
        announce(`${company.name}, ${company.address}. Potvrďte klávesou Enter.`);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    } else if (state === 'not-found' || state === 'error') {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        handleDismiss();
      }
    }
  }, [state, company, handleConfirm, handleDismiss, announce]);

  // ─── Derived state ───────────────────────────────────────────────────
  const showHelper = state === 'idle' && value.length === 0;
  const showCounter = state === 'idle' && value.length > 0 && value.length < 8;

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Live region for screen reader announcements ── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* ── Input with ARIA combobox ── */}
      <div className="relative">
        <input
          ref={inputRef}
          id={fieldKey}
          type="text"
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-controls={isDropdownOpen ? listboxId : undefined}
          aria-activedescendant={isDropdownOpen && optionFocused ? optionId : undefined}
          aria-autocomplete="list"
          aria-describedby={descriptionId}
          aria-invalid={hasError && state !== 'applied' ? true : undefined}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder={placeholder || 'Zadejte IČO'}
          maxLength={8}
          inputMode="numeric"
          disabled={disabled}
          autoComplete="off"
          className={`flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10 font-mono tracking-wide ${
            hasError && state !== 'applied' ? 'border-destructive focus-visible:ring-destructive/30' :
            state === 'applied' ? 'border-green-500/40 bg-green-50/20 dark:bg-green-950/10' :
            state === 'preview' ? 'border-primary ring-2 ring-primary/20' : ''
          } ${className || ''}`}
        />
        {/* Right icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none" aria-hidden="true">
          {state === 'loading' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          {state === 'applied' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {(state === 'not-found' || state === 'error') && <AlertCircle className="h-4 w-4 text-amber-500" />}
          {state === 'idle' && value.length === 0 && <Search className="h-4 w-4 text-muted-foreground/30" />}
          {showCounter && (
            <span className="text-[10px] text-muted-foreground/40 tabular-nums font-mono">{value.length}/8</span>
          )}
        </div>
      </div>

      {/* ── Description for screen readers ── */}
      <p id={descriptionId} className="sr-only">
        Identifikační číslo osoby, 8 číslic. Po zadání platného IČO systém automaticky vyhledá údaje v registru ARES.
      </p>

      {/* Helper text — idle state */}
      {showHelper && (
        <p className="text-[11px] text-muted-foreground/60 mt-1 ml-0.5" aria-hidden="true">
          Zadejte IČO a údaje doplníme automaticky z ARES
        </p>
      )}

      {/* Loading text */}
      {state === 'loading' && (
        <p className="text-[11px] text-muted-foreground mt-1 ml-0.5 flex items-center gap-1" aria-hidden="true">
          <span className="inline-block h-1 w-1 rounded-full bg-primary animate-pulse" />
          Ověřuji v registru ARES...
        </p>
      )}

      {/* Validation error (not from ARES) */}
      {error && state === 'idle' && (
        <p className="text-[11px] text-destructive mt-1 ml-0.5" role="alert">{error}</p>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* Preview listbox                                    */}
      {/* ────────────────────────────────────────────────── */}
      {state === 'preview' && company && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Výsledky vyhledávání IČO"
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border bg-popover shadow-md animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <div
            id={optionId}
            role="option"
            aria-selected={optionFocused}
            tabIndex={-1}
            onClick={handleConfirm}
            onMouseEnter={() => setOptionFocused(true)}
            onMouseLeave={() => setOptionFocused(false)}
            className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
              optionFocused ? 'bg-accent/60' : 'hover:bg-accent/40'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-tight truncate">{company.name}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{company.address}</p>
            </div>
            <span
              className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium"
              aria-hidden="true"
            >
              Použít
            </span>
          </div>
          <div className="border-t px-3 py-1 flex items-center justify-between" aria-hidden="true">
            <span className="text-[9px] text-muted-foreground/50">ARES · Ministerstvo financí ČR</span>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground"
              tabIndex={-1}
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* ── Not found ── */}
      {state === 'not-found' && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Výsledky vyhledávání IČO"
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-amber-200/40 dark:border-amber-800/30 bg-popover shadow-md animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <div role="option" aria-selected="false" className="px-3 py-2.5 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground flex-1">
              IČO <span className="font-mono">{value}</span> nebylo nalezeno
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground shrink-0"
              tabIndex={-1}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Výsledky vyhledávání IČO"
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-red-200/40 dark:border-red-800/30 bg-popover shadow-md animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <div role="option" aria-selected="false" className="px-3 py-2.5 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground flex-1">{error}</p>
            <button
              type="button"
              onClick={() => {
                const validation = validateIco(value);
                if (validation.valid) performLookup(validation.normalized);
              }}
              className="text-[11px] text-primary font-medium shrink-0"
              tabIndex={-1}
            >
              Znovu
            </button>
          </div>
        </div>
      )}

      {/* ── Applied: inline success ── */}
      {state === 'applied' && company && (
        <div className="mt-1.5 flex items-center gap-1.5" role="status">
          <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" aria-hidden="true" />
          <span className="text-[11px] text-green-700 dark:text-green-400">
            Doplněno z ARES
          </span>
          <span className="text-[11px] text-muted-foreground/40 mx-0.5" aria-hidden="true">·</span>
          <span className="text-[11px] text-muted-foreground/60 truncate max-w-[180px]">
            {company.name}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground/60 hover:text-foreground font-medium ml-auto shrink-0"
            aria-label={`Vrátit automatické doplnění údajů pro ${company.name}`}
          >
            <Undo2 className="h-3 w-3" aria-hidden="true" />
            Vrátit
          </button>
        </div>
      )}
    </div>
  );
}
