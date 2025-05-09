"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Users, Briefcase, ShoppingCart } from "lucide-react";

// Define use case types
export interface UseCase {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  templateIds: string[];
}

// Define use cases with their associated document templates
export const useCases: UseCase[] = [
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
  },
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
  }
];

interface UseCaseShortcutsProps {
  onSelectUseCase: (templateIds: string[]) => void;
  selectedTemplateIds?: string[];
}

export function UseCaseShortcuts({ onSelectUseCase, selectedTemplateIds = [] }: UseCaseShortcutsProps) {
  // Function to check if a use case is currently selected
  const isUseCaseSelected = (useCase: UseCase): boolean => {
    // Check if all template IDs from the use case are in the selected templates
    return useCase.templateIds.every(id => selectedTemplateIds.includes(id)) &&
           // Also check if the selected templates only contain the ones from this use case
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
            <Card
              key={useCase.id}
              className={`cursor-pointer hover:shadow-md transition-shadow duration-300 ${
                isUseCaseSelected(useCase) ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => onSelectUseCase(useCase.templateIds)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {useCase.icon}
                  <CardTitle className="text-lg">{useCase.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{useCase.description}</CardDescription>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {useCase.templateIds.length} {
                      useCase.templateIds.length === 1 ? 'dokument' :
                      useCase.templateIds.length >= 2 && useCase.templateIds.length <= 4 ? 'dokumenty' : 'dokumentů'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
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
