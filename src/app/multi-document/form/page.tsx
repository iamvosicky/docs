"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MultiDocumentForm } from "@/components/forms/multi-document-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// This would be fetched from the API in a real implementation
const getTemplateData = (id: string) => {
  if (!id) return null;

  try {
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
      // Basic contracts
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
      },

      // Company formation documents
      "poa-zalozeni-statutar": {
        id: "poa-zalozeni-statutar",
        name: "Plná moc - založení statutár",
        description: "Plná moc pro založení společnosti a statutárního orgánu",
        schema: {
          type: "object",
          properties: {
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            COMPANY_ADDRESS: { type: "string", title: "Adresa společnosti" },
            REPRESENTATIVE_NAME: { type: "string", title: "Jméno zástupce" },
            REPRESENTATIVE_BIRTH_DATE: { type: "string", title: "Datum narození zástupce" },
            REPRESENTATIVE_ADDRESS: { type: "string", title: "Adresa zástupce" },
            ATTORNEY_NAME: { type: "string", title: "Jméno zmocněnce" },
            ATTORNEY_BIRTH_DATE: { type: "string", title: "Datum narození zmocněnce" },
            ATTORNEY_ADDRESS: { type: "string", title: "Adresa zmocněnce" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["COMPANY_NAME", "COMPANY_ID", "COMPANY_ADDRESS", "REPRESENTATIVE_NAME", "REPRESENTATIVE_BIRTH_DATE", "REPRESENTATIVE_ADDRESS", "ATTORNEY_NAME", "ATTORNEY_BIRTH_DATE", "ATTORNEY_ADDRESS", "PLACE", "DATE"]
        }
      },
      "affidavit-sr": {
        id: "affidavit-sr",
        name: "Affidavit SR",
        description: "Čestné prohlášení pro Slovenský obchodní rejstřík",
        schema: {
          type: "object",
          properties: {
            PERSON_NAME: { type: "string", title: "Jméno osoby" },
            PERSON_BIRTH_DATE: { type: "string", title: "Datum narození" },
            PERSON_ADDRESS: { type: "string", title: "Adresa" },
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["PERSON_NAME", "PERSON_BIRTH_DATE", "PERSON_ADDRESS", "COMPANY_NAME", "COMPANY_ID", "PLACE", "DATE"]
        }
      },
      "stanovy": {
        id: "stanovy",
        name: "Stanovy společnosti",
        description: "Stanovy akciové společnosti",
        schema: {
          type: "object",
          properties: {
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ADDRESS: { type: "string", title: "Adresa společnosti" },
            BUSINESS_ACTIVITIES: { type: "string", title: "Předmět podnikání" },
            SHARE_CAPITAL: { type: "string", title: "Základní kapitál" },
            SHARES_COUNT: { type: "string", title: "Počet akcií" },
            SHARE_VALUE: { type: "string", title: "Hodnota akcie" },
            BOARD_MEMBERS_COUNT: { type: "string", title: "Počet členů představenstva" },
            SUPERVISORY_BOARD_MEMBERS_COUNT: { type: "string", title: "Počet členů dozorčí rady" }
          },
          required: ["COMPANY_NAME", "COMPANY_ADDRESS", "BUSINESS_ACTIVITIES", "SHARE_CAPITAL", "SHARES_COUNT", "SHARE_VALUE", "BOARD_MEMBERS_COUNT", "SUPERVISORY_BOARD_MEMBERS_COUNT"]
        }
      },
      "affidavit-statutar": {
        id: "affidavit-statutar",
        name: "Affidavit statutár",
        description: "Čestné prohlášení statutárního orgánu",
        schema: {
          type: "object",
          properties: {
            PERSON_NAME: { type: "string", title: "Jméno osoby" },
            PERSON_BIRTH_DATE: { type: "string", title: "Datum narození" },
            PERSON_ADDRESS: { type: "string", title: "Adresa" },
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["PERSON_NAME", "PERSON_BIRTH_DATE", "PERSON_ADDRESS", "COMPANY_NAME", "COMPANY_ID", "PLACE", "DATE"]
        }
      },
      "poa-rt": {
        id: "poa-rt",
        name: "Plná moc RT",
        description: "Plná moc pro rejstříkový soud",
        schema: {
          type: "object",
          properties: {
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            COMPANY_ADDRESS: { type: "string", title: "Adresa společnosti" },
            REPRESENTATIVE_NAME: { type: "string", title: "Jméno zástupce" },
            REPRESENTATIVE_POSITION: { type: "string", title: "Pozice zástupce" },
            ATTORNEY_NAME: { type: "string", title: "Jméno zmocněnce" },
            ATTORNEY_BIRTH_DATE: { type: "string", title: "Datum narození zmocněnce" },
            ATTORNEY_ADDRESS: { type: "string", title: "Adresa zmocněnce" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["COMPANY_NAME", "COMPANY_ID", "COMPANY_ADDRESS", "REPRESENTATIVE_NAME", "REPRESENTATIVE_POSITION", "ATTORNEY_NAME", "ATTORNEY_BIRTH_DATE", "ATTORNEY_ADDRESS", "PLACE", "DATE"]
        }
      },
      "poa-shareholder": {
        id: "poa-shareholder",
        name: "Plná moc akcionář",
        description: "Plná moc pro akcionáře",
        schema: {
          type: "object",
          properties: {
            SHAREHOLDER_NAME: { type: "string", title: "Jméno akcionáře" },
            SHAREHOLDER_BIRTH_DATE: { type: "string", title: "Datum narození akcionáře" },
            SHAREHOLDER_ADDRESS: { type: "string", title: "Adresa akcionáře" },
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            ATTORNEY_NAME: { type: "string", title: "Jméno zmocněnce" },
            ATTORNEY_BIRTH_DATE: { type: "string", title: "Datum narození zmocněnce" },
            ATTORNEY_ADDRESS: { type: "string", title: "Adresa zmocněnce" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["SHAREHOLDER_NAME", "SHAREHOLDER_BIRTH_DATE", "SHAREHOLDER_ADDRESS", "COMPANY_NAME", "COMPANY_ID", "ATTORNEY_NAME", "ATTORNEY_BIRTH_DATE", "ATTORNEY_ADDRESS", "PLACE", "DATE"]
        }
      },
      "poa-statutar": {
        id: "poa-statutar",
        name: "Plná moc statutár",
        description: "Plná moc pro statutární orgán",
        schema: {
          type: "object",
          properties: {
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            COMPANY_ADDRESS: { type: "string", title: "Adresa společnosti" },
            REPRESENTATIVE_NAME: { type: "string", title: "Jméno zástupce" },
            REPRESENTATIVE_POSITION: { type: "string", title: "Pozice zástupce" },
            ATTORNEY_NAME: { type: "string", title: "Jméno zmocněnce" },
            ATTORNEY_BIRTH_DATE: { type: "string", title: "Datum narození zmocněnce" },
            ATTORNEY_ADDRESS: { type: "string", title: "Adresa zmocněnce" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["COMPANY_NAME", "COMPANY_ID", "COMPANY_ADDRESS", "REPRESENTATIVE_NAME", "REPRESENTATIVE_POSITION", "ATTORNEY_NAME", "ATTORNEY_BIRTH_DATE", "ATTORNEY_ADDRESS", "PLACE", "DATE"]
        }
      },
      "rozhodnuti-umisteni-sidla": {
        id: "rozhodnuti-umisteni-sidla",
        name: "Rozhodnutí o umístění sídla",
        description: "Rozhodnutí o umístění sídla společnosti",
        schema: {
          type: "object",
          properties: {
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            COMPANY_ADDRESS: { type: "string", title: "Adresa společnosti" },
            REPRESENTATIVE_NAME: { type: "string", title: "Jméno zástupce" },
            REPRESENTATIVE_POSITION: { type: "string", title: "Pozice zástupce" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["COMPANY_NAME", "COMPANY_ID", "COMPANY_ADDRESS", "REPRESENTATIVE_NAME", "REPRESENTATIVE_POSITION", "PLACE", "DATE"]
        }
      },
      "souhlas-umisteni-sidla": {
        id: "souhlas-umisteni-sidla",
        name: "Souhlas s umístěním sídla",
        description: "Souhlas s umístěním sídla společnosti",
        schema: {
          type: "object",
          properties: {
            OWNER_NAME: { type: "string", title: "Jméno vlastníka" },
            OWNER_BIRTH_DATE: { type: "string", title: "Datum narození vlastníka" },
            OWNER_ADDRESS: { type: "string", title: "Adresa vlastníka" },
            PROPERTY_ADDRESS: { type: "string", title: "Adresa nemovitosti" },
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            COMPANY_ID: { type: "string", title: "IČO společnosti" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["OWNER_NAME", "OWNER_BIRTH_DATE", "OWNER_ADDRESS", "PROPERTY_ADDRESS", "COMPANY_NAME", "COMPANY_ID", "PLACE", "DATE"]
        }
      },
      "prohlaseni-spravce-vkladu": {
        id: "prohlaseni-spravce-vkladu",
        name: "Prohlášení správce vkladu",
        description: "Prohlášení správce vkladu při založení společnosti",
        schema: {
          type: "object",
          properties: {
            ADMINISTRATOR_NAME: { type: "string", title: "Jméno správce vkladu" },
            ADMINISTRATOR_BIRTH_DATE: { type: "string", title: "Datum narození správce vkladu" },
            ADMINISTRATOR_ADDRESS: { type: "string", title: "Adresa správce vkladu" },
            COMPANY_NAME: { type: "string", title: "Název společnosti" },
            SHARE_CAPITAL: { type: "string", title: "Základní kapitál" },
            BANK_NAME: { type: "string", title: "Název banky" },
            BANK_ACCOUNT: { type: "string", title: "Číslo účtu" },
            PLACE: { type: "string", title: "Místo podpisu" },
            DATE: { type: "string", title: "Datum podpisu" }
          },
          required: ["ADMINISTRATOR_NAME", "ADMINISTRATOR_BIRTH_DATE", "ADMINISTRATOR_ADDRESS", "COMPANY_NAME", "SHARE_CAPITAL", "BANK_NAME", "BANK_ACCOUNT", "PLACE", "DATE"]
        }
      }
    };

    // Check if the template exists
    if (templates[id]) {
      return templates[id];
    } else {
      console.warn(`Template with ID "${id}" not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting template data for ID "${id}":`, error);
    return null;
  }
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

function FormContent() {
  const searchParams = useSearchParams();
  // Get template IDs from URL and ensure they're valid
  const rawTemplateIds = searchParams.get('templates') || '';
  const templateIds = rawTemplateIds ? rawTemplateIds.split(',').filter(Boolean) : [];

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('form');

  // Load templates on component mount or when template IDs change
  useEffect(() => {
    // Flag to prevent state updates after component unmount
    let isMounted = true;

    // Set initial loading state
    if (isMounted) {
      setLoading(true);
    }

    // If no template IDs, set empty templates and stop loading
    if (templateIds.length === 0) {
      if (isMounted) {
        setTemplates([]);
        setLoading(false);
      }
      return;
    }

    // Process templates synchronously to avoid race conditions
    try {
      // Get template data for each ID
      const templateData: Template[] = [];

      // Process each template ID
      for (const id of templateIds) {
        const template = getTemplateData(id);
        if (template) {
          templateData.push(template);
        }
      }

      // Update state if component is still mounted
      if (isMounted) {
        setTemplates(templateData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing templates:", error);

      // Update state if component is still mounted
      if (isMounted) {
        setTemplates([]);
        setLoading(false);
      }
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [templateIds.join(',')]);

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

export default function MultiDocumentFormPage() {
  return (
    <Suspense fallback={
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
    }>
      <FormContent />
    </Suspense>
  );
}
