import type { SavedEntity } from '@/types/saved-entity';
import type { ContractParty } from './document-analyzer';

export interface EntityMatch {
  /** The saved entity that matches */
  entity: SavedEntity;
  /** Confidence score 0-1 */
  confidence: number;
  /** Which fields matched */
  matchedFields: string[];
  /** The party role this entity matches */
  partyRole: string;
}

/**
 * Compare extracted contract parties against saved entities.
 * Returns matches sorted by confidence (best first).
 */
export function matchEntitiesToParties(
  parties: ContractParty[],
  savedEntities: SavedEntity[],
): Map<string, EntityMatch[]> {
  const result = new Map<string, EntityMatch[]>();

  for (const party of parties) {
    const matches: EntityMatch[] = [];

    for (const entity of savedEntities) {
      const match = scoreEntityMatch(party, entity);
      if (match.confidence > 0.3) {
        matches.push({
          entity,
          confidence: match.confidence,
          matchedFields: match.matchedFields,
          partyRole: party.role,
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    if (matches.length > 0) {
      result.set(party.role, matches);
    }
  }

  return result;
}

function scoreEntityMatch(
  party: ContractParty,
  entity: SavedEntity,
): { confidence: number; matchedFields: string[] } {
  const matchedFields: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  const data = entity.data as unknown as Record<string, string | undefined>;

  // Company ID (IČO) — very strong match signal
  if (party.attributes.companyId && data.ico) {
    maxScore += 5;
    const partyIco = party.attributes.companyId.replace(/\s/g, '');
    const entityIco = data.ico.replace(/\s/g, '');
    if (partyIco === entityIco) {
      totalScore += 5;
      matchedFields.push('IČO');
    }
  }

  // Name matching
  const partyName = party.attributes.name || party.attributes.companyName || '';
  const entityName = data.name || '';
  if (partyName && entityName) {
    maxScore += 3;
    const similarity = nameSimilarity(partyName, entityName);
    if (similarity > 0.7) {
      totalScore += 3 * similarity;
      matchedFields.push('Název');
    }
  }

  // Address matching
  if (party.attributes.address && data.address) {
    maxScore += 2;
    const addrSim = nameSimilarity(
      normalizeAddress(party.attributes.address),
      normalizeAddress(data.address),
    );
    if (addrSim > 0.5) {
      totalScore += 2 * addrSim;
      matchedFields.push('Adresa');
    }
  }

  // Birth number (very strong for persons)
  if (party.attributes.birthNumber && data.birth_number) {
    maxScore += 5;
    const partyRc = party.attributes.birthNumber.replace(/[\s/]/g, '');
    const entityRc = (data.birth_number || '').replace(/[\s/]/g, '');
    if (partyRc === entityRc) {
      totalScore += 5;
      matchedFields.push('Rodné číslo');
    }
  }

  // Tax ID
  if (party.attributes.taxId && data.dic) {
    maxScore += 3;
    if (party.attributes.taxId.replace(/\s/g, '') === (data.dic || '').replace(/\s/g, '')) {
      totalScore += 3;
      matchedFields.push('DIČ');
    }
  }

  if (maxScore === 0) return { confidence: 0, matchedFields: [] };
  return { confidence: totalScore / maxScore, matchedFields };
}

function nameSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1;

  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  // Word-level Jaccard similarity
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/č\.?\s*p\.?\s*/g, '')
    .trim();
}
