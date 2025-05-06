"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MultiDocumentForm } from "@/components/forms/multi-document-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// This would be fetched from the API in a real implementation
const getTemplateData = (id: string) => {
  // Define templates with proper typing
  interface TemplateData {
    [key: string]: {
      id: string;
      name: string;
      description: string;
      schema: {
        type: string;
        properties: {
          [key: string]: { type: string; title: string };
        };
        required: string[];
      };
    };
  }

  const templates: TemplateData = {
    "smlouva-o-dilo": {
      id: "smlouva-o-dilo",
      name: "Smlouva o dílo",
      description: "B2B Smlouva o dílo (vzor)",
      schema: {
        type: "object",
        properties: {
          KUP_JMENO: { type: "string", title: "Jméno kupujícího" },
          KUP_ADRESA: { type: "string", title: "Adresa kupujícího" },
          KUP_ICO: { type: "string", title: "IČO kupujícího" },
          PROD_JMENO: { type: "string", title: "Jméno prodávajícího" },
          PROD_ADRESA: { type: "string", title: "Adresa prodávajícího" },
          PROD_ICO: { type: "string", title: "IČO prodávajícího" },
          PREDMET_DILA: { type: "string", title: "Předmět díla" },
          CENA: { type: "string", title: "Cena díla" },
          DATUM_PREDANI: { type: "string", title: "Datum předání" }
        },
        required: ["KUP_JMENO", "KUP_ADRESA", "KUP_ICO", "PROD_JMENO", "PROD_ADRESA", "PROD_ICO", "PREDMET_DILA", "CENA", "DATUM_PREDANI"]
      }
    },
    "dohoda-o-provedeni-prace": {
      id: "dohoda-o-provedeni-prace",
      name: "Dohoda o provedení práce",
      description: "DPP (zaměstnanec ≤300 hod/rok)",
      schema: {
        type: "object",
        properties: {
          ZAM_JMENO: { type: "string", title: "Jméno zaměstnavatele" },
          ZAM_ADRESA: { type: "string", title: "Adresa zaměstnavatele" },
          ZAM_ICO: { type: "string", title: "IČO zaměstnavatele" },
          PRAC_JMENO: { type: "string", title: "Jméno pracovníka" },
          PRAC_ADRESA: { type: "string", title: "Adresa pracovníka" },
          PRAC_RC: { type: "string", title: "Rodné číslo pracovníka" },
          POPIS_PRACE: { type: "string", title: "Popis práce" },
          ODMENA: { type: "string", title: "Odměna" },
          DATUM_OD: { type: "string", title: "Datum od" },
          DATUM_DO: { type: "string", title: "Datum do" }
        },
        required: ["ZAM_JMENO", "ZAM_ADRESA", "ZAM_ICO", "PRAC_JMENO", "PRAC_ADRESA", "PRAC_RC", "POPIS_PRACE", "ODMENA", "DATUM_OD", "DATUM_DO"]
      }
    },
    "kupni-smlouva": {
      id: "kupni-smlouva",
      name: "Kupní smlouva",
      description: "Standardní kupní smlouva na movitou věc",
      schema: {
        type: "object",
        properties: {
          KUP_JMENO: { type: "string", title: "Jméno kupujícího" },
          KUP_ADRESA: { type: "string", title: "Adresa kupujícího" },
          KUP_ICO: { type: "string", title: "IČO kupujícího" },
          PROD_JMENO: { type: "string", title: "Jméno prodávajícího" },
          PROD_ADRESA: { type: "string", title: "Adresa prodávajícího" },
          PROD_ICO: { type: "string", title: "IČO prodávajícího" },
          PREDMET_PRODEJE: { type: "string", title: "Předmět prodeje" },
          CENA: { type: "string", title: "Cena" },
          DATUM_PREDANI: { type: "string", title: "Datum předání" }
        },
        required: ["KUP_JMENO", "KUP_ADRESA", "KUP_ICO", "PROD_JMENO", "PROD_ADRESA", "PROD_ICO", "PREDMET_PRODEJE", "CENA", "DATUM_PREDANI"]
      }
    }
  };

  return templates[id] || null;
};

// Define template type for better type safety
interface Template {
  id: string;
  name: string;
  description: string;
  schema: {
    type: string;
    properties: Record<string, { type: string; title: string }>;
    required: string[];
  };
}

export default function MultiDocumentFormPage() {
  const searchParams = useSearchParams();
  const templateIds = searchParams.get('templates')?.split(',') || [];
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('form');

  useEffect(() => {
    // Simulate API call to fetch template data
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const templateData = templateIds
          .map(id => getTemplateData(id))
          .filter((template): template is Template => template !== null);

        setTemplates(templateData);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (templateIds.length > 0) {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [templateIds]);

  if (templateIds.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card p-8 rounded-lg border shadow-sm text-center">
            <h1 className="text-2xl font-bold mb-4">No Templates Selected</h1>
            <p className="text-muted-foreground mb-6">Please select at least one template to generate documents.</p>
            <a href="/multi-document" className="text-primary hover:underline">
              Go back to template selection
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="bg-card p-8 rounded-lg border shadow-sm">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-32 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/multi-document" className="text-primary hover:underline flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to template selection
          </a>
          <h1 className="text-4xl font-bold mb-3">Multi-Document Generator</h1>
          <p className="text-lg text-muted-foreground">
            Fill out a single form to generate multiple documents at once.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="templates">Selected Templates ({templates.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-6">
            <div className="bg-card p-8 rounded-lg border shadow-sm">
              <MultiDocumentForm templates={templates} />
            </div>
          </TabsContent>
          <TabsContent value="templates" className="mt-6">
            <div className="bg-card p-8 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Selected Templates</h2>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-md">
                    <h3 className="font-medium text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
