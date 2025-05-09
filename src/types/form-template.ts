import { CompanyProfile } from './company-profile';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  documentTemplateIds: string[]; // IDs of document templates this form template applies to
  values: Record<string, string>; // Form field values
  companyProfiles: {
    buyer?: string; // ID of buyer company profile
    seller?: string; // ID of seller company profile
    employer?: string; // ID of employer company profile
    employee?: string; // ID of employee company profile
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sample form templates for development
export const sampleFormTemplates: FormTemplate[] = [
  {
    id: '1',
    name: 'Standardní kupní smlouva',
    description: 'Předvyplněná šablona pro standardní kupní smlouvu',
    documentTemplateIds: ['kupni-smlouva'],
    values: {
      'PREDMET_PRODEJE': 'Osobní automobil',
      'CENA': '250000',
      'DATUM_PREDANI': '2025-06-01'
    },
    companyProfiles: {
      buyer: '1', // ID of Moje Firma s.r.o.
      seller: '2' // ID of Dodavatel s.r.o.
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smlouva o dílo - webové stránky',
    description: 'Předvyplněná šablona pro smlouvu o dílo na tvorbu webových stránek',
    documentTemplateIds: ['smlouva-o-dilo'],
    values: {
      'PREDMET_DILA': 'Vytvoření webových stránek dle specifikace v příloze č. 1',
      'CENA': '50000',
      'DATUM_PREDANI': '2025-07-15'
    },
    companyProfiles: {
      buyer: '1', // ID of Moje Firma s.r.o.
      seller: '2' // ID of Dodavatel s.r.o.
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Dohoda o provedení práce - IT konzultant',
    description: 'Předvyplněná šablona pro DPP s IT konzultantem',
    documentTemplateIds: ['dohoda-o-provedeni-prace'],
    values: {
      'POPIS_PRACE': 'IT konzultace a poradenství v oblasti informačních technologií',
      'ODMENA': '350 Kč/hod',
      'DATUM_OD': '2025-06-01',
      'DATUM_DO': '2025-12-31'
    },
    companyProfiles: {
      employer: '3', // ID of Zaměstnavatel a.s.
      employee: '4' // ID of Jan Pracovitý
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
