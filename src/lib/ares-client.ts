/**
 * ARES (Administrativní registr ekonomických subjektů) client.
 *
 * Primary source: Czech Ministry of Finance
 * API docs: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest
 * Base URL: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty
 *
 * This is free, public, no API key needed. Rate limit: ~5 req/s.
 */

import { validateIco } from './ico-validator';

// ─── Public types ────────────────────────────────────────────────────────────

export interface AresCompanyData {
  /** IČO (8 digits, zero-padded) */
  ico: string;
  /** DIČ (tax ID), if available */
  dic?: string;
  /** Official company name (obchodní firma) */
  name: string;
  /** Legal form label (e.g. "Společnost s ručením omezeným") */
  legalForm?: string;
  /** Legal form code */
  legalFormCode?: string;
  /** Full registered address as one string */
  address: string;
  /** Structured address fields */
  addressParts: {
    street?: string;
    houseNumber?: string;
    orientationNumber?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    country: string;
  };
  /** Date of establishment (ISO string) */
  dateEstablished?: string;
  /** Company status */
  status: 'active' | 'inactive' | 'liquidation' | 'bankruptcy' | 'unknown';
  /** Status label in Czech */
  statusLabel: string;
  /** Registration court and file number */
  registration?: {
    court?: string;
    fileNumber?: string;
    section?: string;
    insert?: string;
  };
  /** Statutory body members (executives) */
  executives: AresExecutive[];
  /** Shareholders / ownership (if available from ARES) */
  shareholders: AresShareholder[];
  /** Data source */
  source: 'ares';
  /** When data was fetched (ISO string) */
  fetchedAt: string;
}

export interface AresExecutive {
  name: string;
  role: string;
  dateFrom?: string;
}

export interface AresShareholder {
  name: string;
  /** Ownership share description */
  shareDescription?: string;
  /** Ownership percentage (if parseable) */
  percentage?: number;
  /** Capital contribution */
  capitalContribution?: number;
  /** Type of share */
  shareType?: string;
  /** Whether share is fully paid */
  paidUp?: boolean;
}

export interface AresLookupResult {
  success: boolean;
  data?: AresCompanyData;
  error?: string;
  /** HTTP status from ARES */
  statusCode?: number;
}

// ─── ARES API response types (partial, what we need) ─────────────────────────

interface AresResponse {
  ico: string;
  obchodniJmeno: string;
  dic?: string;
  pravniForma?: string;
  kodPravniFormy?: number;
  sidlo?: AresAddress;
  datumVzniku?: string;
  datumZaniku?: string;
  czNace?: string[];
  seznamRegistraci?: {
    stavZdrojeVr?: string;
    stavZdrojeRes?: string;
    stavZdrojeRzp?: string;
    stavZdrojeNrpzs?: string;
    stavZdrojeRpsh?: string;
    stavZdrojeSzr?: string;
    stavZdrojeDph?: string;
    stavZdrojeSd?: string;
    stavZdrojeIr?: string;
    stavZdrojeCeu?: string;
    stavZdrojeRs?: string;
    stavZdrojeRcns?: string;
  };
  financniUrad?: string;
}

interface AresAddress {
  kodStatu?: string;
  nazevStatu?: string;
  kodObce?: number;
  nazevObce?: string;
  kodMestskehoObvodu?: number;
  nazevMestskehoObvodu?: string;
  kodMestskeCastiObvodu?: number;
  nazevMestskeCasti?: string;
  kodUlice?: number;
  nazevUlice?: string;
  cisloDomovni?: number;
  typCislaDomovniho?: string;
  cisloOrientacni?: number;
  kodCastiObce?: number;
  nazevCastiObce?: string;
  psc?: number;
  textovaAdresa?: string;
}

interface AresVrResponse {
  zapisDatum?: string;
  vypisDatum?: string;
  spispiZnacka?: {
    oddil?: string;
    vlozka?: string;
  };
  nazevSoudu?: string;
  pravniForma?: number;
  statutarniOrgany?: AresStatutarniOrgan[];
  spolecnici?: AresSpolecnik[];
  zakladniKapital?: {
    vklad?: {
      hodnota?: number;
      mena?: string;
    };
  };
}

interface AresStatutarniOrgan {
  nazev?: string;
  clenove?: {
    fyzickaOsoba?: {
      jmeno?: string;
      prijmeni?: string;
      titulPred?: string;
      titulZa?: string;
    };
    pravnickaOsoba?: {
      obchodniJmeno?: string;
      ico?: string;
    };
    clenstvi?: {
      vznikClenstvi?: string;
      zanikClenstvi?: string;
    };
    funkce?: {
      nazev?: string;
    };
  }[];
}

interface AresSpolecnik {
  fyzickaOsoba?: {
    jmeno?: string;
    prijmeni?: string;
    titulPred?: string;
    titulZa?: string;
  };
  pravnickaOsoba?: {
    obchodniJmeno?: string;
    ico?: string;
  };
  podil?: {
    vklad?: {
      hodnota?: number;
      mena?: string;
    };
    souhrn?: {
      hodnota?: number;
      mena?: string;
    };
    text?: string;
    splacpieno?: boolean;
  };
  textPodilu?: string;
}

// ─── Legal form codes → labels ───────────────────────────────────────────────

const LEGAL_FORMS: Record<number, string> = {
  101: 'Fyzická osoba podnikající',
  111: 'Veřejná obchodní společnost',
  112: 'Společnost s ručením omezeným',
  113: 'Společnost komanditní',
  121: 'Akciová společnost',
  141: 'Obecně prospěšná společnost',
  145: 'Společenství vlastníků jednotek',
  205: 'Družstvo',
  301: 'Státní podnik',
  312: 'Příspěvková organizace',
  331: 'Příspěvková organizace',
  421: 'Zahraniční osoba',
  422: 'Organizační složka zahraničního subjektu',
  706: 'Spolek',
  707: 'Odborová organizace',
  711: 'Politická strana',
  721: 'Církev a náboženská společnost',
  801: 'Obec',
  804: 'Kraj',
  906: 'Zahraniční spolek',
};

// ─── Status parsing ──────────────────────────────────────────────────────────

function parseStatus(ares: AresResponse): { status: AresCompanyData['status']; label: string } {
  if (ares.datumZaniku) {
    return { status: 'inactive', label: 'Zaniklý subjekt' };
  }
  // Check VR status
  const vr = ares.seznamRegistraci?.stavZdrojeVr;
  if (vr === 'AKTIVNI') return { status: 'active', label: 'Aktivní' };
  if (vr === 'NEAKTIVNI') return { status: 'inactive', label: 'Neaktivní' };

  // Default to active if no end date
  return { status: 'active', label: 'Aktivní' };
}

// ─── Address normalization ───────────────────────────────────────────────────

function normalizeAddress(addr?: AresAddress): {
  formatted: string;
  parts: AresCompanyData['addressParts'];
} {
  if (!addr) {
    return {
      formatted: '',
      parts: { country: 'Česká republika' },
    };
  }

  const parts: AresCompanyData['addressParts'] = {
    street: addr.nazevUlice || undefined,
    houseNumber: addr.cisloDomovni ? String(addr.cisloDomovni) : undefined,
    orientationNumber: addr.cisloOrientacni ? String(addr.cisloOrientacni) : undefined,
    city: addr.nazevObce || undefined,
    district: addr.nazevMestskeCasti || addr.nazevMestskehoObvodu || undefined,
    postalCode: addr.psc ? String(addr.psc).padStart(5, '0').replace(/(\d{3})(\d{2})/, '$1 $2') : undefined,
    country: addr.nazevStatu || 'Česká republika',
  };

  // Build formatted address
  if (addr.textovaAdresa) {
    return { formatted: addr.textovaAdresa, parts };
  }

  const segments: string[] = [];

  // Street + number
  if (parts.street) {
    let streetLine = parts.street;
    if (parts.houseNumber && parts.orientationNumber) {
      streetLine += ` ${parts.houseNumber}/${parts.orientationNumber}`;
    } else if (parts.houseNumber) {
      streetLine += ` ${parts.houseNumber}`;
    }
    segments.push(streetLine);
  } else if (parts.houseNumber) {
    const prefix = addr.nazevCastiObce || parts.city || '';
    segments.push(`${prefix} č.p. ${parts.houseNumber}`);
  }

  // District
  if (parts.district && parts.district !== parts.city) {
    segments.push(parts.district);
  }

  // PSČ + City
  if (parts.postalCode && parts.city) {
    segments.push(`${parts.postalCode} ${parts.city}`);
  } else if (parts.city) {
    segments.push(parts.city);
  }

  return { formatted: segments.join(', '), parts };
}

// ─── Public API ──────────────────────────────────────────────────────────────

const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty';

/**
 * Fetch company data from ARES by IČO.
 *
 * Makes two calls:
 *  1) Basic subject data (always)
 *  2) VR (Veřejný rejstřík) detail for executives + shareholders (if available)
 */
export async function lookupByIco(ico: string): Promise<AresLookupResult> {
  // Validate first
  const validation = validateIco(ico);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const normalizedIco = validation.normalized;
  const fetchedAt = new Date().toISOString();

  try {
    // 1. Basic subject lookup
    const basicRes = await fetch(`${ARES_BASE}/${normalizedIco}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (basicRes.status === 404) {
      return { success: false, error: 'Subjekt s tímto IČO nebyl nalezen', statusCode: 404 };
    }

    if (!basicRes.ok) {
      return {
        success: false,
        error: `ARES vrátil chybu (${basicRes.status})`,
        statusCode: basicRes.status,
      };
    }

    const ares: AresResponse = await basicRes.json();

    // Parse basics
    const { status, label: statusLabel } = parseStatus(ares);
    const { formatted: address, parts: addressParts } = normalizeAddress(ares.sidlo);
    const legalFormCode = ares.kodPravniFormy || (ares.pravniForma ? Number(ares.pravniForma) : undefined);
    const legalFormLabel = legalFormCode ? (LEGAL_FORMS[legalFormCode] || String(legalFormCode)) : undefined;

    const result: AresCompanyData = {
      ico: normalizedIco,
      dic: ares.dic || undefined,
      name: ares.obchodniJmeno,
      legalForm: legalFormLabel || undefined,
      legalFormCode: legalFormCode ? String(legalFormCode) : undefined,
      address,
      addressParts,
      dateEstablished: ares.datumVzniku || undefined,
      status,
      statusLabel,
      executives: [],
      shareholders: [],
      source: 'ares',
      fetchedAt,
    };

    // 2. Try to get VR data (executives, shareholders, registration)
    try {
      const vrRes = await fetch(`${ARES_BASE}/${normalizedIco}/vypis-z-obchodniho-rejstriku`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8_000),
      });

      if (vrRes.ok) {
        const vr: AresVrResponse = await vrRes.json();

        // Registration info
        if (vr.spispiZnacka || vr.nazevSoudu) {
          result.registration = {
            court: vr.nazevSoudu,
            section: vr.spispiZnacka?.oddil,
            insert: vr.spispiZnacka?.vlozka,
            fileNumber: vr.spispiZnacka
              ? `${vr.spispiZnacka.oddil || ''} ${vr.spispiZnacka.vlozka || ''}`.trim()
              : undefined,
          };
        }

        // Executives
        if (vr.statutarniOrgany) {
          for (const organ of vr.statutarniOrgany) {
            if (organ.clenove) {
              for (const clen of organ.clenove) {
                let name = '';
                if (clen.fyzickaOsoba) {
                  const fo = clen.fyzickaOsoba;
                  const parts = [fo.titulPred, fo.jmeno, fo.prijmeni, fo.titulZa].filter(Boolean);
                  name = parts.join(' ');
                } else if (clen.pravnickaOsoba) {
                  name = clen.pravnickaOsoba.obchodniJmeno || '';
                }

                if (name) {
                  result.executives.push({
                    name,
                    role: clen.funkce?.nazev || organ.nazev || 'Člen',
                    dateFrom: clen.clenstvi?.vznikClenstvi,
                  });
                }
              }
            }
          }
        }

        // Shareholders
        if (vr.spolecnici) {
          for (const sp of vr.spolecnici) {
            let name = '';
            if (sp.fyzickaOsoba) {
              const fo = sp.fyzickaOsoba;
              name = [fo.titulPred, fo.jmeno, fo.prijmeni, fo.titulZa].filter(Boolean).join(' ');
            } else if (sp.pravnickaOsoba) {
              name = sp.pravnickaOsoba.obchodniJmeno || '';
            }

            if (name) {
              const shareholder: AresShareholder = { name };

              if (sp.podil) {
                if (sp.podil.vklad?.hodnota) {
                  shareholder.capitalContribution = sp.podil.vklad.hodnota;
                }
                if (sp.podil.text) {
                  shareholder.shareDescription = sp.podil.text;
                }
                shareholder.paidUp = sp.podil.splacpieno ?? undefined;
              }

              if (sp.textPodilu) {
                shareholder.shareDescription = sp.textPodilu;
                // Try to parse percentage from text
                const pctMatch = sp.textPodilu.match(/(\d+)\s*%/);
                if (pctMatch) {
                  shareholder.percentage = parseInt(pctMatch[1], 10);
                }
              }

              result.shareholders.push(shareholder);
            }
          }
        }
      }
    } catch {
      // VR data is optional — don't fail the whole lookup
    }

    return { success: true, data: result };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { success: false, error: 'Registr neodpovídá (timeout)' };
    }
    return {
      success: false,
      error: `Chyba při komunikaci s registrem: ${(err as Error).message}`,
    };
  }
}
