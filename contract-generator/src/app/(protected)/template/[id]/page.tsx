"use client";

import { DynamicForm } from "@/components/forms/dynamic-form";
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export const runtime = 'edge';

// This would be fetched from the API in a real implementation
const getTemplateData = (id: string) => {
  if (!id) return null;

  try {
    const templates = {
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
      }
    };

    // Check if the template exists
    if (templates[id as keyof typeof templates]) {
      return templates[id as keyof typeof templates];
    } else {
      console.warn(`Template with ID "${id}" not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting template data for ID "${id}":`, error);
    return null;
  }
};

interface PageParams {
  id: string;
}

// Make the page component a client component to handle params
export default function TemplatePage() {
  // Use the useParams hook to get the params
  const params = useParams();
  const templateId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const template = getTemplateData(templateId);
  const { user } = useAuth();

  if (!template) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Template Not Found</h1>
          <p className="text-lg text-muted-foreground">The requested template does not exist.</p>
          <div className="mt-8">
            <a href="/" className="text-primary hover:underline flex items-center">
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
              Back to templates
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline flex items-center mb-4">
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
            Back to templates
          </a>
          <h1 className="text-4xl font-bold mb-3">{template.name}</h1>
          <p className="text-lg text-muted-foreground">{template.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            You are logged in as <span className="font-medium">{user?.email || 'Unknown User'}</span>
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg border shadow-sm">
          <DynamicForm templateId={template.id} schema={template.schema} />
        </div>
      </div>
    </div>
  );
}
