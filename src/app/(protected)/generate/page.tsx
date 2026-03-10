'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  FileText, Loader2, Download, ArrowRight, ArrowLeft, CheckCircle2,
  Check, X, Package, ClipboardList, Sparkles, Printer
} from 'lucide-react';
import { getTemplate, getTemplates, getAllTemplates, type Template, getFieldInputType, getFieldPlaceholder, getFieldHint, validateField, type FieldInputType } from '@/lib/template-schemas';
import { downloadDocument, downloadAllAsZip } from '@/lib/document-generator';
import Link from 'next/link';

function GenerateContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Parse URL params
  const usecaseId = searchParams?.get('usecase') || '';
  const rawTemplates = searchParams?.get('templates') || searchParams?.get('template') || '';
  const initialTemplateIds = rawTemplates ? rawTemplates.split(',').filter(Boolean) : [];

  const isMultiDoc = initialTemplateIds.length > 1;

  // Steps: 1=review, 2=fill, 3=done
  const [step, setStep] = useState(isMultiDoc ? 1 : 2);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialTemplateIds));
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Get selected templates with schemas
  // Use state + effect to ensure custom templates from localStorage are loaded after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedTemplates = useMemo(
    () => getTemplates(Array.from(selectedIds)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, mounted]
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Merge all unique fields from selected templates
  const mergedFields = useMemo(() => {
    const fieldMap = new Map<string, { title: string; required: boolean; inputType: FieldInputType }>();
    for (const template of selectedTemplates) {
      const required = new Set(template.schema.required);
      for (const [key, prop] of Object.entries(template.schema.properties)) {
        if (!fieldMap.has(key)) {
          fieldMap.set(key, {
            title: prop.title,
            required: required.has(key),
            inputType: getFieldInputType(key, prop.title),
          });
        }
      }
    }
    return fieldMap;
  }, [selectedTemplates]);

  // Group fields by prefix for better UX
  const groupedFields = useMemo(() => {
    const groups = new Map<string, { key: string; title: string; required: boolean; inputType: FieldInputType }[]>();

    const groupLabels: Record<string, string> = {
      // Old uppercase naming (built-in templates)
      KUP: 'Kupující', PROD: 'Prodávající', ZAM: 'Zaměstnavatel',
      PRAC: 'Pracovník', COMPANY: 'Společnost', REPRESENTATIVE: 'Zástupce',
      ATTORNEY: 'Zmocněnec', PERSON: 'Osoba', SHAREHOLDER: 'Akcionář',
      OWNER: 'Vlastník', ADMINISTRATOR: 'Správce vkladu',
      // New lowercase naming (uploaded/custom templates from analyzer)
      buyer: 'Kupující', seller: 'Prodávající', employer: 'Zaměstnavatel',
      employee: 'Zaměstnanec', principal: 'Zmocnitel', attorney: 'Zmocněnec',
      tenant: 'Nájemce', landlord: 'Pronajímatel', creditor: 'Věřitel',
      debtor: 'Dlužník', representative: 'Zástupce', administrator: 'Správce vkladu',
      shareholder: 'Akcionář',
    };

    for (const [key, field] of mergedFields) {
      let group = 'Obecné údaje';
      const parts = key.split('_');
      if (parts.length > 1) {
        if (groupLabels[parts[0]]) {
          group = groupLabels[parts[0]];
        }
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ key, title: field.title, required: field.required, inputType: field.inputType });
    }
    return groups;
  }, [mergedFields]);

  const toggleTemplate = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    // Mark all fields as touched
    const allKeys = new Set(Array.from(mergedFields.keys()));
    setTouchedFields(allKeys);

    // Validate required fields and field formats
    const missing: string[] = [];
    const invalid: string[] = [];
    const newErrors: Record<string, string | null> = {};

    for (const [key, field] of mergedFields) {
      const val = formValues[key]?.trim() || '';
      if (field.required && !val) {
        missing.push(field.title);
      }
      const err = validateField(val, field.inputType);
      if (err && val) {
        invalid.push(field.title);
        newErrors[key] = err;
      }
    }
    setFieldErrors(prev => ({ ...prev, ...newErrors }));

    if (missing.length > 0) {
      toast.error(`Vyplňte povinná pole: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` a dalších ${missing.length - 3}` : ''}`);
      return;
    }
    if (invalid.length > 0) {
      toast.error(`Opravte neplatné hodnoty: ${invalid.slice(0, 3).join(', ')}`);
      return;
    }

    setIsGenerating(true);
    try {
      // Documents will be generated on-demand when downloading
      // Just validate and move to step 3
      setStep(3);
      toast.success(`${selectedTemplates.length} ${selectedTemplates.length === 1 ? 'dokument připraven' : 'dokumentů připraveno'} ke stažení`);
    } catch {
      toast.error('Generování selhalo. Zkuste to znovu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Use case label
  const usecaseLabels: Record<string, string> = {
    'company-formation': 'Založení a.s.',
    'create-company': 'Založení společnosti',
    'employment': 'Zaměstnání',
    'business-contracts': 'Obchodní smlouvy',
    'purchase': 'Nákup a prodej',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper header */}
      {isMultiDoc && (
        <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8">
          {[
            { num: 1, label: 'Dokumenty', icon: ClipboardList },
            { num: 2, label: 'Údaje', icon: FileText },
            { num: 3, label: 'Hotovo', icon: Sparkles },
          ].map(({ num, label, icon: Icon }, i) => (
            <div key={num} className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= num ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                  step > num
                    ? 'bg-primary text-primary-foreground'
                    : step === num
                    ? 'bg-primary/15 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground/50'
                }`}>
                  {step > num ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : num}
                </div>
                <span className="text-xs sm:text-sm font-medium">{label}</span>
              </div>
              {i < 2 && (
                <div className={`h-px flex-1 min-w-3 sm:min-w-4 ${step > num ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Page title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {step === 3 ? <Sparkles className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {step === 1 && 'Vyberte dokumenty'}
              {step === 2 && 'Vyplňte údaje'}
              {step === 3 && 'Dokumenty připraveny'}
            </h1>
          </div>
        </div>
        {usecaseId && usecaseLabels[usecaseId] && step < 3 && (
          <p className="text-muted-foreground ml-[3.25rem]">
            {usecaseLabels[usecaseId]} &mdash; {selectedIds.size} {selectedIds.size === 1 ? 'dokument' : selectedIds.size <= 4 ? 'dokumenty' : 'dokumentů'}
          </p>
        )}
      </div>

      {/* STEP 1: Review & select documents */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">Dokumenty v sadě</span>
              <span className="text-xs text-muted-foreground">
                {selectedIds.size} z {initialTemplateIds.length} vybráno
              </span>
            </div>
            <div className="divide-y">
              {initialTemplateIds.map(id => {
                const template = getTemplate(id);
                if (!template) return null;
                const isSelected = selectedIds.has(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50 ${
                      !isSelected ? 'opacity-50' : ''
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleTemplate(id)}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                    </div>
                    <span className="tag-pill px-2 py-0.5 rounded text-[10px] font-medium shrink-0">
                      {Object.keys(template.schema.properties).length} polí
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" asChild className="rounded-xl">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zpět
              </Link>
            </Button>
            <Button
              onClick={() => setStep(2)}
              className="rounded-xl"
              disabled={selectedIds.size === 0}
            >
              Pokračovat
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Fill in fields */}
      {step === 2 && (
        <div className="space-y-5">
          {Array.from(groupedFields.entries()).map(([groupName, fields]) => (
            <div key={groupName} className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30">
                <span className="text-sm font-medium">{groupName}</span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(field => {
                  const hint = getFieldHint(field.inputType);
                  const error = touchedFields.has(field.key) ? fieldErrors[field.key] : null;
                  const placeholder = getFieldPlaceholder(field.key, field.inputType, field.title);
                  const isTouched = touchedFields.has(field.key);
                  const isEmpty = !formValues[field.key]?.trim();

                  const handleBlur = () => {
                    setTouchedFields(prev => new Set(prev).add(field.key));
                    const val = formValues[field.key] || '';
                    const err = validateField(val, field.inputType);
                    setFieldErrors(prev => ({ ...prev, [field.key]: err }));
                  };

                  const handleChange = (val: string) => {
                    // Auto-format currency with spaces
                    if (field.inputType === 'currency') {
                      const digits = val.replace(/[^\d]/g, '');
                      const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                      setFormValues(prev => ({ ...prev, [field.key]: formatted }));
                    }
                    // Auto-format RC with slash
                    else if (field.inputType === 'rc') {
                      const digits = val.replace(/[^\d]/g, '');
                      const formatted = digits.length > 6 ? digits.slice(0, 6) + '/' + digits.slice(6, 10) : digits;
                      setFormValues(prev => ({ ...prev, [field.key]: formatted }));
                    }
                    // Auto-format IČO - max 8 digits
                    else if (field.inputType === 'ico') {
                      const digits = val.replace(/[^\d]/g, '').slice(0, 8);
                      setFormValues(prev => ({ ...prev, [field.key]: digits }));
                    }
                    // Date from native picker -> convert to Czech format for display
                    else if (field.inputType === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      const [y, m, d] = val.split('-');
                      setFormValues(prev => ({ ...prev, [field.key]: `${d}.${m}.${y}` }));
                    }
                    else {
                      setFormValues(prev => ({ ...prev, [field.key]: val }));
                    }

                    // Clear error on change if touched
                    if (touchedFields.has(field.key)) {
                      const err = validateField(val, field.inputType);
                      setFieldErrors(prev => ({ ...prev, [field.key]: err }));
                    }
                  };

                  // Full width for textarea fields
                  const isFullWidth = field.inputType === 'textarea';

                  return (
                    <div key={field.key} className={isFullWidth ? 'sm:col-span-2' : ''}>
                      <Label htmlFor={field.key} className="text-xs font-medium mb-1.5 block text-muted-foreground">
                        {field.title}
                        {field.required && <span className="text-destructive ml-0.5">*</span>}
                        {hint && !error && (
                          <span className="ml-1.5 text-[10px] text-muted-foreground/60 font-normal">{hint}</span>
                        )}
                      </Label>

                      {field.inputType === 'textarea' ? (
                        <textarea
                          id={field.key}
                          value={formValues[field.key] || ''}
                          onChange={e => handleChange(e.target.value)}
                          onBlur={handleBlur}
                          placeholder={placeholder}
                          rows={3}
                          disabled={isGenerating}
                          className={`flex w-full rounded-xl border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:opacity-50 resize-none ${
                            error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-input'
                          }`}
                        />
                      ) : field.inputType === 'date' ? (
                        <div className="relative">
                          <Input
                            id={field.key}
                            type="date"
                            value={formValues[field.key] ? (() => {
                              // Convert dd.mm.yyyy to yyyy-mm-dd for the input
                              const parts = formValues[field.key].match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
                              if (parts) return `${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
                              return formValues[field.key];
                            })() : ''}
                            onChange={e => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            disabled={isGenerating}
                            className={`h-10 rounded-xl text-sm ${
                              error ? 'border-destructive focus-visible:ring-destructive/30' : ''
                            }`}
                          />
                        </div>
                      ) : field.inputType === 'currency' ? (
                        <div className="relative">
                          <Input
                            id={field.key}
                            inputMode="numeric"
                            value={formValues[field.key] || ''}
                            onChange={e => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            disabled={isGenerating}
                            className={`h-10 rounded-xl text-sm pr-10 ${
                              error ? 'border-destructive focus-visible:ring-destructive/30' : ''
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">Kč</span>
                        </div>
                      ) : field.inputType === 'number' ? (
                        <Input
                          id={field.key}
                          inputMode="numeric"
                          value={formValues[field.key] || ''}
                          onChange={e => handleChange(e.target.value)}
                          onBlur={handleBlur}
                          placeholder={placeholder}
                          disabled={isGenerating}
                          className={`h-10 rounded-xl text-sm ${
                            error ? 'border-destructive focus-visible:ring-destructive/30' : ''
                          }`}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          value={formValues[field.key] || ''}
                          onChange={e => handleChange(e.target.value)}
                          onBlur={handleBlur}
                          placeholder={placeholder}
                          disabled={isGenerating}
                          maxLength={field.inputType === 'ico' ? 8 : field.inputType === 'rc' ? 11 : undefined}
                          className={`h-10 rounded-xl text-sm ${
                            error ? 'border-destructive focus-visible:ring-destructive/30' : ''
                          }`}
                        />
                      )}

                      {/* Error message */}
                      {error && (
                        <p className="text-[11px] text-destructive mt-1 ml-1">{error}</p>
                      )}

                      {/* Required but empty after touch */}
                      {!error && isTouched && isEmpty && field.required && (
                        <p className="text-[11px] text-destructive mt-1 ml-1">Povinné pole</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Selected docs summary (compact) */}
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Budou vygenerovány ({selectedTemplates.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplates.map(t => (
                <span key={t.id} className="tag-pill px-2.5 py-1 rounded-lg text-[11px] font-medium inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
            {isMultiDoc ? (
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zpět k výběru
              </Button>
            ) : (
              <Button variant="ghost" asChild className="rounded-xl">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Zpět
                </Link>
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-xl h-11 px-6 w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generování...
                </>
              ) : (
                <>
                  Generovat {selectedTemplates.length > 1 ? `${selectedTemplates.length} dokumentů` : 'dokument'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Done - download results */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
            <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-green-100 dark:bg-green-900/30 items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedTemplates.length === 1 ? 'Dokument vygenerován' : `${selectedTemplates.length} dokumentů vygenerováno`}
            </h2>
            <p className="text-sm text-muted-foreground">
              Stáhněte DOCX přímo, nebo uložte jako PDF přes tisk
            </p>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Ke stažení</span>
            </div>
            <div className="divide-y">
              {selectedTemplates.map(template => (
                <div key={template.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-12 sm:ml-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs h-9 sm:h-8 flex-1 sm:flex-none min-w-0"
                      disabled={downloadingId === `${template.id}-pdf`}
                      onClick={async () => {
                        setDownloadingId(`${template.id}-pdf`);
                        try {
                          await downloadDocument(template, formValues, 'pdf');
                          toast.success(`${template.name} (PDF) stažen`);
                        } catch (e) {
                          toast.error('Stahování selhalo');
                        } finally {
                          setDownloadingId(null);
                        }
                      }}
                    >
                      {downloadingId === `${template.id}-pdf` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Printer className="h-3 w-3 mr-1" />}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs h-9 sm:h-8 flex-1 sm:flex-none min-w-0"
                      disabled={downloadingId === `${template.id}-docx`}
                      onClick={async () => {
                        setDownloadingId(`${template.id}-docx`);
                        try {
                          await downloadDocument(template, formValues, 'docx');
                          toast.success(`${template.name} (DOCX) stažen`);
                        } catch (e) {
                          toast.error('Stahování selhalo');
                        } finally {
                          setDownloadingId(null);
                        }
                      }}
                    >
                      {downloadingId === `${template.id}-docx` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                      DOCX
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedTemplates.length > 1 && (
            <Button
              variant="outline"
              className="w-full rounded-xl h-11"
              disabled={downloadingId === 'zip'}
              onClick={async () => {
                setDownloadingId('zip');
                try {
                  await downloadAllAsZip(selectedTemplates, formValues);
                  toast.success('ZIP archiv stažen');
                } catch (e) {
                  toast.error('Stahování selhalo');
                } finally {
                  setDownloadingId(null);
                }
              }}
            >
              {downloadingId === 'zip' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Stáhnout vše DOCX (ZIP)
            </Button>
          )}

          <div className="text-center pt-2">
            <Button variant="ghost" asChild className="rounded-xl text-muted-foreground">
              <Link href="/">
                Vytvořit další dokumenty
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GenerateDocumentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-6 w-72 bg-muted rounded-lg" />
        <div className="h-64 w-full bg-muted rounded-2xl" />
      </div>
    }>
      <GenerateContent />
    </Suspense>
  );
}
