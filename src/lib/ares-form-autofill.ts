/**
 * Maps ARES company data to form field keys within a specific group prefix.
 *
 * Given a group prefix like "buyer", "seller", "prevodce", "KUP", "PROD" etc.,
 * and the list of field keys in that group, maps ARES data to matching fields.
 *
 * Returns a Record<fieldKey, value> ready to merge into form state.
 */

import type { AresCompanyData } from './ares-client';

/** Metadata for an auto-filled field */
export interface AutofilledFieldMeta {
  value: string;
  source: 'ares';
  fetchedAt: string;
  confidence: number;
}

/**
 * Maps ARES data to form field keys within a group.
 *
 * Strategy: for each field key in the group, check if the suffix after the
 * group prefix matches known ARES data fields. Uses multiple suffix patterns
 * to handle both Czech and English naming conventions.
 */
export function mapAresToFormFields(
  ares: AresCompanyData,
  fieldKeys: string[],
  groupPrefix: string,
): { values: Record<string, string>; meta: Record<string, AutofilledFieldMeta> } {
  const values: Record<string, string> = {};
  const meta: Record<string, AutofilledFieldMeta> = {};

  // Build suffix → ARES value mapping
  // Covers both Czech and English conventions, plus built-in template patterns
  const suffixMap: Record<string, string> = {
    // Company name (covers: _JMENO, _name, _nazev, _NAME)
    '_jmeno': ares.name,
    '_name': ares.name,
    '_nazev': ares.name,
    '_firma': ares.name,
    '_company_name': ares.name,
    '_obchodni_jmeno': ares.name,

    // IČO (covers: _ICO, _ico, _ID, _company_id)
    '_ico': ares.ico,
    '_ic': ares.ico,
    '_id': ares.ico,
    '_company_id': ares.ico,

    // DIČ
    '_dic': ares.dic || '',
    '_tax_id': ares.dic || '',

    // Address — full (covers: _ADRESA, _address, _ADDRESS)
    '_adresa': ares.address,
    '_address': ares.address,
    '_sidlo': ares.address,

    // Street
    '_ulice': ares.addressParts.street || '',
    '_street': ares.addressParts.street || '',

    // City
    '_mesto': ares.addressParts.city || '',
    '_city': ares.addressParts.city || '',
    '_obec': ares.addressParts.city || '',

    // PSČ
    '_psc': ares.addressParts.postalCode?.replace(/\s/g, '') || '',
    '_zip': ares.addressParts.postalCode?.replace(/\s/g, '') || '',
    '_postal_code': ares.addressParts.postalCode?.replace(/\s/g, '') || '',

    // Country
    '_stat': ares.addressParts.country || '',
    '_country': ares.addressParts.country || '',
    '_zeme': ares.addressParts.country || '',

    // Representative / executive
    '_zastupce': ares.executives[0]?.name || '',
    '_representative': ares.executives[0]?.name || '',
    '_jednatel': ares.executives[0]?.name || '',
  };

  for (const fieldKey of fieldKeys) {
    // Extract suffix: "buyer_name" → "_name", "KUP_JMENO" → "_JMENO"
    let suffix = '';
    if (fieldKey.startsWith(groupPrefix + '_')) {
      suffix = fieldKey.slice(groupPrefix.length);
    } else if (fieldKey.includes('_')) {
      suffix = fieldKey.slice(fieldKey.indexOf('_'));
    }

    if (!suffix) continue;

    const suffixLower = suffix.toLowerCase();

    // Check all known suffix patterns
    const matchedValue = suffixMap[suffixLower];
    if (matchedValue !== undefined && matchedValue !== '') {
      values[fieldKey] = matchedValue;
      meta[fieldKey] = {
        value: matchedValue,
        source: 'ares',
        fetchedAt: ares.fetchedAt,
        confidence: 0.95, // Registry data is high confidence
      };
    }
  }

  return { values, meta };
}

/**
 * Detect whether a form group likely represents a company entity
 * (vs. a person or generic section) by checking if it contains
 * IČO-type fields.
 */
export function groupHasCompanyFields(fieldKeys: string[]): boolean {
  return fieldKeys.some(key => {
    const upper = key.toUpperCase();
    return upper.includes('ICO')
      || upper.includes('COMPANY_ID')
      || upper === 'IC'
      || upper.endsWith('_IC')
      || upper.endsWith('_ID');
  });
}

/**
 * Find the IČO field key within a group's field keys.
 */
export function findIcoFieldKey(fieldKeys: string[]): string | undefined {
  return fieldKeys.find(key => {
    const upper = key.toUpperCase();
    return upper.includes('ICO')
      || upper.includes('COMPANY_ID')
      || upper === 'IC'
      || upper.endsWith('_IC');
  });
}
