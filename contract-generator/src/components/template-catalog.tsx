"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock, Search, FileText, Building2, Briefcase, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

// Mock data for templates - will be replaced with API data
const templates = [
  // Basic contracts
  {
    id: "smlouva-o-dilo",
    name: "Smlouva o dílo",
    description: "B2B Smlouva o dílo (vzor)",
    category: "smlouva",
    tags: ["business", "contract"]
  },
  {
    id: "dohoda-o-provedeni-prace",
    name: "Dohoda o provedení práce",
    description: "DPP (zaměstnanec ≤300 hod/rok)",
    category: "pracovni",
    tags: ["employment", "contract"]
  },
  {
    id: "kupni-smlouva",
    name: "Kupní smlouva",
    description: "Standardní kupní smlouva na movitou věc",
    category: "smlouva",
    tags: ["purchase", "contract"]
  },

  // Company formation documents
  {
    id: "poa-zalozeni-statutar",
    name: "Plná moc - založení statutár",
    description: "Plná moc pro založení společnosti a statutárního orgánu",
    category: "spolecnost",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "affidavit-sr",
    name: "Affidavit SR",
    description: "Čestné prohlášení pro Slovenský obchodní rejstřík",
    category: "spolecnost",
    tags: ["company", "formation", "affidavit"]
  },
  {
    id: "stanovy",
    name: "Stanovy společnosti",
    description: "Stanovy akciové společnosti",
    category: "spolecnost",
    tags: ["company", "formation", "articles"]
  },
  {
    id: "affidavit-statutar",
    name: "Affidavit statutár",
    description: "Čestné prohlášení statutárního orgánu",
    category: "spolecnost",
    tags: ["company", "formation", "affidavit"]
  },
  {
    id: "poa-rt",
    name: "Plná moc RT",
    description: "Plná moc pro rejstříkový soud",
    category: "spolecnost",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "poa-shareholder",
    name: "Plná moc akcionář",
    description: "Plná moc pro akcionáře",
    category: "spolecnost",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "poa-statutar",
    name: "Plná moc statutár",
    description: "Plná moc pro statutární orgán",
    category: "spolecnost",
    tags: ["company", "formation", "power of attorney"]
  },
  {
    id: "rozhodnuti-umisteni-sidla",
    name: "Rozhodnutí o umístění sídla",
    description: "Rozhodnutí o umístění sídla společnosti",
    category: "spolecnost",
    tags: ["company", "formation", "registered office"]
  },
  {
    id: "souhlas-umisteni-sidla",
    name: "Souhlas s umístěním sídla",
    description: "Souhlas s umístěním sídla společnosti",
    category: "spolecnost",
    tags: ["company", "formation", "registered office"]
  },
  {
    id: "prohlaseni-spravce-vkladu",
    name: "Prohlášení správce vkladu",
    description: "Prohlášení správce vkladu při založení společnosti",
    category: "spolecnost",
    tags: ["company", "formation", "capital"]
  }
];

const categories = [
  { id: "vse", label: "Vše" },
  { id: "smlouva", label: "Smlouvy" },
  { id: "pracovni", label: "Pracovní" },
  { id: "spolecnost", label: "Společnost" },
];

const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  smlouva: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  pracovni: {
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: <Briefcase className="h-3.5 w-3.5" />,
  },
  spolecnost: {
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
};

const categoryLabels: Record<string, string> = {
  smlouva: "Smlouva",
  pracovni: "Pracovní",
  spolecnost: "Společnost",
};

export function TemplateCatalog() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("vse");

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "vse" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat dokumenty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="text-sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} {filtered.length === 1 ? "dokument" : filtered.length >= 2 && filtered.length <= 4 ? "dokumenty" : "dokumentů"}
      </p>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((template) => {
            const catCfg = categoryConfig[template.category];
            return (
              <Card
                key={template.id}
                className="flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{template.name}</CardTitle>
                    {catCfg && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${catCfg.color}`}>
                        {catCfg.icon}
                        {categoryLabels[template.category]}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  {isAuthenticated ? (
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/generate?template=${template.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Použít dokument
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full" size="sm" variant="outline">
                      <Link href={`/login?returnUrl=/generate?template=${template.id}`}>
                        <Lock className="h-4 w-4 mr-2" />
                        Přihlásit se pro použití
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Žádné dokumenty neodpovídají vašemu vyhledávání.</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(""); setActiveCategory("vse"); }}>
              Zrušit filtry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
