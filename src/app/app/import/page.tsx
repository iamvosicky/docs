'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  Upload, FileText, Loader2, ArrowRight, ArrowLeft, Check,
  Sparkles, AlertCircle, Eye, EyeOff, Trash2, Edit3,
  ClipboardList, Search, Download, ChevronDown, ChevronRight,
  X, CheckCircle2, FileUp, FolderOpen, AlertTriangle, Link2, Users
} from 'lucide-react';
import {
  analyzeDocx, analyzeDocument,
  type AnalysisResult, type DetectedField, type DetectedShare,
  analysisToSchema
} from '@/lib/document-analyzer';
import { toast } from 'sonner';
import { DocumentSetPicker } from '@/components/document-set-picker';
import { useDocumentSetStore } from '@/lib/document-set-store';
import { ShareSelector, type ShareSelection } from '@/components/share-selector';
import { useEntityStore } from '@/lib/entity-store';
import { matchEntitiesToParties, type EntityMatch } from '@/lib/entity-matcher';
import { mapEntityToFields } from '@/types/saved-entity';

type Step = 'upload' | 'review' | 'done';

/** Confidence level thresholds */
function confidenceLevel(c: number): 'high' | 'medium' | 'low' {
  if (c >= 0.85) return 'high';
  if (c >= 0.6) return 'medium';
  return 'low';
}

function confidenceColor(c: number): string {
  const level = confidenceLevel(c);
  if (level === 'high') return 'text-green-600';
  if (level === 'medium') return 'text-amber-600';
  return 'text-red-500';
}

function confidenceBg(c: number): string {
  const level = confidenceLevel(c);
  if (level === 'high') return '';
  if (level === 'medium') return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30';
  return 'bg-red-50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30';
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [removedFields, setRemovedFields] = useState<Set<string>>(new Set());
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [shareSelection, setShareSelection] = useState<ShareSelection>({
    mode: 'all',
    selectedShareNumbers: [],
  });
  const [appliedEntities, setAppliedEntities] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { entities: savedEntities } = useEntityStore();

  // Entity matching
  const entityMatches = useMemo(() => {
    if (!analysis || savedEntities.length === 0) return new Map();
    return matchEntitiesToParties(analysis.parties, savedEntities);
  }, [analysis, savedEntities]);

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'txt') {
      toast.error('Podporovane formaty: DOCX, TXT');
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);
    setRemovedFields(new Set());
    setEditingField(null);
    setEditingValue(null);

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

      // Initialize share selection with all shares
      if (result.shares.length > 0) {
        setShareSelection({
          mode: 'all',
          selectedShareNumbers: result.shares.map(s => s.number),
        });
      }

      if (result.fields.length > 0) {
        setStep('review');
        toast.success(`Nalezeno ${result.fields.length} promennych poli`);
      } else {
        toast.warning('Nebyly nalezeny zadne promenne. Zkontrolujte dokument.');
        setStep('review');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Nepodarilo se analyzovat dokument');
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

  // Update field value (user correction)
  const updateFieldValue = (fieldName: string, newValue: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      fields: analysis.fields.map(f =>
        f.name === fieldName ? { ...f, example: newValue, confidence: 1.0 } : f
      ),
    });
    setEditingValue(null);
  };

  // Apply entity to a party group
  const applyEntityToParty = (partyRole: string, entityMatch: EntityMatch) => {
    if (!analysis) return;
    const party = analysis.parties.find(p => p.role === partyRole);
    if (!party) return;

    // Map entity fields to party fields
    const mapped = mapEntityToFields(
      entityMatch.entity,
      party.fieldNames,
      partyRole,
    );

    // Update field values with entity data
    setAnalysis({
      ...analysis,
      fields: analysis.fields.map(f => {
        if (mapped[f.name]) {
          return { ...f, example: mapped[f.name], confidence: 1.0 };
        }
        return f;
      }),
    });

    setAppliedEntities(prev => ({ ...prev, [partyRole]: entityMatch.entity.id }));
    toast.success(`Subjekt "${entityMatch.entity.label}" aplikovan`);
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
  const lowConfidenceCount = activeFields.filter(f => confidenceLevel(f.confidence) !== 'high').length;

  // Build final template text (re-inline removed fields)
  const getFinalTemplate = () => {
    if (!analysis) return '';
    let text = analysis.templateText;
    for (const field of analysis.fields) {
      if (removedFields.has(field.name)) {
        text = text.replace(`{{${field.name}}}`, field.originalText);
      }
    }
    return text;
  };

  // Generate JSON output
  const getOutputJson = () => {
    if (!analysis) return null;
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
        confidence: f.confidence,
        source: f.source,
      })),
      groups: activeGroups,
      entities: activeEntities,
      parties: analysis.parties,
      shares: analysis.shares,
      optional_sections: analysis.optionalSections,
      notes: analysis.notes,
      schema: analysisToSchema({ ...analysis, fields: activeFields }),
      templateDocxBase64: analysis.templateDocxBase64 || undefined,
      shareSelection: analysis.shares.length > 0 ? shareSelection : undefined,
    };
  };

  // Handle final save
  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Zadejte nazev sablony');
      return;
    }
    const output = getOutputJson();
    if (!output) return;

    const saved = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    let id = templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Ensure unique ID — append suffix if duplicate exists
    const existingIds = new Set(saved.map((t: any) => t.id));
    if (existingIds.has(id)) {
      let suffix = 2;
      while (existingIds.has(`${id}-${suffix}`)) suffix++;
      id = `${id}-${suffix}`;
    }

    // Check if DOCX base64 is too large for localStorage (>2MB)
    const docxBase64 = output.templateDocxBase64;
    const safeOutput = { ...output };
    if (docxBase64 && docxBase64.length > 2_000_000) {
      // Store DOCX separately to avoid quota issues
      try {
        localStorage.setItem(`docx_template_${id}`, docxBase64);
        safeOutput.templateDocxBase64 = `__ref:docx_template_${id}`;
      } catch {
        // If even separate storage fails, skip DOCX (text template still works)
        safeOutput.templateDocxBase64 = undefined;
        toast.warning('DOCX šablona je příliš velká pro lokální úložiště. Text šablona byla uložena.');
      }
    }

    saved.push({
      id,
      name: templateName,
      description: templateDescription,
      createdAt: new Date().toISOString(),
      ...safeOutput,
    });

    try {
      localStorage.setItem('custom_templates', JSON.stringify(saved));
    } catch {
      // Quota exceeded even without large DOCX — try without base64
      const minimalOutput = { ...safeOutput, templateDocxBase64: undefined };
      saved[saved.length - 1] = {
        id,
        name: templateName,
        description: templateDescription,
        createdAt: new Date().toISOString(),
        ...minimalOutput,
      };
      try {
        localStorage.setItem('custom_templates', JSON.stringify(saved));
        toast.warning('DOCX formátování nebylo uloženo (nedostatek místa). Šablona funguje s textovým obsahem.');
      } catch {
        toast.error('Nedostatek místa v úložišti. Smažte staré šablony.');
        return;
      }
    }

    const templateFullId = `custom:${id}`;
    setSavedTemplateId(templateFullId);

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
    { key: 'upload', label: 'Nahrat', icon: Upload },
    { key: 'review', label: 'Kontrola', icon: Search },
    { key: 'done', label: 'Hotovo', icon: Sparkles },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto">
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nahrat dokument</h1>
                <p className="text-sm text-muted-foreground">Nahrajte dokument a my z nej vytvorime sablonu</p>
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
                  <p className="text-sm text-muted-foreground">Detekce promennych poli, podilu a entit</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-base font-medium mb-1">
                    Pretahnete soubor sem
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    nebo kliknete pro vyber souboru
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span className="tag-pill px-2.5 py-1 rounded-lg font-medium">.DOCX</span>
                    <span className="tag-pill px-2.5 py-1 rounded-lg font-medium">.TXT</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Jak to funguje</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Upload, title: 'Nahrajte dokument', desc: 'DOCX nebo textovy soubor s konkretnimi udaji' },
                { icon: Search, title: 'Automaticka analyza', desc: 'Detekce jmen, dat, ICO, adres, podilu a castek' },
                { icon: Sparkles, title: 'Kontrola a uprava', desc: 'Zkontrolujte, upravte a ulozte sablonu' },
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
              <Link href="/app">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zpet
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kontrola sablony</h1>
                <p className="text-sm text-muted-foreground">
                  {file?.name} &mdash; {activeFields.length} poli v {activeGroups.length} skupinach
                  {analysis.shares.length > 0 && ` | ${analysis.shares.length} podilu`}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence warning */}
          {lowConfidenceCount > 0 && (
            <div className="rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {lowConfidenceCount} {lowConfidenceCount === 1 ? 'pole ma' : 'poli ma'} nizkou spolehlivost
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Pole zvyraznena oranzove/cervene vyzaduji rucni kontrolu. Kliknete na hodnotu pro upravu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Entity matching suggestions */}
          {entityMatches.size > 0 && (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nalezene shody se subjekty</span>
              </div>
              <div className="divide-y">
                {Array.from(entityMatches.entries()).map(([partyRole, matches]) => {
                  const bestMatch = matches[0];
                  const isApplied = appliedEntities[partyRole] === bestMatch.entity.id;
                  const party = analysis.parties.find(p => p.role === partyRole);

                  return (
                    <div key={partyRole} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{party?.label || partyRole}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {Math.round(bestMatch.confidence * 100)} % shoda
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bestMatch.entity.label} &mdash; {bestMatch.matchedFields.join(', ')}
                        </p>
                      </div>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Check className="h-3 w-3" /> Aplikovano
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs h-8"
                          onClick={() => applyEntityToParty(partyRole, bestMatch)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Aplikovat
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* Share selector */}
          {analysis.shares.length > 0 && (
            <ShareSelector
              shares={analysis.shares}
              value={shareSelection}
              onChange={setShareSelection}
            />
          )}

          {/* Template name */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Nazev sablony</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label htmlFor="tpl-name" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Nazev <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tpl-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Napr. Kupni smlouva"
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
                  placeholder="Kratky popis dokumentu"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Document set */}
          <DocumentSetPicker
            onAdd={(setId, name) => {
              setSelectedSetId(setId);
              toast.success(`Dokument bude pridan do sady "${name}"`);
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
                  const groupLowConf = activeInGroup.filter(f => confidenceLevel(f.confidence) !== 'high').length;

                  return (
                    <div key={group} className="rounded-2xl border bg-card overflow-hidden">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="w-full px-5 py-3 border-b bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">{group}</span>
                        <div className="flex items-center gap-2">
                          {groupLowConf > 0 && (
                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {groupLowConf} ke kontrole
                            </span>
                          )}
                          <span className="tag-pill px-2 py-0.5 rounded text-[10px] font-medium">
                            {activeInGroup.length} poli
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
                            const isEditingTitle = editingField === field.name;
                            const isEditingVal = editingValue === field.name;
                            const confLevel = confidenceLevel(field.confidence);

                            return (
                              <div
                                key={field.name}
                                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 transition-colors ${
                                  isRemoved ? 'opacity-40 bg-muted/20' : confidenceBg(field.confidence)
                                }`}
                              >
                                <Checkbox
                                  checked={!isRemoved}
                                  onCheckedChange={() => toggleFieldRemoval(field.name)}
                                  className="shrink-0"
                                />

                                <div className="min-w-0 flex-1">
                                  {isEditingTitle ? (
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
                                  ) : isEditingVal ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        defaultValue={field.example}
                                        autoFocus
                                        className="h-8 rounded-lg text-sm"
                                        onBlur={(e) => updateFieldValue(field.name, e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') updateFieldValue(field.name, e.currentTarget.value);
                                          if (e.key === 'Escape') setEditingValue(null);
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => setEditingValue(null)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
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
                                            {field.occurrences}x
                                          </span>
                                        )}
                                        {/* Confidence indicator */}
                                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                          confLevel === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                          confLevel === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        }`}>
                                          {Math.round(field.confidence * 100)} %
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{`{{${field.name}}}`}</code>
                                        {' '}&larr;{' '}
                                        <button
                                          className={`italic hover:underline cursor-pointer ${confidenceColor(field.confidence)}`}
                                          onClick={() => !isRemoved && setEditingValue(field.name)}
                                          title="Klikni pro upravu hodnoty"
                                        >
                                          &ldquo;{field.example}&rdquo;
                                        </button>
                                        {field.occurrences > 1 && (
                                          <span className="text-primary/70 ml-1">({field.occurrences} vyskytu)</span>
                                        )}
                                        {field.source?.lineNumber && (
                                          <span className="text-muted-foreground/50 ml-1">(r. {field.source.lineNumber})</span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {!isRemoved && !isEditingTitle && !isEditingVal && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingField(field.name)}
                                    title="Prejmenovat pole"
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
                Nebyly nalezeny zadne promenne. Zkuste nahrat dokument s konkretnimi udaji.
              </p>
            </div>
          )}

          {/* Optional sections */}
          {analysis.optionalSections.length > 0 && (
            <div className="rounded-2xl border bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-200/50 dark:border-amber-800/30">
                <span className="text-sm font-medium">Podminene sekce</span>
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
                <span className="text-sm font-medium">Nahled sablony</span>
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
              Nahrat jiny
            </Button>

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={downloadJson}
                className="rounded-xl"
                disabled={activeFields.length === 0}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Stahnout JSON
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl h-11 px-6"
                disabled={activeFields.length === 0 || !templateName.trim()}
              >
                Ulozit sablonu
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
            <h2 className="text-xl font-semibold mb-2">Sablona vytvorena</h2>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>{templateName}</strong> s {activeFields.length} poli
              {activeFields.some(f => f.occurrences > 1) && (
                <span className="text-primary"> ({activeFields.reduce((s, f) => s + f.occurrences, 0)} vyskytu)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Sablona byla ulozena a je pripravena k pouziti
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Shrnuti</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nazev</span>
                <span className="font-medium">{templateName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Poli</span>
                <span className="font-medium">{activeFields.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Skupin</span>
                <span className="font-medium">{activeGroups.length}</span>
              </div>
              {analysis?.parties && analysis.parties.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strany</span>
                  <span className="font-medium">{analysis.parties.length}</span>
                </div>
              )}
              {analysis?.shares && analysis.shares.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Podily</span>
                  <span className="font-medium">
                    {analysis.shares.length} ({analysis.shares.reduce((s, sh) => s + sh.percentage, 0)} %)
                  </span>
                </div>
              )}
              {analysis?.optionalSections && analysis.optionalSections.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Podminene sekce</span>
                  <span className="font-medium">{analysis.optionalSections.length}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">Skupiny poli:</p>
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

          {/* Use template button — always visible on Done step */}
          <Button asChild className="w-full rounded-xl h-12 text-base">
            <Link href={`/generate?template=${savedTemplateId || `custom:${templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}`}>
              <FileText className="h-5 w-5 mr-2" />
              Použít šablonu
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>

          {/* Document set picker — add to Sady */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Přidat do sady dokumentů</span>
            </div>
            <div className="p-5">
              {selectedSetId ? (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="h-4 w-4" />
                  <span>Součástí sady „{useDocumentSetStore.getState().getById(selectedSetId)?.name}"</span>
                </div>
              ) : (
                <DocumentSetPicker
                  templateId={savedTemplateId || `custom:${templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  onAdd={(setId, name) => {
                    setSelectedSetId(setId);
                    toast.success(`Přidáno do sady "${name}"`);
                  }}
                />
              )}
            </div>
          </div>

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
            <Button variant="ghost" asChild className="rounded-xl w-full sm:w-auto">
              <Link href="/app">
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
