import { DynamicForm } from "@/components/forms/dynamic-form";

// This would be fetched from the API in a real implementation
const getTemplateData = (id: string) => {
  const templates = {
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

  return templates[id as keyof typeof templates] || null;
};

interface PageParams {
  id: string;
}

// Generate static params for all known templates
export function generateStaticParams() {
  return [
    { id: 'smlouva-o-dilo' },
    { id: 'dohoda-o-provedeni-prace' },
    { id: 'kupni-smlouva' },
  ];
}

// Make the page component synchronous
export default function TemplatePage({ params }: { params: PageParams }) {
  // Access params directly since we're using generateStaticParams
  const template = getTemplateData(params.id);

  if (!template) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Template Not Found</h1>
        <p>The requested template does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
      <p className="text-muted-foreground mb-8">{template.description}</p>

      <DynamicForm templateId={template.id} schema={template.schema} />
    </div>
  );
}
