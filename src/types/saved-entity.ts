export type EntityType = 'company' | 'person';

export interface CompanyData {
  name: string;
  ico: string;
  dic?: string;
  address: string;
  city?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
  bank_account?: string;
  representative?: string;
}

export interface PersonData {
  name: string;
  birth_date?: string;
  birth_number?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface SavedEntity {
  id: string;
  type: EntityType;
  label: string;
  isDefault: boolean;
  data: CompanyData | PersonData;
  createdAt: string;
  updatedAt: string;
}

// Field mapping: entity data key -> template field suffixes it can fill
export const ENTITY_FIELD_MAP: Record<string, string[]> = {
  name:           ['_JMENO', '_name', '_nazev', '_jmeno', '_NAZEV'],
  ico:            ['_ICO', '_ico', '_ic', '_IC'],
  dic:            ['_DIC', '_dic'],
  address:        ['_ADRESA', '_address', '_adresa', '_ADRESA'],
  city:           ['_MESTO', '_city', '_mesto'],
  zip:            ['_PSC', '_zip', '_psc'],
  country:        ['_STAT', '_country', '_stat'],
  email:          ['_EMAIL', '_email'],
  phone:          ['_TELEFON', '_phone', '_telefon', '_tel'],
  bank_account:   ['_UCET', '_bank_account', '_ucet', '_cislo_uctu'],
  representative: ['_ZASTUPCE', '_representative', '_zastupce'],
  birth_date:     ['_DATUM_NAROZENI', '_birth_date', '_datum_narozeni', '_dat_nar'],
  birth_number:   ['_RC', '_birth_number', '_rodne_cislo', '_rc'],
};

// Given an entity and a list of field keys in a group, return a mapping of fieldKey -> value
export function mapEntityToFields(
  entity: SavedEntity,
  fieldKeys: string[],
  groupPrefix: string
): Record<string, string> {
  const result: Record<string, string> = {};
  const data = entity.data as unknown as Record<string, string | undefined>;

  for (const fieldKey of fieldKeys) {
    // Strip the group prefix to get the suffix (e.g., "KUP_JMENO" -> "_JMENO", "buyer_name" -> "_name")
    const suffix = fieldKey.startsWith(groupPrefix + '_')
      ? fieldKey.slice(groupPrefix.length)
      : fieldKey.includes('_') ? fieldKey.slice(fieldKey.indexOf('_')) : '';

    if (!suffix) continue;

    // Find which entity data field matches this suffix
    for (const [dataKey, suffixes] of Object.entries(ENTITY_FIELD_MAP)) {
      if (suffixes.some(s => s.toLowerCase() === suffix.toLowerCase())) {
        const value = data[dataKey];
        if (value) {
          result[fieldKey] = value;
        }
        break;
      }
    }
  }

  return result;
}

// Default sample entities
export const sampleEntities: SavedEntity[] = [
  {
    id: 'sample-company-1',
    type: 'company',
    label: 'Moje Firma s.r.o.',
    isDefault: true,
    data: {
      name: 'Moje Firma s.r.o.',
      ico: '12345678',
      dic: 'CZ12345678',
      address: 'Václavské náměstí 1, 110 00 Praha 1',
      email: 'info@mojefirma.cz',
      phone: '+420 123 456 789',
      bank_account: '1234567890/0800',
      representative: 'Jan Novák',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
