"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, ArrowRight, FileText, Building2, Users, ShoppingCart, Scale, Stamp } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { getAllTemplates } from "@/lib/template-schemas";

const tagLabels: Record<string, string> = {
  business: "Podnikání",
  contract: "Smlouva",
  employment: "Zaměstnání",
  purchase: "Nákup",
  company: "Společnost",
  formation: "Založení",
  "power of attorney": "Plná moc",
  affidavit: "Prohlášení",
  articles: "Stanovy",
  "registered office": "Sídlo",
  capital: "Vklad",
};

const tagIcons: Record<string, React.ReactNode> = {
  business: <Building2 className="h-3 w-3" />,
  employment: <Users className="h-3 w-3" />,
  purchase: <ShoppingCart className="h-3 w-3" />,
  company: <Building2 className="h-3 w-3" />,
  contract: <Scale className="h-3 w-3" />,
  "power of attorney": <Stamp className="h-3 w-3" />,
};

export function TemplateCatalog() {
  const { isSignedIn: isAuthenticated } = useUser();
  const templates = getAllTemplates();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {templates.length > 0 ? (
        templates.map((template) => (
          <div
            key={template.id}
            className="group relative flex flex-col rounded-2xl border bg-card p-4 sm:p-5 hover-lift gradient-border"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base leading-tight mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                >
                  {tagIcons[tag]}
                  {tagLabels[tag] || tag}
                </span>
              ))}
            </div>

            <div className="mt-auto">
              {isAuthenticated ? (
                <Button asChild className="w-full rounded-xl group/btn" size="sm">
                  <Link href={`/generate?template=${template.id}`}>
                    Použít šablonu
                    <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full rounded-xl" variant="secondary" size="sm">
                  <Link href={`/login?returnUrl=/generate?template=${template.id}`}>
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Přihlásit se
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Žádné šablony dokumentů nejsou k dispozici.</p>
        </div>
      )}
    </div>
  );
}
