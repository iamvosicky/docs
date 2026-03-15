'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  Upload, FileText, Loader2, ArrowRight, ArrowLeft, Check,
  Sparkles, AlertCircle, Eye, EyeOff, Trash2, Edit3,
  ClipboardList, Search, Download, ChevronDown, ChevronRight,
  X, CheckCircle2, FileUp, FolderOpen
} from 'lucide-react';
import {
  analyzeDocx, analyzeDocument,
  type AnalysisResult, type DetectedField,
  analysisToSchema
} from '@/lib/document-analyzer';
import { toast } from 'sonner';
import { DocumentSetPicker } from '@/components/document-set-picker';
import { useDocumentSetStore } from '@/lib/document-set-store';

type Step = 'upload' | 'review' | 'done';

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [removedFields, setRemovedFields] = useState<Set<string>>(new Set());
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'txt') {
      toast.error('Podporované formáty: DOCX, TXT');
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);
    setRemovedFields(new Set());
    setEditingField(null);

    try {
      let result: AnalysisResult;

      if (ext === 'docx') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        result = analyzeDocx(arrayBuffer);
      } else {
        const text = await selectedFile.text();
        result = analyzeDocument(text);
      }

      setAnalysis(result);

      // Auto-fill template name from filename
      const baseName = selectedFile.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setTemplateName(baseName.charAt(0).toUpperCase() + baseName.slice(1));

      // Expand all groups by default
      setExpandedGroups(new Set(result.groups));

      if (result.fields.length > 0) {
        setStep('review');
        toast.success(`Nalezeno ${result.fields.length} proměnných polí`);
      } else {
        toast.warning('Nebyly nalezeny žádné proměnné. Zkontrolujte dokument.');
        setStep('review');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Nepodařilo se analyzovat dokument');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  // Toggle field removal
  const toggleFieldRemoval = (fieldName: string) => {
    setRemovedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldName)) next.delete(fieldName);
      else next.add(fieldName);
      return next;
    });
  };

  // Rename a field
  const renameField = (oldName: string, newTitle: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      fields: analysis.fields.map(f =>
        f.name === oldName ? { ...f, title: newTitle } : f
      ),
    });
    setEditingField(null);
  };

  // Toggle group expand
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // Get active (non-removed) fields
  const activeFields = analysis?.fields.filter(f => !removedFields.has(f.name)) || [];
  const activeGroups = [...new Set(activeFields.map(f => f.group))];

  // Build final template text (re-inline removed fields)
  const getFinalTemplate = () => {
    if (!analysis) return '';
    let text = analysis.templateText;
    for (const field of analysis.fields) {
      if (removedFields.has(field.name)) {
        // Put back original text for removed fields
        text = text.replace(`{{${field.name}}}`, field.originalText);
      }
    }
    return text;
  };

  // Generate JSON output
  const getOutputJson = () => {
    if (!analysis) return null;
    // Filter entities to only include active fields
    const activeFieldNames = new Set(activeFields.map(f => f.name));
    const activeEntities = (analysis.entities || [])
      .map(e => ({
        ...e,
        fields: e.fields.filter(fn => activeFieldNames.has(fn)),
      }))
      .filter(e => e.fields.length > 0);

    return {
      template_text: getFinalTemplate(),
      fields: activeFields.map(f => ({
        name: f.name,
        type: f.type,
        title: f.title,
        description: f.description,
        example: f.example,
        group: f.group,
        required: f.required,
        occurrences: f.occurrences,
        entity: f.entity,
      })),
      groups: activeGroups,
      entities: activeEntities,
      optional_sections: analysis.optionalSections,
      notes: analysis.notes,
      schema: analysisToSchema({ ...analysis, fields: activeFields }),
      templateDocxBase64: analysis.templateDocxBase64 || undefined,
    };
  };

  // Handle final save
  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Zadejte název šablony');
      return;
    }
    // In a real app, this would save to backend/localStorage
    const output = getOutputJson();
    if (!output) return;

    // Save to localStorage for now
    const saved = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    const id = templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    saved.push({
      id,
      name: templateName,
      description: templateDescription,
      createdAt: new Date().toISOString(),
      ...output,
    });
    localStorage.setItem('custom_templates', JSON.stringify(saved));

    const templateFullId = `custom:${id}`;
    setSavedTemplateId(templateFullId);

    // If a set was selected during upload, add the template to it
    if (selectedSetId) {
      useDocumentSetStore.getState().addTemplateToSet(selectedSetId, templateFullId);
    }

    setStep('done');
    toast.success('Šablona uložena');
  };

  // Download template as JSON
  const downloadJson = () => {
    const output = getOutputJson();
    if (!output) return;
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Steps config
  const steps = [
    { key: 'upload', label: 'Nahrát', icon: Upload },
    { key: 'review', label: 'Kontrola', icon: Search },
    { key: 'done', label: 'Hotovo', icon: Sparkles },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8">
        {steps.map(({ key, label, icon: Icon }, i) => {
          const stepIndex = steps.findIndex(s => s.key === step);
          const thisIndex = i;
          const isComplete = thisIndex < stepIndex;
          const isCurrent = key === step;

          return (
            <div key={key} className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div className={`flex items-center gap-1.5 sm:gap-2 ${isCurrent || isComplete ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                  isComplete
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary/15 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground/50'
                }`}>
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs sm:text-sm font-medium">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 min-w-3 sm:min-w-4 ${isComplete ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nahrát dokument</h1>
                <p className="text-sm text-muted-foreground">Nahrajte dokument a my z něj vytvoříme šablonu</p>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            } ${analyzing ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
              {analyzing ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="text-base font-medium mb-1">Analyzuji dokument...</p>
                  <p className="text-sm text-muted-foreground">Detekce proměnných polí</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-base font-medium mb-1">
                    Přetáhněte soubor sem
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    nebo klikněte pro výběr souboru
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span className="tag-pill px-2.5 py-1 rounded-lg font-medium">.DOCX</span>
                    <span className="tag-pill px-2.5 py-1 rounded-lg font-medium">.TXT</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* How it works info */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Jak to funguje</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Upload, title: 'Nahrajte dokument', desc: 'DOCX nebo textový soubor s konkrétními údaji' },
                { icon: Search, title: 'Automatická analýza', desc: 'Detekce jmen, dat, IČO, adres, částek a dalších' },
                { icon: Sparkles, title: 'Šablona je hotová', desc: 'Zkontrolujte pole a uložte jako šablonu' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="ghost" asChild className="rounded-xl">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zpět
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Review */}
      {step === 'review' && analysis && (
        <div className="space-y-5">
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kontrola šablony</h1>
                <p className="text-sm text-muted-foreground">
                  {file?.name} &mdash; {activeFields.length} polí v {activeGroups.length} skupinách
                </p>
              </div>
            </div>
          </div>

          {/* Notes & warnings */}
          {analysis.notes.length > 0 && (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {analysis.notes.map((note, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{note}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Template name */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Název šablony</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label htmlFor="tpl-name" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Název <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tpl-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Např. Kupní smlouva"
                  className="h-10 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="tpl-desc" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Popis
                </Label>
                <Input
                  id="tpl-desc"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Krátký popis dokumentu"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Document set — add to set during upload */}
          <DocumentSetPicker
            onAdd={(setId, name) => {
              setSelectedSetId(setId);
              toast.success(`Dokument bude přidán do sady "${name}"`);
            }}
          />

          {/* Detected fields by group */}
          {activeGroups.length > 0 ? (
            <div className="space-y-3">
              {analysis.groups
                .filter(g => activeFields.some(f => f.group === g))
                .map(group => {
                  const groupFields = analysis.fields.filter(f => f.group === group);
                  const activeInGroup = groupFields.filter(f => !removedFields.has(f.name));
                  const isExpanded = expandedGroups.has(group);

                  return (
                    <div key={group} className="rounded-2xl border bg-card overflow-hidden">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="w-full px-5 py-3 border-b bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">{group}</span>
                        <div className="flex items-center gap-2">
                          <span className="tag-pill px-2 py-0.5 rounded text-[10px] font-medium">
                            {activeInGroup.length} polí
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="divide-y">
                          {groupFields.map(field => {
                            const isRemoved = removedFields.has(field.name);
                            const isEditing = editingField === field.name;

                            return (
                              <div
                                key={field.name}
                                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 transition-colors ${
                                  isRemoved ? 'opacity-40 bg-muted/20' : ''
                                }`}
                              >
                                <Checkbox
                                  checked={!isRemoved}
                                  onCheckedChange={() => toggleFieldRemoval(field.name)}
                                  className="shrink-0"
                                />

                                <div className="min-w-0 flex-1">
                                  {isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        defaultValue={field.title}
                                        autoFocus
                                        className="h-8 rounded-lg text-sm"
                                        onBlur={(e) => renameField(field.name, e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') renameField(field.name, e.currentTarget.value);
                                          if (e.key === 'Escape') setEditingField(null);
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{field.title}</p>
                                        <span className="tag-pill px-1.5 py-0.5 rounded text-[9px] font-medium uppercase">
                                          {field.type}
                                        </span>
                                        {field.occurrences > 1 && (
                                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-medium">
                                            {field.occurrences}×
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{`{{${field.name}}}`}</code>
                                        {' '}&larr; <span className="italic">&ldquo;{field.example}&rdquo;</span>
                                        {field.occurrences > 1 && (
                                          <span className="text-primary/70 ml-1">({field.occurrences} výskytů — vyplníte jednou)</span>
                                        )}
                                      </p>
                                    </>
                                  )}
                                </div>

                                {!isRemoved && !isEditing && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingField(field.name)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nebyly nalezeny žádné proměnné. Zkuste nahrát dokument s konkrétními údaji.
              </p>
            </div>
          )}

          {/* Optional sections */}
          {analysis.optionalSections.length > 0 && (
            <div className="rounded-2xl border bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-200/50 dark:border-amber-800/30">
                <span className="text-sm font-medium">Podmíněné sekce</span>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {analysis.optionalSections.map((section, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Template preview */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="w-full px-5 py-3 border-b bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {showTemplate ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">Náhled šablony</span>
              </div>
              {showTemplate ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showTemplate && (
              <div className="p-5 max-h-96 overflow-y-auto">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground">
                  {getFinalTemplate()}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('upload');
                setAnalysis(null);
                setFile(null);
              }}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Nahrát jiný
            </Button>

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={downloadJson}
                className="rounded-xl"
                disabled={activeFields.length === 0}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Stáhnout JSON
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl h-11 px-6"
                disabled={activeFields.length === 0 || !templateName.trim()}
              >
                Uložit šablonu
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Done */}
      {step === 'done' && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
            <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-green-100 dark:bg-green-900/30 items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Šablona vytvořena</h2>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>{templateName}</strong> s {activeFields.length} poli
              {activeFields.some(f => f.occurrences > 1) && (
                <span className="text-primary"> ({activeFields.reduce((s, f) => s + f.occurrences, 0)} výskytů)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Šablona byla uložena a je připravena k použití
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Shrnutí</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Název</span>
                <span className="font-medium">{templateName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Polí</span>
                <span className="font-medium">{activeFields.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Skupin</span>
                <span className="font-medium">{activeGroups.length}</span>
              </div>
              {analysis?.entities && analysis.entities.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entity</span>
                  <span className="font-medium">{analysis.entities.length}</span>
                </div>
              )}
              {analysis?.optionalSections && analysis.optionalSections.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Podmíněné sekce</span>
                  <span className="font-medium">{analysis.optionalSections.length}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">Skupiny polí:</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeGroups.map(g => (
                    <span key={g} className="tag-pill px-2.5 py-1 rounded-lg text-[11px] font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document set picker — show if not already assigned during review */}
          {savedTemplateId && !selectedSetId && (
            <DocumentSetPicker
              templateId={savedTemplateId}
              onAdd={(setId, name) => {
                setSelectedSetId(setId);
                toast.success(`Přidáno do sady "${name}"`);
              }}
            />
          )}
          {selectedSetId && (
            <div className="rounded-xl border bg-card/50 p-4 flex items-center gap-2 text-sm text-primary">
              <FolderOpen className="h-4 w-4" />
              <span>Součástí sady &bdquo;{useDocumentSetStore.getState().getById(selectedSetId)?.name}&ldquo;</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep('upload');
                setAnalysis(null);
                setFile(null);
                setTemplateName('');
                setTemplateDescription('');
                setSavedTemplateId(null);
                setSelectedSetId(null);
              }}
              className="rounded-xl w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Nahrát další dokument
            </Button>
            <Button asChild className="rounded-xl w-full sm:w-auto">
              <Link href="/">
                Zpět na hlavní stránku
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
