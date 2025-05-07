export interface CompanyProfile {
  id: string;
  name: string;
  type: 'buyer' | 'seller' | 'employer' | 'employee';
  data: {
    name: string;
    address: string;
    ico: string;
    dic?: string;
    email?: string;
    phone?: string;
    bankAccount?: string;
    contactPerson?: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Map company profile types to form field prefixes
export const companyTypeToPrefix: Record<CompanyProfile['type'], string> = {
  buyer: 'KUP',
  seller: 'PROD',
  employer: 'ZAM',
  employee: 'PRAC'
};

// Map form field prefixes to company profile types
export const prefixToCompanyType: Record<string, CompanyProfile['type']> = {
  'KUP': 'buyer',
  'PROD': 'seller',
  'ZAM': 'employer',
  'PRAC': 'employee'
};

// Map company profile data fields to form fields
export const companyFieldMapping: Record<string, Record<string, string>> = {
  'buyer': {
    'name': 'KUP_JMENO',
    'address': 'KUP_ADRESA',
    'ico': 'KUP_ICO',
    'dic': 'KUP_DIC'
  },
  'seller': {
    'name': 'PROD_JMENO',
    'address': 'PROD_ADRESA',
    'ico': 'PROD_ICO',
    'dic': 'PROD_DIC'
  },
  'employer': {
    'name': 'ZAM_JMENO',
    'address': 'ZAM_ADRESA',
    'ico': 'ZAM_ICO',
    'dic': 'ZAM_DIC'
  },
  'employee': {
    'name': 'PRAC_JMENO',
    'address': 'PRAC_ADRESA',
    'ico': 'PRAC_RC'
  }
};

// Sample company profiles for development
export const sampleCompanyProfiles: CompanyProfile[] = [
  {
    id: '1',
    name: 'Moje Firma s.r.o.',
    type: 'buyer',
    data: {
      name: 'Moje Firma s.r.o.',
      address: 'Václavské náměstí 1, 110 00 Praha 1',
      ico: '12345678',
      dic: 'CZ12345678',
      email: 'info@mojefirma.cz',
      phone: '+420 123 456 789',
      bankAccount: '1234567890/0800',
      contactPerson: 'Jan Novák'
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Dodavatel s.r.o.',
    type: 'seller',
    data: {
      name: 'Dodavatel s.r.o.',
      address: 'Dlouhá 5, 110 00 Praha 1',
      ico: '87654321',
      dic: 'CZ87654321',
      email: 'info@dodavatel.cz',
      phone: '+420 987 654 321'
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Zaměstnavatel a.s.',
    type: 'employer',
    data: {
      name: 'Zaměstnavatel a.s.',
      address: 'Pražská 10, 301 00 Plzeň',
      ico: '24681357',
      dic: 'CZ24681357',
      email: 'hr@zamestnavatel.cz',
      phone: '+420 777 888 999'
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Jan Pracovitý',
    type: 'employee',
    data: {
      name: 'Jan Pracovitý',
      address: 'Lidická 20, 602 00 Brno',
      ico: '9001234567',
      email: 'jan@pracovity.cz',
      phone: '+420 777 123 456'
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
