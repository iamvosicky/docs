"use client";

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, Percent, Building2 } from 'lucide-react';
import type { DetectedShare } from '@/lib/document-analyzer';

export type ShareSelectionMode = 'all' | 'specific';

export interface ShareSelection {
  mode: ShareSelectionMode;
  selectedShareNumbers: number[];
  /** Which share is being transferred (number) */
  transferringShare?: number;
  /** Transfer percentage (if partial) */
  transferPercentage?: number;
  /** Transfer amount in CZK (if specified) */
  transferAmount?: number;
}

interface ShareSelectorProps {
  shares: DetectedShare[];
  value: ShareSelection;
  onChange: (selection: ShareSelection) => void;
}

export function ShareSelector({ shares, value, onChange }: ShareSelectorProps) {
  const [expanded, setExpanded] = useState(true);

  if (shares.length === 0) return null;

  const totalPercentage = shares.reduce((s, sh) => s + sh.percentage, 0);
  const selectedShares = value.mode === 'all'
    ? shares
    : shares.filter(s => value.selectedShareNumbers.includes(s.number));
  const selectedPercentage = selectedShares.reduce((s, sh) => s + sh.percentage, 0);

  const toggleShareSelection = (shareNumber: number) => {
    const current = new Set(value.selectedShareNumbers);
    if (current.has(shareNumber)) {
      current.delete(shareNumber);
    } else {
      current.add(shareNumber);
    }
    onChange({
      ...value,
      mode: 'specific',
      selectedShareNumbers: Array.from(current),
    });
  };

  const setMode = (mode: ShareSelectionMode) => {
    onChange({
      ...value,
      mode,
      selectedShareNumbers: mode === 'all' ? shares.map(s => s.number) : value.selectedShareNumbers,
    });
  };

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 border-b bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Podíly ve společnosti</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag-pill px-2 py-0.5 rounded text-[10px] font-medium">
            {shares.length} {shares.length === 1 ? 'podíl' : shares.length <= 4 ? 'podíly' : 'podílů'} ({totalPercentage} %)
          </span>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Selection mode */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('all')}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                value.mode === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground'
              }`}
            >
              Všechny podíly
              <span className="block text-[11px] font-normal mt-0.5">
                {totalPercentage} % ({shares.length} podilu)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('specific')}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                value.mode === 'specific'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground'
              }`}
            >
              Konkrétní podíly
              <span className="block text-[11px] font-normal mt-0.5">
                Vybrat manuálně
              </span>
            </button>
          </div>

          {/* Share list */}
          {value.mode === 'specific' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Vyberte podíly k převodu
              </Label>
              <div className="divide-y rounded-xl border overflow-hidden">
                {shares.map(share => {
                  const isSelected = value.selectedShareNumbers.includes(share.number);
                  return (
                    <label
                      key={share.number}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30 ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleShareSelection(share.number)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{share.label}</span>
                          <span className="tag-pill px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {share.shareType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {share.percentage} %
                          </span>
                          {share.capitalContribution > 0 && (
                            <span>
                              Vklad: {share.capitalContribution.toLocaleString('cs-CZ')} Kc
                            </span>
                          )}
                          {share.isPaidUp && (
                            <span className="text-green-600">Splacen</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected summary */}
          <div className="rounded-xl bg-muted/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vybráno k převodu:</span>
              <span className="font-medium">
                {selectedShares.length} {selectedShares.length === 1 ? 'podil' : selectedShares.length <= 4 ? 'podily' : 'podilu'}
                {' '}({selectedPercentage} %)
              </span>
            </div>
          </div>

          {/* Transfer details */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Podrobnosti převodu
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="transfer-pct" className="text-[11px] text-muted-foreground mb-1 block">
                  Převedený podíl (%)
                </Label>
                <div className="relative">
                  <Input
                    id="transfer-pct"
                    type="number"
                    min={0}
                    max={100}
                    value={value.transferPercentage ?? selectedPercentage}
                    onChange={e => onChange({ ...value, transferPercentage: parseFloat(e.target.value) || 0 })}
                    className="h-9 rounded-lg text-sm pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label htmlFor="transfer-amount" className="text-[11px] text-muted-foreground mb-1 block">
                  Částka převodu (Kč)
                </Label>
                <div className="relative">
                  <Input
                    id="transfer-amount"
                    type="text"
                    inputMode="numeric"
                    value={value.transferAmount ? value.transferAmount.toLocaleString('cs-CZ') : ''}
                    onChange={e => {
                      const digits = e.target.value.replace(/[^\d]/g, '');
                      onChange({ ...value, transferAmount: parseInt(digits) || 0 });
                    }}
                    placeholder="0"
                    className="h-9 rounded-lg text-sm pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Kč</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
