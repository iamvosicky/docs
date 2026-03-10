export type FieldInputType = 'text' | 'number' | 'date' | 'ico' | 'rc' | 'currency' | 'textarea' | 'account';

export interface TemplateSchema {
  type: string;
  properties: Record<string, { type: string; title: string }>;
  required: string[];
}

// Detect input type from field key and title
export function getFieldInputType(key: string, title: string): FieldInputType {
  const k = key.toUpperCase();
  const t = title.toLowerCase();

  // Dates
  if (k.includes('DATUM') || k.includes('DATE') || k === 'DOBA_OD' || k === 'DOBA_DO'
    || k.includes('BIRTH_DATE') || k === 'TERMIN' || k === 'TERMIN_DOKONCENI') {
    return 'date';
  }

  // IČO (Company ID - 8 digits)
  if (k.includes('ICO') || k.includes('COMPANY_ID')) {
    return 'ico';
  }

  // Rodné číslo (Birth number)
  if (k.includes('_RC') || k.includes('BIRTH_NUMBER') || t.includes('rodné číslo')) {
    return 'rc';
  }

  // Currency / money
  if (k === 'CENA' || k === 'ODMENA' || k === 'SHARE_CAPITAL' || k === 'SHARE_VALUE'
    || k.includes('AMOUNT') || k.includes('CASTKA')
    || t.includes('cena') || t.includes('odměna') || t.includes('kapitál') || t.includes('hodnota akcie') || t.includes('částka')) {
    return 'currency';
  }

  // Count / number
  if (k.includes('COUNT') || k === 'HODIN' || k === 'SPLATNOST'
    || t.includes('počet') || t.includes('hodin')) {
    return 'number';
  }

  // Bank account
  if (k.includes('UCET') || k.includes('BANK_ACCOUNT') || t.includes('účtu') || t.includes('účet')) {
    return 'account';
  }

  // Long text fields / addresses
  if (k === 'PREDMET_DILA' || k === 'PREDMET_PRODEJE' || k === 'POPIS_PRACE'
    || k === 'PRACOVNI_CINNOST' || k === 'BUSINESS_ACTIVITIES' || k === 'SPECIFIKACE_DILA'
    || k.includes('ADDRESS') || (k.includes('ADRESA') && !k.includes('EMAIL'))
    || t.includes('předmět') || t.includes('popis') || t.includes('činnost') || t.includes('adresa')) {
    return 'textarea';
  }

  return 'text';
}

// Get placeholder text based on field type
export function getFieldPlaceholder(key: string, type: FieldInputType, title: string): string {
  switch (type) {
    case 'date': return 'dd.mm.rrrr';
    case 'ico': return '12345678';
    case 'rc': return '000000/0000';
    case 'currency': return '0';
    case 'number': return '0';
    case 'account': return '000000-0000000000/0000';
    default: return title;
  }
}

// Get validation hint
export function getFieldHint(type: FieldInputType): string | null {
  switch (type) {
    case 'ico': return '8 číslic';
    case 'rc': return 'Formát: 000000/0000';
    case 'currency': return 'Kč';
    case 'account': return 'Číslo účtu / kód banky';
    default: return null;
  }
}

// Validate field value
export function validateField(value: string, type: FieldInputType): string | null {
  if (!value) return null; // empty is handled by required check

  switch (type) {
    case 'ico': {
      const clean = value.replace(/\s/g, '');
      if (!/^\d{8}$/.test(clean)) return 'IČO musí mít 8 číslic';
      return null;
    }
    case 'rc': {
      const clean = value.replace(/[\s/]/g, '');
      if (!/^\d{9,10}$/.test(clean)) return 'Rodné číslo musí mít 9-10 číslic';
      return null;
    }
    case 'currency': {
      const clean = value.replace(/[\s,.Kč]/g, '');
      if (!/^\d+$/.test(clean)) return 'Zadejte platnou částku';
      return null;
    }
    case 'number': {
      if (!/^\d+$/.test(value.trim())) return 'Zadejte číslo';
      return null;
    }
    case 'date': {
      // Accept dd.mm.yyyy or yyyy-mm-dd (from date input)
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value)) return null;
      return 'Formát: dd.mm.rrrr';
    }
    default:
      return null;
  }
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'contract' | 'company' | 'employment' | 'purchase';
  tags: string[];
  schema: TemplateSchema;
}

const templateMap: Record<string, Template> = {
  "smlouva-o-dilo": {
    id: "smlouva-o-dilo",
    name: "Smlouva o dílo",
    description: "B2B Smlouva o dílo (vzor)",
    category: "contract",
    tags: ["business", "contract"],
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
    category: "employment",
    tags: ["employment", "contract"],
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
    category: "purchase",
    tags: ["purchase", "contract"],
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
  "poa-zalozeni-statutar": {
    id: "poa-zalozeni-statutar",
    name: "Plná moc - založení statutár",
    description: "Plná moc pro založení společnosti a statutárního orgánu",
    category: "company",
    tags: ["company", "formation", "power of attorney"],
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
    category: "company",
    tags: ["company", "formation", "affidavit"],
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
    category: "company",
    tags: ["company", "formation", "articles"],
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
    category: "company",
    tags: ["company", "formation", "affidavit"],
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
    category: "company",
    tags: ["company", "formation", "power of attorney"],
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
    category: "company",
    tags: ["company", "formation", "power of attorney"],
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
    category: "company",
    tags: ["company", "formation", "power of attorney"],
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
    category: "company",
    tags: ["company", "formation", "registered office"],
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
    category: "company",
    tags: ["company", "formation", "registered office"],
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
    category: "company",
    tags: ["company", "formation", "capital"],
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

// ─── Custom templates (localStorage) ───

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  template_text: string;
  fields: { name: string; type: string; title: string; description: string; example: string; group: string; required: boolean; occurrences?: number; entity?: string }[];
  groups: string[];
  entities?: { id: string; label: string; role: string; fields: string[] }[];
  optional_sections: string[];
  notes: string[];
  schema: TemplateSchema;
  /** Base64-encoded DOCX with {{placeholders}} — preserves original formatting */
  templateDocxBase64?: string;
}

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('custom_templates') || '[]');
  } catch {
    return [];
  }
}

export function deleteCustomTemplate(id: string): void {
  const saved = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem('custom_templates', JSON.stringify(saved));
}

/** Convert a custom template to the standard Template interface */
function customToTemplate(ct: CustomTemplate): Template {
  return {
    id: `custom:${ct.id}`,
    name: ct.name,
    description: ct.description || 'Vlastní šablona',
    category: 'contract',
    tags: ['custom'],
    schema: ct.schema,
  };
}

/** Get the stored DOCX base64 for a custom template (for document generation) */
export function getCustomTemplateDocx(templateId: string): string | null {
  if (!templateId.startsWith('custom:')) return null;
  const customId = templateId.slice(7);
  const ct = getCustomTemplates().find(t => t.id === customId);
  return ct?.templateDocxBase64 || null;
}

/** Get the template text with {{placeholders}} for a custom template */
export function getCustomTemplateText(templateId: string): string | null {
  if (!templateId.startsWith('custom:')) return null;
  const customId = templateId.slice(7);
  const ct = getCustomTemplates().find(t => t.id === customId);
  return ct?.template_text || null;
}

// ─── Lookup functions ───

export function getTemplate(id: string): Template | null {
  // Check built-in templates first
  if (templateMap[id]) return templateMap[id];

  // Check custom templates (id format: "custom:my-template")
  if (id.startsWith('custom:')) {
    const customId = id.slice(7);
    const ct = getCustomTemplates().find(t => t.id === customId);
    if (ct) return customToTemplate(ct);
  }

  return null;
}

export function getTemplates(ids: string[]): Template[] {
  return ids.map(id => getTemplate(id)).filter((t): t is Template => t !== null);
}

export function getAllTemplates(): Template[] {
  return Object.values(templateMap);
}
