"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Users, Briefcase, ShoppingCart } from "lucide-react";

export interface UseCase {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  templateIds: string[];
}

export const useCases: UseCase[] = [
  {
    id: "company-formation",
    name: "Založení a.s.",
    description: "Kompletní sada dokumentů pro založení akciové společnosti",
    icon: <Building2 className="h-5 w-5" />,
    templateIds: [
      "poa-zalozeni-statutar",
      "affidavit-sr",
      "stanovy",
      "affidavit-statutar",
      "poa-rt",
      "poa-shareholder",
      "poa-statutar",
      "rozhodnuti-umisteni-sidla",
      "souhlas-umisteni-sidla",
      "prohlaseni-spravce-vkladu"
    ]
  },
  {
    id: "create-company",
    name: "Založení společnosti",
    description: "Dokumenty potřebné pro založení nové společnosti",
    icon: <Building2 className="h-5 w-5" />,
    templateIds: ["smlouva-o-dilo", "kupni-smlouva"]
  },
  {
    id: "employment",
    name: "Zaměstnání",
    description: "Dokumenty pro zaměstnávání pracovníků",
    icon: <Users className="h-5 w-5" />,
    templateIds: ["dohoda-o-provedeni-prace"]
  },
  {
    id: "business-contracts",
    name: "Obchodní smlouvy",
    description: "Základní obchodní smlouvy pro podnikání",
    icon: <Briefcase className="h-5 w-5" />,
    templateIds: ["smlouva-o-dilo"]
  },
  {
    id: "purchase",
    name: "Nákup a prodej",
    description: "Dokumenty pro nákup a prodej zboží",
    icon: <ShoppingCart className="h-5 w-5" />,
    templateIds: ["kupni-smlouva"]
  }
];

interface UseCaseShortcutsProps {
  onSelectUseCase: (templateIds: string[]) => void;
  selectedTemplateIds?: string[];
}

export function UseCaseShortcuts({ onSelectUseCase, selectedTemplateIds = [] }: UseCaseShortcutsProps) {
  const isUseCaseSelected = (useCase: UseCase): boolean => {
    return useCase.templateIds.every(id => selectedTemplateIds.includes(id)) &&
           useCase.templateIds.length === selectedTemplateIds.length;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Rychlé volby</h2>
      <p className="text-muted-foreground mb-6">
        Vyberte použití a automaticky se označí příslušné dokumenty
      </p>

      {useCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((useCase) => (
            <div
              key={useCase.id}
              className={`group cursor-pointer rounded-2xl border bg-card p-5 hover-lift gradient-border transition-all ${
                isUseCaseSelected(useCase) ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => onSelectUseCase(useCase.templateIds)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isUseCaseSelected(useCase)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                }`}>
                  {useCase.icon}
                </div>
                <h3 className="font-semibold text-base leading-tight">{useCase.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {useCase.description}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 mr-1.5 text-primary/50" />
                <span>
                  {useCase.templateIds.length}{" "}
                  {useCase.templateIds.length === 1
                    ? "dokument"
                    : useCase.templateIds.length >= 2 && useCase.templateIds.length <= 4
                    ? "dokumenty"
                    : "dokumentů"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Žádné rychlé volby nejsou k dispozici.</p>
        </div>
      )}
    </div>
  );
}
