"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

// Mock data for templates - will be replaced with API data
const templates = [
  // Basic contracts
  {
    id: "smlouva-o-dilo",
    name: "Smlouva o dílo",
    description: "B2B Smlouva o dílo (vzor)",
    tags: ["business", "contract"]
  },
  {
    id: "dohoda-o-provedeni-prace",
    name: "Dohoda o provedení práce",
    description: "DPP (zaměstnanec ≤300 hod/rok)",
    tags: ["employment", "contract"]
  },
  {
    id: "kupni-smlouva",
    name: "Kupní smlouva",
    description: "Standardní kupní smlouva na movitou věc",
    tags: ["purchase", "contract"]
  },

  // Company formation documents
  {
    id: "poa-zalozeni-statutar",
    name: "Plná moc - založení statutár",
    description: "Plná moc pro založení společnosti a statutárního orgánu",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "affidavit-sr",
    name: "Affidavit SR",
    description: "Čestné prohlášení pro Slovenský obchodní rejstřík",
    tags: ["company", "formation", "affidavit"]
  },
  {
    id: "stanovy",
    name: "Stanovy společnosti",
    description: "Stanovy akciové společnosti",
    tags: ["company", "formation", "articles"]
  },
  {
    id: "affidavit-statutar",
    name: "Affidavit statutár",
    description: "Čestné prohlášení statutárního orgánu",
    tags: ["company", "formation", "affidavit"]
  },
  {
    id: "poa-rt",
    name: "Plná moc RT",
    description: "Plná moc pro rejstříkový soud",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "poa-shareholder",
    name: "Plná moc akcionář",
    description: "Plná moc pro akcionáře",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "poa-statutar",
    name: "Plná moc statutár",
    description: "Plná moc pro statutární orgán",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "rozhodnuti-umisteni-sidla",
    name: "Rozhodnutí o umístění sídla",
    description: "Rozhodnutí o umístění sídla společnosti",
    tags: ["company", "formation", "registered office"]
  },
  {
    id: "souhlas-umisteni-sidla",
    name: "Souhlas s umístěním sídla",
    description: "Souhlas s umístěním sídla společnosti",
    tags: ["company", "formation", "registered office"]
  },
  {
    id: "prohlaseni-spravce-vkladu",
    name: "Prohlášení správce vkladu",
    description: "Prohlášení správce vkladu při založení společnosti",
    tags: ["company", "formation", "capital"]
  }
];

export function TemplateCatalog() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {templates.length > 0 ? (
        templates.map((template) => (
          <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-muted hover:border-muted-foreground/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="text-sm">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-2">
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              {isAuthenticated ? (
                <Button asChild className="w-full">
                  <Link href={`/generate?template=${template.id}`}>
                    Použít dokument
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href={`/login?returnUrl=/generate?template=${template.id}`}>
                    <Lock className="h-4 w-4 mr-2" />
                    Přihlásit se pro použití
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Žádné šablony dokumentů nejsou k dispozici.</p>
        </div>
      )}
    </div>
  );
}
