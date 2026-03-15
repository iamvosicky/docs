import PizZip from "pizzip";

// ─── Types ───

export interface DetectedField {
  name: string;
  type: "text" | "date" | "number" | "currency" | "ico" | "rc" | "textarea" | "account";
  title: string;
  description: string;
  example: string;
  group: string;
  required: boolean;
  /** Original text in the document that this field replaces */
  originalText: string;
  /** How many times this value appears in the document */
  occurrences: number;
  /** Entity this field belongs to (e.g. "buyer", "seller") */
  entity?: string;
}

export interface EntityGroup {
  id: string;
  label: string;
  role: string;
  fields: string[]; // field names belonging to this entity
}

/** Structured contract party with all detected attributes grouped together */
export interface ContractParty {
  /** English role id (buyer, seller, tenant, landlord, etc.) */
  role: string;
  /** Czech label for the role */
  label: string;
  /** All detected attributes for this party, keyed by field type */
  attributes: {
    name?: string;
    address?: string;
    birthDate?: string;
    birthNumber?: string;
    companyName?: string;
    companyId?: string;
    taxId?: string;
    bankAccount?: string;
    email?: string;
    phone?: string;
    [key: string]: string | undefined;
  };
  /** Placeholder names belonging to this party */
  fieldNames: string[];
}

/** Detected contract type */
export type ContractType =
  | "purchase"    // kupní smlouva
  | "work"        // smlouva o dílo
  | "lease"       // nájemní smlouva
  | "employment"  // pracovní smlouva / DPP / DPČ
  | "power"       // plná moc
  | "loan"        // smlouva o půjčce / zápůjčce
  | "other";

export interface AnalysisResult {
  templateText: string;
  fields: DetectedField[];
  groups: string[];
  entities: EntityGroup[];
  /** Structured contract parties with grouped attributes (no duplicate roles) */
  parties: ContractParty[];
  /** Detected contract type */
  contractType: ContractType;
  optionalSections: string[];
  notes: string[];
  originalText: string;
  /** Base64-encoded DOCX with {{placeholders}} inserted (preserves original formatting) */
  templateDocxBase64?: string;
}

// ─── Czech-aware pattern detection ───

interface PatternRule {
  pattern: RegExp;
  namePrefix: string;
  type: DetectedField["type"];
  titlePrefix: string;
  group: string;
  description: string;
}

const PATTERNS: PatternRule[] = [
  {
    // IČO / IČ / IC / ICO — flexible spacing and separators, 8 digits
    pattern: /(?:IČ[O]?|ICO?|I\.?\s*Č\.?\s*O?\.?|identifikační\s+číslo)[:\s]*[\s:]*(\d[\d\s]{6,9}\d)\b/gi,
    namePrefix: "company_id",
    type: "ico",
    titlePrefix: "IČO",
    group: "Identifikace",
    description: "Identifikační číslo osoby",
  },
  {
    pattern: /(?:DIČ|D\.?\s*I\.?\s*Č\.?)[:\s]*[\s:]*(CZ\s?\d[\d\s]{7,11})\b/gi,
    namePrefix: "tax_id",
    type: "text",
    titlePrefix: "DIČ",
    group: "Identifikace",
    description: "Daňové identifikační číslo",
  },
  {
    // Rodné číslo — flexible formats: "r.č.", "RČ", "rodné číslo", etc.
    pattern: /(?:rodné\s*číslo|r[\.\s]*č[\.\s]*|RČ)[:\s]*[\s:]*(\d{6}\s*\/?\s*\d{3,4})\b/gi,
    namePrefix: "birth_number",
    type: "rc",
    titlePrefix: "Rodné číslo",
    group: "Smluvní strana",
    description: "Rodné číslo",
  },
  {
    pattern: /(?:č(?:íslo)?\.?\s*(?:účtu|ú\.))[:\s]*(\d{1,6}-?\d{2,10}\/\d{4})/gi,
    namePrefix: "bank_account",
    type: "account",
    titlePrefix: "Číslo účtu",
    group: "Platební údaje",
    description: "Číslo bankovního účtu",
  },
  {
    pattern: /(\d[\d\s.,]*)\s*(?:Kč|CZK|,-\s*Kč)/gi,
    namePrefix: "amount",
    type: "currency",
    titlePrefix: "Částka",
    group: "Finanční údaje",
    description: "Peněžní částka",
  },
];

// Standalone PSČ pattern (only used when PSČ is NOT part of a larger address)
const PSC_PATTERN = /(?:PSČ)[:\s]*(\d{3}\s?\d{2})\b/gi;

// Company name: match the legal suffix, then look back to find the actual company name start
const COMPANY_SUFFIX = /(?:s\.r\.o\.|a\.s\.|k\.s\.|v\.o\.s\.|z\.s\.|spol\.\s*s\s*r\.o\.|akciová společnost|společnost s ručením omezeným)/;

// Person name must match on a single line (use [^\S\n] instead of \s to avoid matching across newlines)
const PERSON_NAME_PATTERN = /(?:(?:pan[íu]?|panem|jméno|zastoupen[áý]?m?)[^\S\n]+)?([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+[^\S\n]+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+(?:[^\S\n]+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+)?)/g;

/**
 * Validate that a value looks like a real person name, not a location/address.
 *
 * Rejects:
 * - Known Czech city/town names and their grammatical forms
 * - Values preceded by address/location trigger words (v, ve, na, bytem, sídlem, etc.)
 * - Values containing address-like patterns (č.p., postal codes, numbers)
 * - Values that end in typical Czech location suffixes (-ově, -oře, -icích, etc.)
 */
function isLikelyPersonName(value: string, textBefore: string): boolean {
  const lower = value.toLowerCase();
  const words = value.split(/\s+/);

  // Must have at least 2 words
  if (words.length < 2) return false;

  // Reject if any word looks like a number, postal code, or address fragment
  if (/\d/.test(value)) return false;
  if (/č\.?\s*p\.?/i.test(value)) return false;

  // Reject known Czech cities/towns and their grammatical forms
  const locationPatterns = [
    // Common Czech location suffixes (locative/dative/genitive case endings)
    /(?:hoře|horách|horám)$/i,                  // Kutné Hoře
    /(?:brodě|brodů|brodu)$/i,                  // Havlíčkově Brodě
    /(?:varech|varů|vary)$/i,                   // Karlovy Vary
    /(?:lázních|lázně|lázni)$/i,                // Mariánské Lázně
    /(?:labem|labi|labe)$/i,                    // Ústí nad Labem
    /(?:moravě|morav[ěy])$/i,                   // Uherské Hradiště, etc.
  ];
  if (locationPatterns.some(p => p.test(lower))) return false;

  // Reject well-known Czech city names (all grammatical cases)
  const knownLocations = new Set([
    "praha", "praze", "prahy", "prahou", "prahu",
    "brno", "brně", "brna", "brnem", "brnu",
    "ostrava", "ostravě", "ostravy", "ostravou", "ostravu",
    "plzeň", "plzni", "plzně", "plzní",
    "olomouc", "olomouci", "olomouce",
    "liberec", "liberci", "liberce",
    "hradec", "hradci", "hradce",
    "pardubice", "pardubicích", "pardubic",
    "zlín", "zlíně", "zlínu", "zlína",
    "opava", "opavě", "opavy",
    "jihlava", "jihlavě", "jihlavy",
    "kladno", "kladně", "kladna",
    "teplice", "teplicích", "teplic",
    "karviná", "karviné", "karvinou",
    "prostějov", "prostějově", "prostějova",
    "přerov", "přerově", "přerova",
    "chomutov", "chomutově", "chomutova",
    "děčín", "děčíně", "děčína",
    "kutná", "kutné", "kutnou",  // Kutná Hora
  ]);
  // Check if any word in the value is a known location
  if (words.some(w => knownLocations.has(w.toLowerCase()))) return false;

  // Reject if preceded by address/location trigger words
  const before50 = textBefore.slice(-50).toLowerCase();
  if (/(?:\bv\s*$|\bve\s*$|\bna\s*$|\bu\s*$|\bblíž\s*$|\bobci\s*$|\bobce\s*$|\bměst[ěa]\s*$|\bměstu\s*$|\bkraj[ie]\s*$|\bokres[eu]?\s*$|\bkatastr[áa]ln)/.test(before50)) return false;

  // Reject if preceded by "bytem", "sídlem", "bydlištěm" (address context)
  if (/(?:bytem|sídlem|bydlištěm|adrese|adresa|místem)\s*$/.test(before50)) return false;

  // Reject values where a word ends in typical Czech location case suffixes
  // that are uncommon in surnames: -ově, -icích, -ách, -ech
  if (/(?:ově|icích|ách|ech)$/i.test(lower)) return false;

  return true;
}

/**
 * Check if a name is likely a grammatical case variant of an already-detected name.
 * Czech names decline: "Jan Novák" / "Jana Nováka" / "Janem Novákem"
 * We compare stems (first 3+ chars) to catch these.
 *
 * Also handles 3-word vs 2-word comparisons:
 * "Sepsáno Štěpánem Černohorským" contains "Štěpán Černohorský" as a declension variant.
 */
function isDeclensionVariant(newName: string, existingNames: string[]): boolean {
  const newWords = newName.split(/\s+/);
  if (newWords.length < 2) return false;

  for (const existing of existingNames) {
    const existWords = existing.split(/\s+/);
    if (existWords.length < 2) continue;

    // Try all 2-word subsequences of the new name against the existing name
    for (let offset = 0; offset <= newWords.length - 2; offset++) {
      const w1 = newWords[offset];
      const w2 = newWords[offset + 1];

      const firstStem = Math.min(w1.length, existWords[0].length, 4);
      const lastStem = Math.min(w2.length, existWords[existWords.length - 1].length, 4);

      if (firstStem >= 3 && lastStem >= 3 &&
          w1.slice(0, firstStem).toLowerCase() === existWords[0].slice(0, firstStem).toLowerCase() &&
          w2.slice(0, lastStem).toLowerCase() === existWords[existWords.length - 1].slice(0, lastStem).toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

// Czech legal trigger phrases for address detection
const ADDRESS_TRIGGER = "(?:se\\s+sídlem\\s+na\\s+adrese|se\\s+sídlem\\s+v|se\\s+sídlem|s\\s+bydlištěm|trvale\\s+bytem|s\\s+místem\\s+podnikání|bytem|bydliště|adresa)";

// Full-span address: capture everything after the trigger phrase up to end of address (including PSČ)
// Handles: street + number, č.p. forms, city + PSČ, district, country
// Important: [^\n] instead of \s to prevent matching across line breaks
const ADDRESS_PATTERN = new RegExp(
  `(?:${ADDRESS_TRIGGER})[:\\s]+` +
  // Capture the address itself:
  `(` +
    // Start: either "č.p." form or a street/city name
    `(?:č\\.\\s*p\\.\\s*\\d+|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]+(?:\\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]+)*)` +
    // Optional house/orientation number
    `(?:\\s+\\d+[\\w/]*)?` +
    // Continuation segments: comma-separated parts (city, district, etc.)
    `(?:,\\s*(?:č\\.\\s*p\\.\\s*\\d+|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž0-9][A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž \\d\\/-]*))*` +
    // Optional final PSČ + city
    `(?:,?\\s*\\d{3}\\s?\\d{2}(?:\\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]+(?:\\s+\\d+)?)?)` +
  `)`,
  "gi"
);

const EMAIL_PATTERN = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;

const PHONE_PATTERN = /(?:tel(?:efon)?\.?|mobil)[:\s]*(\+?\d[\d\s-]{7,14})/gi;

// Birth date: captures full date when preceded by birth-related keywords
// Flexible: handles "datum narození", "nar.", "narozen/á/ý", "dat. nar.", "dat.nar.", etc.
const BIRTH_DATE_PATTERN = /(?:datum\s*narození|dat[\.\s]*nar[\.\s]*|nar(?:ozen[áý]?)?[\.\s]*|date\s*of\s*birth)[:\s]*[\s:]*(\d{1,2}[\.\s]+\d{1,2}[\.\s]+\d{4})/gi;

// Generic date (standalone, not a birth date — filtered later)
const DATE_PATTERN = /\b(\d{1,2}\.\s?\d{1,2}\.\s?\d{4})\b/g;

// ─── DOCX helpers ───

/** Extract plain text from DOCX XML, preserving paragraph breaks */
export function extractTextFromDocx(arrayBuffer: ArrayBuffer): string {
  const zip = new PizZip(arrayBuffer);
  const doc = zip.file("word/document.xml");
  if (!doc) throw new Error("Soubor neobsahuje platný DOCX dokument.");

  const xml = doc.asText();
  let text = "";
  const body = xml.replace(/<\?xml[^?]*\?>/g, "");

  const paragraphs = body.split(/<\/w:p>/gi);
  for (const para of paragraphs) {
    const runs = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/gi) || [];
    const paraText = runs
      .map((r) => r.replace(/<w:t[^>]*>/gi, "").replace(/<\/w:t>/gi, ""))
      .join("");
    if (paraText.trim()) {
      text += paraText + "\n";
    }
  }

  return text.trim();
}

/**
 * Replace a text value directly inside DOCX XML, handling split runs.
 * Returns the modified XML string.
 */
function replaceInDocxXml(xml: string, original: string, replacement: string): string {
  const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Try direct replacement first (value not split across runs)
  const directResult = xml.replace(
    new RegExp(`(>)${escaped}(<)`, "g"),
    `$1${replacement}$2`
  );
  if (directResult !== xml) return directResult;

  // If value spans multiple <w:t> tags within a paragraph, we need to merge runs.
  const paraRegex = /(<w:p[\s>][\s\S]*?<\/w:p>)/gi;
  let result = xml;

  result = result.replace(paraRegex, (paraXml) => {
    const textParts: { fullMatch: string; text: string }[] = [];
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/gi;
    let m: RegExpExecArray | null;
    while ((m = tRegex.exec(paraXml)) !== null) {
      textParts.push({ fullMatch: m[0], text: m[1] });
    }

    const fullText = textParts.map((p) => p.text).join("");
    if (!fullText.includes(original)) return paraXml;

    let modified = paraXml;
    let pos = 0;
    for (let i = 0; i < textParts.length; i++) {
      const partStart = pos;
      const partEnd = pos + textParts[i].text.length;
      pos = partEnd;

      const matchStart = fullText.indexOf(original);
      if (matchStart === -1) continue;
      const matchEnd = matchStart + original.length;

      if (partEnd <= matchStart || partStart >= matchEnd) continue;

      const before = textParts[i].text.substring(0, Math.max(0, matchStart - partStart));
      const after = textParts[i].text.substring(Math.min(textParts[i].text.length, matchEnd - partStart));

      let newText: string;
      if (partStart <= matchStart && before !== undefined) {
        newText = before + replacement + after;
      } else {
        newText = before + after;
      }

      const newTag = textParts[i].fullMatch.replace(
        />([^<]*)</,
        `>${newText}<`
      );
      const finalTag = newTag.includes(" ")
        ? newTag.replace(/<w:t(?![^>]*xml:space)/, '<w:t xml:space="preserve"')
        : newTag;
      modified = modified.replace(textParts[i].fullMatch, finalTag);
    }

    return modified;
  });

  return result;
}

// ─── Role detection (English role names for field naming) ───

interface FieldContext {
  counters: Record<string, number>;
  replacedTexts: Set<string>;
}

/** Map of English role IDs used in field names.
 *
 *  IMPORTANT: Only contract party roles are included here.
 *  Roles like "representative", "shareholder", "administrator" are NOT auto-detected.
 *  They are only used if the document explicitly defines them via (dále jen „X").
 *  This prevents false entity creation (rule 8). */
const ROLE_MAP: { pattern: RegExp; role: string }[] = [
  { pattern: /(?:kupující|objednatel)/, role: "buyer" },
  { pattern: /(?:prodávající|zhotovitel|dodavatel|poskytovatel)/, role: "seller" },
  { pattern: /(?:nabyvatel)/, role: "nabyvatel" },
  { pattern: /(?:převodce)/, role: "prevodce" },
  { pattern: /(?:zaměstnavatel)/, role: "employer" },
  { pattern: /(?:zaměstnanec|pracovník)/, role: "employee" },
  { pattern: /(?:zmocnitel|zmocňovatel)/, role: "principal" },
  { pattern: /(?:zmocněnec)/, role: "attorney" },
  { pattern: /(?:nájemce)/, role: "tenant" },
  { pattern: /(?:pronajímatel)/, role: "landlord" },
  { pattern: /(?:věřitel)/, role: "creditor" },
  { pattern: /(?:dlužník)/, role: "debtor" },
  { pattern: /(?:právnická\s*osoba)/, role: "company" },
];

/**
 * Detect explicit role labels defined in the document itself.
 *
 * Czech legal documents often define party roles in parentheses, e.g.:
 *   Štěpán Černohorský (dále jen „Převodce")
 *   MONTE NEGRO HOLDING a.s. (dále jen „Nabyvatel")
 *   (dále jen „Společnost")
 *
 * These explicit labels take priority over generic ROLE_MAP detection.
 * Returns a Map from the lowercase Czech label to its first occurrence position.
 */
function detectExplicitRoles(text: string): Map<string, { label: string; pos: number }> {
  const roles = new Map<string, { label: string; pos: number }>();
  // Match patterns like: (dále jen „Převodce"), (dále jen „Nabyvatel"), ("Převodce")
  const regex = /\(\s*(?:dále\s+jen\s+)?[„"\u201E"]([\wáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+)["""\u201C]\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const label = m[1].trim();
    const lower = label.toLowerCase();
    if (!roles.has(lower)) {
      roles.set(lower, { label, pos: m.index });
    }
  }
  return roles;
}

/**
 * Build a position→role map from explicit role definitions.
 *
 * For each (dále jen „X") at position P, find the start of its paragraph/section
 * (the nearest preceding double-newline or start of text). Any entity detected
 * between that start and P should get role X.
 *
 * Returns sorted zones: [{ start, end, role }]
 */
interface RoleZone {
  start: number;
  end: number;
  role: string;
  label: string;
}

function buildRoleZones(text: string, explicitRoles: Map<string, { label: string; pos: number }>): RoleZone[] {
  const zones: RoleZone[] = [];

  for (const [, { label, pos }] of explicitRoles) {
    // Determine the role ID: check ROLE_MAP first, then use slug
    const lower = label.toLowerCase();
    let roleId: string | null = null;
    for (const { pattern, role } of ROLE_MAP) {
      if (new RegExp(pattern.source, "i").test(lower)) {
        roleId = role;
        break;
      }
    }
    if (!roleId) roleId = slugifyRole(label);

    // Find the start of the section (last double-newline or previous role zone end)
    const beforePos = text.lastIndexOf("\n\n", pos);
    const start = beforePos >= 0 ? beforePos + 2 : 0;

    zones.push({ start, end: pos, role: roleId, label });
  }

  // Sort by start position
  zones.sort((a, b) => a.start - b.start);
  return zones;
}

/**
 * Find the role for a given text position using the pre-built role zones.
 * Returns the role string if the position falls within a zone, or empty string.
 */
function findRoleByPosition(zones: RoleZone[], matchIndex: number): string {
  for (const zone of zones) {
    if (matchIndex >= zone.start && matchIndex < zone.end) {
      return zone.role;
    }
  }
  return "";
}

/**
 * Sections of the document that contain verification/notary content.
 * People detected in these sections are NOT contract parties.
 */
const VERIFICATION_SECTION_PATTERNS = [
  /prohlášení\s+o\s+pravosti\s+podpis/i,
  /ověření\s+podpis/i,
  /legalizac/i,
  /notářsk[ýáé]\s+zápis/i,
  /úředně\s+ověřen/i,
  /podpisová\s+strana/i,
  /potvrzení\s+o\s+doručení/i,
  /ověřovací\s+doložk/i,
];

/** Company legal suffix pattern for entity boundary detection */
const COMPANY_SUFFIX_DETECT = /(?:s\.r\.o\.|a\.s\.|k\.s\.|v\.o\.s\.|z\.s\.|spol\.\s*s\s*r\.o\.|akciová\s+společnost|společnost\s+s\s+ručením\s+omezeným)/gi;

/**
 * Check if a position in the text falls within a verification/notary section.
 * People detected in these sections are NOT contract parties.
 */
function isInVerificationSection(text: string, matchIndex: number): boolean {
  // Look backwards from the match position for a verification section header
  const textBefore = text.slice(Math.max(0, matchIndex - 500), matchIndex).toLowerCase();
  for (const pattern of VERIFICATION_SECTION_PATTERNS) {
    if (pattern.test(textBefore)) {
      // Check there's no new major section between the header and our position
      // (double newline typically separates sections)
      const lastMatch = textBefore.lastIndexOf(textBefore.match(pattern)?.[0]?.toLowerCase() || "");
      if (lastMatch >= 0) {
        const between = textBefore.slice(lastMatch);
        // If there's a new article/section header, we've left the verification section
        if (!/(?:článek|čl\.|bod\s+\d|strana\s+\d)/i.test(between)) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Detect the entity role from context text preceding the match.
 *  Finds the CLOSEST (most recent) role keyword to get accurate assignment.
 *
 *  KEY RULE 1: If the document defines explicit roles via (dále jen „X"), those
 *  take priority over generic ROLE_MAP detection.
 *
 *  KEY RULE 2: If a company legal suffix (a.s., s.r.o., etc.) appears AFTER the
 *  last role keyword, it means a new company entity was introduced. In that case,
 *  return "company" instead of the stale role keyword from further back. */
function detectRole(textBefore: string, explicitRoles?: Map<string, { label: string; pos: number }>): string {
  const lower = textBefore.toLowerCase();
  const context = lower.slice(-500);

  let bestRole = "";
  let bestPos = -1;

  // PRIORITY 1: Standard ROLE_MAP keywords
  for (const { pattern, role } of ROLE_MAP) {
    const regex = new RegExp(pattern.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = regex.exec(context)) !== null) {
      if (m.index > bestPos) {
        bestPos = m.index;
        bestRole = role;
      }
    }
  }

  // PRIORITY 2: Document-defined explicit roles (e.g. „Převodce", „Nabyvatel").
  // These override ROLE_MAP only for labels that don't already have a ROLE_MAP mapping.
  // E.g. „kupující" already maps to "buyer" via ROLE_MAP, so we keep "buyer".
  // But „Převodce" is not in ROLE_MAP, so it gets its own slug "prevodce".
  if (explicitRoles && explicitRoles.size > 0) {
    for (const [roleLower, { label }] of explicitRoles) {
      // Skip if this label already has a ROLE_MAP mapping (detected above)
      const hasRoleMapMatch = ROLE_MAP.some(({ pattern }) =>
        new RegExp(pattern.source, "i").test(roleLower)
      );
      if (hasRoleMapMatch) continue;

      const slug = slugifyRole(label);
      const escapedLabel = roleLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const roleRegex = new RegExp(escapedLabel, "gi");
      let m: RegExpExecArray | null;
      while ((m = roleRegex.exec(context)) !== null) {
        if (m.index > bestPos) {
          bestPos = m.index;
          bestRole = slug;
        }
      }
    }
  }

  // Check if a company legal suffix appears AFTER the best role keyword
  // AND on a DIFFERENT line/paragraph. This means a new company entity was
  // introduced after the role keyword, making the role keyword stale.
  // If the company suffix is on the SAME line as the role keyword (e.g.
  // "Prodávající: Firma ABC s.r.o."), the explicit role label should win.
  if (bestRole && bestRole !== "company") {
    const afterKeyword = context.slice(bestPos);
    const suffixRegex = new RegExp(COMPANY_SUFFIX_DETECT.source, "gi");
    let suffixMatch: RegExpExecArray | null;
    let lastSuffixPos = -1;
    while ((suffixMatch = suffixRegex.exec(afterKeyword)) !== null) {
      lastSuffixPos = suffixMatch.index;
    }
    if (lastSuffixPos > 0) {
      // Only override if the company suffix is on a DIFFERENT line than the role keyword
      const betweenKeywordAndSuffix = afterKeyword.slice(0, lastSuffixPos);
      const hasLineBreak = /\n/.test(betweenKeywordAndSuffix);
      if (hasLineBreak) {
        // Company suffix is on a different line — check if we're still in the
        // company's section (no double-newline gap to current position)
        const textAfterSuffix = afterKeyword.slice(lastSuffixPos);
        if (!/\n\s*\n/.test(textAfterSuffix)) {
          bestRole = "company";
        }
      }
    }
  }

  // If no explicit role found, check for company indicators (IČO, legal suffix)
  if (!bestRole) {
    const nearContext = lower.slice(-200);
    if (/(?:ič[o]?|ico|identifikační\s+číslo|s\.r\.o\.|a\.s\.|k\.s\.|v\.o\.s\.|spol\.\s*s\s*r\.o\.|akciová společnost)/.test(nearContext)) {
      bestRole = "company";
    }
  }

  return bestRole;
}

/** Czech label for entity/role used in UI groups */
function roleToLabel(role: string, explicitRoles?: Map<string, { label: string; pos: number }>): string {
  // If the document defines this role explicitly, use the document's label
  if (explicitRoles) {
    for (const [, { label }] of explicitRoles) {
      if (label.toLowerCase() === role || slugifyRole(label) === role) {
        return label;
      }
    }
  }

  const map: Record<string, string> = {
    buyer: "Kupující",
    seller: "Prodávající",
    nabyvatel: "Nabyvatel",
    prevodce: "Převodce",
    employer: "Zaměstnavatel",
    employee: "Zaměstnanec",
    principal: "Zmocnitel",
    attorney: "Zmocněnec",
    tenant: "Nájemce",
    landlord: "Pronajímatel",
    creditor: "Věřitel",
    debtor: "Dlužník",
    representative: "Zástupce",
    administrator: "Správce vkladu",
    shareholder: "Akcionář",
    company: "Společnost",
  };
  return map[role] || role;
}

/** Convert a Czech role label to an ASCII-safe slug for use in field names */
function slugifyRole(label: string): string {
  return label.trim().toLowerCase()
    .replace(/á/g, "a").replace(/č/g, "c").replace(/ď/g, "d")
    .replace(/é/g, "e").replace(/ě/g, "e").replace(/í/g, "i")
    .replace(/ň/g, "n").replace(/ó/g, "o").replace(/ř/g, "r")
    .replace(/š/g, "s").replace(/ť/g, "t").replace(/ú/g, "u")
    .replace(/ů/g, "u").replace(/ý/g, "y").replace(/ž/g, "z")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function makeFieldName(prefix: string, role: string, ctx: FieldContext): string {
  const base = role ? `${role}_${prefix}` : prefix;
  ctx.counters[base] = (ctx.counters[base] || 0) + 1;
  if (ctx.counters[base] === 1) return base;
  return `${base}_${ctx.counters[base]}`;
}

// ─── Full-span detection helpers ───

/**
 * Count how many times a value appears in the text.
 */
// ─── Contract type detection ───

/** Detect the type of contract from the document text */
function detectContractType(text: string): ContractType {
  const lower = text.toLowerCase();

  // Check patterns in order of specificity
  if (/kupní\s+smlouv|smlouv\w*\s+kupní|koupě|prodej/i.test(lower)) return "purchase";
  if (/nájemní\s+smlouv|smlouv\w*\s+o\s+nájmu|nájem\s|podnájem/i.test(lower)) return "lease";
  if (/smlouv\w*\s+o\s+díl[oue]|zhotov/i.test(lower)) return "work";
  if (/pracovní\s+smlouv|dohod\w*\s+o\s+proveden|dohod\w*\s+o\s+pracovní\s+činnost/i.test(lower)) return "employment";
  if (/plná\s+moc|zmocn[ěi]/i.test(lower)) return "power";
  if (/smlouv\w*\s+o\s+(?:půjč|zápůjč|úvěr)/i.test(lower)) return "loan";

  return "other";
}

/** Map contract type to expected role pairs to avoid duplicate role assignment */
const CONTRACT_ROLE_PAIRS: Record<ContractType, [string, string] | null> = {
  purchase:   ["buyer", "seller"],
  lease:      ["tenant", "landlord"],
  work:       ["buyer", "seller"],       // objednatel=buyer, zhotovitel=seller
  employment: ["employer", "employee"],
  power:      ["principal", "attorney"],
  loan:       ["creditor", "debtor"],
  other:      null,
};

// ─── Full-span detection helpers ───

function countOccurrences(text: string, value: string): number {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = text.match(new RegExp(escaped, "g"));
  return matches ? matches.length : 0;
}

/**
 * Check if a value is a fragment of an already-detected larger value.
 * Prevents creating partial fields (e.g. just "Praha" when full address exists).
 */
function isFragmentOf(value: string, existingValues: Set<string>): boolean {
  for (const existing of existingValues) {
    if (existing !== value && existing.includes(value)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a date value at a given position is a birth date
 * by looking at the preceding context.
 */
function isBirthDateContext(text: string, matchIndex: number): boolean {
  const before = text.slice(Math.max(0, matchIndex - 80), matchIndex).toLowerCase();
  return /(?:datum\s*narození|dat[\.\s]*nar[\.\s]*|nar(?:ozen[áý]?)?[\.\s]*|date\s*of\s*birth|rodné|born)\s*[:\s]*$/.test(before);
}

// ─── Analyzer core ───

/**
 * Collect all replacements from text.
 *
 * Rules from spec:
 * 1. Detect largest meaningful value spans (don't split dates, addresses, names)
 * 2. Birth dates = one field (never split into day/month/year)
 * 3. Addresses = one field if on one line
 * 4. Deduplicate identical values (same value = ONE field, fill once)
 * 5. Replace only exact text spans, never rewrite surrounding text
 * 6. Semantic role-based naming (buyer_name, seller_company_id, etc.)
 * 7. Fragment validation — never create a field for a partial value
 */
function detectReplacements(text: string): {
  replacements: { original: string; placeholder: string; field: DetectedField }[];
  entities: EntityGroup[];
  parties: ContractParty[];
  contractType: ContractType;
  /** Maps merged roles to their final role (e.g. "company" → "seller") */
  roleRemapping: Map<string, string>;
  notes: string[];
  optionalSections: string[];
} {
  const notes: string[] = [];
  const ctx: FieldContext = { counters: {}, replacedTexts: new Set() };
  const replacements: { original: string; placeholder: string; field: DetectedField }[] = [];

  // Detect explicit role labels defined in the document (e.g. „Převodce", „Nabyvatel")
  const explicitRoles = detectExplicitRoles(text);
  const roleZones = buildRoleZones(text, explicitRoles);
  if (explicitRoles.size > 0) {
    const labels = Array.from(explicitRoles.values()).map(r => r.label);
    notes.push(`Nalezeny role definované v dokumentu: ${labels.join(", ")}`);
  }

  /**
   * Resolve the role for a match at a given position.
   * Priority: 1) Position-based zone (explicit role label defines preceding section)
   *           2) Context-based detectRole (ROLE_MAP keywords in preceding text)
   */
  const resolveRole = (matchIndex: number, textBefore: string): string => {
    // First: check if this position falls within an explicit role zone
    const zoneRole = findRoleByPosition(roleZones, matchIndex);
    if (zoneRole) return zoneRole;
    // Fallback: standard context-based detection
    return detectRole(textBefore, explicitRoles);
  };

  // Track value→fieldName for deduplication (same value = same placeholder)
  const valueToField = new Map<string, string>();
  // Track entity groupings
  const entityFields = new Map<string, Set<string>>();
  // Track all detected values for fragment checking
  const allDetectedValues = new Set<string>();

  const addReplacement = (
    value: string,
    role: string,
    namePrefix: string,
    type: DetectedField["type"],
    titlePrefix: string,
    defaultGroup: string,
    description: string,
    required: boolean,
  ) => {
    // Deduplication: if we already have this exact value, just ensure count is right
    if (valueToField.has(value)) {
      return;
    }

    // Skip already-replaced values
    if (ctx.replacedTexts.has(value)) return;

    // Fragment validation: skip if this value is a substring of an already-detected larger value
    if (isFragmentOf(value, allDetectedValues)) return;

    ctx.replacedTexts.add(value);
    allDetectedValues.add(value);

    const name = makeFieldName(namePrefix, role, ctx);
    const group = roleToLabel(role, explicitRoles) || defaultGroup;
    const occurrences = countOccurrences(text, value);

    valueToField.set(value, name);

    // Track entity grouping
    if (role) {
      if (!entityFields.has(role)) entityFields.set(role, new Set());
      entityFields.get(role)!.add(name);
    }

    replacements.push({
      original: value,
      placeholder: `{{${name}}}`,
      field: {
        name,
        type,
        title: role ? `${titlePrefix} (${roleToLabel(role, explicitRoles)})` : titlePrefix,
        description,
        example: value.trim(),
        group,
        required,
        originalText: value,
        occurrences,
        entity: role || undefined,
      },
    });
  };

  // ──────────────────────────────────────────────────
  // PHASE 1: Detect larger spans FIRST (addresses, company names, birth dates)
  // This ensures fragment validation works: smaller patterns detected later
  // will be rejected if they overlap a larger already-detected span.
  // ──────────────────────────────────────────────────

  // 1a. Full-span addresses (highest priority — captures street, city, PSČ as one field)
  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(ADDRESS_PATTERN.source, ADDRESS_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim().replace(/,\s*$/, ""); // trim trailing comma
      if (value.length < 5) continue;
      // Skip addresses in verification/certification sections
      if (isInVerificationSection(text, match.index)) continue;
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "address", "textarea", "Adresa", "Adresa", "Úplná adresa", true);
    }
  }

  // 1b. Company names (full legal name including suffix)
  // Strategy: find legal suffixes (s.r.o., a.s., etc.), then look backwards on the same line
  // to find the company name start (first uppercase word that isn't a common Czech word)
  {
    const suffixRegex = new RegExp(COMPANY_SUFFIX.source, "gi");
    let match: RegExpExecArray | null;
    while ((match = suffixRegex.exec(text)) !== null) {
      // Skip companies in verification/certification sections
      if (isInVerificationSection(text, match.index)) continue;
      const suffixEnd = match.index + match[0].length;
      // Get text before the suffix on the same line
      const lineStart = text.lastIndexOf("\n", match.index) + 1;
      const before = text.slice(lineStart, match.index);

      // Walk backwards through words to find company name start
      // Stop at common Czech prepositions/articles/verbs
      const stopWords = new Set([
        "za", "pro", "od", "do", "na", "ke", "se", "ve", "po", "při",
        "nad", "pod", "před", "mezi", "mimo", "proti", "vůči", "včetně",
        "firmu", "firmy", "firma", "firmou", "společnost", "společnosti",
        "jedná", "jednající", "zastoupená", "zastoupený", "zastoupen",
        "je", "jsou", "byl", "byla", "bylo", "bude", "jako", "nebo",
        "a", "i", "s", "z", "k", "v", "u", "o", "dále", "jen",
      ]);

      const words = before.trimEnd().split(/\s+/);
      let nameStart = words.length;
      for (let i = words.length - 1; i >= 0; i--) {
        const w = words[i].replace(/[,;:()„"]/g, "");
        if (!w) break;
        if (stopWords.has(w.toLowerCase())) break;
        // Must start with uppercase or digit (part of company name)
        if (!/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9]/.test(w) && !/^[&.,'-]/.test(w)) break;
        nameStart = i;
      }

      const namePart = words.slice(nameStart).join(" ").replace(/^[,;:\s]+/, "").trim();
      const companyName = namePart + (namePart.endsWith(" ") || match[0].startsWith(" ") ? "" : " ") + match[0];
      if (companyName.length < 4) continue;

      const companyNameStart = lineStart + before.lastIndexOf(words[nameStart] || "");
      const textBefore = text.slice(0, companyNameStart);
      // First check if this company falls in an explicit role zone
      let role = findRoleByPosition(roleZones, companyNameStart);
      if (!role) {
        // Company names always get "company" role — they ARE the company entity.
        // detectRole might return a stale party keyword (e.g. "buyer") from further back,
        // but the entity itself is a company, so we prefer "company" unless an explicit
        // party keyword like "prodávající" is on the SAME line.
        role = detectRole(textBefore, explicitRoles);
        const sameLine = text.slice(lineStart, match.index).toLowerCase();
        const hasExplicitPartyOnLine = ROLE_MAP.some(({ pattern, role: r }) =>
          r !== "representative" && r !== "administrator" && r !== "shareholder" && r !== "company"
          && new RegExp(pattern.source, "i").test(sameLine)
        );
        if (!hasExplicitPartyOnLine) {
          role = "company";
        }
      }
      addReplacement(companyName, role, "company_name", "text", "Firma", "Společnost", "Název společnosti", true);
    }
  }

  // 1c. Birth dates (full date as one field, never split)
  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(BIRTH_DATE_PATTERN.source, BIRTH_DATE_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1];
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "birth_date", "date", "Datum narození", "Smluvní strana", "Datum narození", true);
    }
  }

  // 1d. Person names (full name as one field)
  // Track detected names to reject declension variants (e.g. "Janem Novákem" when "Jan Novák" exists)
  {
    const detectedNames: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(PERSON_NAME_PATTERN.source, PERSON_NAME_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim();
      if (value.length < 4) continue;

      // Skip names found in verification/notary sections
      if (isInVerificationSection(text, match.index)) continue;

      // Skip common Czech legal/document terms that look like names (capitalized words)
      const skipWords = [
        "Česká republika", "Český", "České", "Obchodní", "Občanského",
        "Zákoníku", "Zákoník", "Zákon", "Smlouva", "Článek", "Smluvní",
        "Předmět", "Tato", "Tento", "Následující", "Obecné", "Zvláštní",
        "Závěrečná", "Příloha", "Strana", "Trvale", "Dále", "Společnost",
        "Městský", "Okresní", "Krajský", "Nejvyšší", "Ústavní",
        // Legal party role words (all grammatical cases)
        "Nabyvatel", "Nabyvatele", "Nabyvatelem", "Nabyvateli",
        "Převodce", "Převodci", "Převodcem",
        "Kupující", "Kupujícího", "Kupujícímu", "Kupujícím",
        "Prodávající", "Prodávajícího", "Prodávajícímu", "Prodávajícím",
        "Objednatel", "Objednatele", "Objednatelem", "Objednateli",
        "Zhotovitel", "Zhotovitele", "Zhotovitelem", "Zhotoviteli",
        "Dodavatel", "Dodavatele", "Dodavatelem", "Dodavateli",
        "Nájemce", "Nájemci", "Nájemcem",
        "Pronajímatel", "Pronajímatele", "Pronajímatelem", "Pronajímateli",
        "Zaměstnavatel", "Zaměstnavatele", "Zaměstnavatelem",
        "Zaměstnanec", "Zaměstnance", "Zaměstnancem",
        "Zmocnitel", "Zmocnitele", "Zmocnitelem",
        "Zmocněnec", "Zmocněnce", "Zmocněncem",
        "Věřitel", "Věřitele", "Věřitelem",
        "Dlužník", "Dlužníka", "Dlužníkem",
        // Common document/financial words
        "Úplata", "Úplaty", "Úplatě", "Úplatu",
        "Platba", "Platby", "Platbě", "Platbu",
        "Celková", "Celkem", "Částka",
        "Sjednaná", "Dohodnutá", "Stanovená",
        "Záloha", "Splátka", "Faktura",
        // Document action words that appear as capitalized first words
        "Sepsáno", "Podepsáno", "Ověřeno", "Schváleno", "Vyhotoveno",
        "Uzavřeno", "Dohodnuto", "Potvrzeno", "Zpracováno",
        // Common location / registry words
        "Zapsáno", "Zapsán", "Zapsaná", "Zapsaný", "Zapsané",
        "Rejstříku", "Rejstříkem", "Rejstřík",
        "Vedený", "Vedeném", "Vedená", "Vedené",
        "Městského", "Městským", "Městském",
        "Obvodního", "Obvodním", "Obvodní",
      ];
      // Check if any word in the match is a skip word
      const words = value.split(/\s+/);
      if (skipWords.some((w) => words.some(word => word === w || value.includes(w)))) continue;

      // Reject if the same word appears twice (e.g. "Úplata Úplata")
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      if (uniqueWords.size < words.length) continue;

      // ── PERSON NAME VALIDATION ──
      // Reject values that look like locations, addresses, or non-name entities
      const textBefore = text.slice(0, match.index);
      if (!isLikelyPersonName(value, textBefore)) continue;

      // Reject declension variants of already-detected names
      // e.g. "Štěpánem Černohorským" when "Štěpán Černohorský" already detected
      if (isDeclensionVariant(value, detectedNames)) continue;

      // Reject 3-word matches if the first or last word duplicates part of an already-detected name
      if (words.length === 3) {
        const twoWordCombo1 = `${words[0]} ${words[1]}`;
        const twoWordCombo2 = `${words[1]} ${words[2]}`;
        const combo1Count = countOccurrences(text, twoWordCombo1);
        const combo2Count = countOccurrences(text, twoWordCombo2);
        const fullCount = countOccurrences(text, value);
        if (fullCount <= 1 && (combo1Count > fullCount || combo2Count > fullCount)) continue;
      }

      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "name", "text", "Jméno a příjmení", "Smluvní strana", "Celé jméno osoby", true);
      detectedNames.push(value);
    }
  }

  // ──────────────────────────────────────────────────
  // PHASE 2: Structured patterns (IČO, DIČ, RČ, bank account, amounts)
  // ──────────────────────────────────────────────────

  for (const rule of PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      // Skip values in verification/certification sections
      if (isInVerificationSection(text, match.index)) continue;
      const value = match[1] || match[0];
      const textBefore = text.slice(0, match.index);
      let role = resolveRole(match.index, textBefore);

      // Amounts preceded by contract-level keywords (kupní cena, cena, celková částka)
      // should not be assigned to a specific party — they belong to the contract itself
      if (rule.namePrefix === "amount") {
        const before80 = text.slice(Math.max(0, match.index - 100), match.index).toLowerCase();
        if (/(?:kupní\s+cen|cena\s+(?:činí|je|bude)|celkov[áé]\s+(?:cen|částk)|sjednan[áé]\s+cen|dohodnut[áé]\s+cen)/.test(before80)) {
          role = "";
        }
      }

      addReplacement(value, role, rule.namePrefix, rule.type, rule.titlePrefix, rule.group, rule.description, true);
    }
  }

  // ──────────────────────────────────────────────────
  // PHASE 3: Dates (generic — skip those already captured as birth dates)
  // ──────────────────────────────────────────────────

  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(DATE_PATTERN.source, DATE_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1];
      // Skip if this date is already captured (e.g. as birth_date)
      if (valueToField.has(value)) continue;
      if (isFragmentOf(value, allDetectedValues)) continue;

      // Check if it's a birth date context — if so, use birth_date naming
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      if (isBirthDateContext(text, match.index)) {
        addReplacement(value, role, "birth_date", "date", "Datum narození", "Smluvní strana", "Datum narození", true);
      } else {
        // Detect semantic context for the date
        const before60 = text.slice(Math.max(0, match.index - 80), match.index).toLowerCase();
        let datePrefix = "date";
        let dateTitle = "Datum";
        let dateDesc = "Datum";
        let dateGroup = "Termíny";

        if (/(?:smlouv|podpis|uzavřen|sepsán)/.test(before60)) {
          datePrefix = "contract_date";
          dateTitle = "Datum smlouvy";
          dateDesc = "Datum uzavření smlouvy";
        } else if (/(?:předání|dodání|splnění|termín)/.test(before60)) {
          datePrefix = "delivery_date";
          dateTitle = "Datum předání";
          dateDesc = "Termín dodání/předání";
        } else if (/(?:splatn|úhrad|zaplacen|platb)/.test(before60)) {
          datePrefix = "payment_date";
          dateTitle = "Datum splatnosti";
          dateDesc = "Datum splatnosti/úhrady";
        } else if (/(?:začát|nástupu|od\s*dne|účinnost)/.test(before60)) {
          datePrefix = "start_date";
          dateTitle = "Datum začátku";
          dateDesc = "Datum začátku/účinnosti";
        } else if (/(?:konc|ukončení|do\s*dne|skončení)/.test(before60)) {
          datePrefix = "end_date";
          dateTitle = "Datum konce";
          dateDesc = "Datum konce/ukončení";
        }

        addReplacement(value, role, datePrefix, "date", dateTitle, dateGroup, dateDesc, true);
      }
    }
  }

  // ──────────────────────────────────────────────────
  // PHASE 4: Standalone PSČ (only if NOT already part of a captured address)
  // ──────────────────────────────────────────────────

  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(PSC_PATTERN.source, PSC_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1];
      if (isFragmentOf(value, allDetectedValues)) continue;
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "postal_code", "text", "PSČ", "Adresa", "Poštovní směrovací číslo", true);
    }
  }

  // ──────────────────────────────────────────────────
  // PHASE 5: Contact info (emails, phones)
  // ──────────────────────────────────────────────────

  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(EMAIL_PATTERN.source, EMAIL_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1];
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "email", "text", "E-mail", "Kontakt", "E-mailová adresa", false);
    }
  }

  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(PHONE_PATTERN.source, PHONE_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim();
      const textBefore = text.slice(0, match.index);
      const role = resolveRole(match.index, textBefore);
      addReplacement(value, role, "phone", "text", "Telefon", "Kontakt", "Telefonní číslo", false);
    }
  }

  // Sort longest first to avoid partial replacement overlaps
  replacements.sort((a, b) => b.original.length - a.original.length);

  // ──────────────────────────────────────────────────
  // Contract type detection
  // ──────────────────────────────────────────────────
  const contractType = detectContractType(text);

  // ──────────────────────────────────────────────────
  // Build entity groups (legacy format, kept for backward compatibility)
  // ──────────────────────────────────────────────────
  const entities: EntityGroup[] = [];
  for (const [role, fieldNames] of entityFields.entries()) {
    entities.push({
      id: role,
      label: roleToLabel(role, explicitRoles),
      role,
      fields: [...fieldNames],
    });
  }

  // ──────────────────────────────────────────────────
  // Build structured contract parties (no duplicate roles)
  // ──────────────────────────────────────────────────
  const partyMap = new Map<string, ContractParty>();

  /** Map field name prefix → attribute key on ContractParty */
  const fieldToAttr: Record<string, string> = {
    name: "name",
    address: "address",
    birth_date: "birthDate",
    birth_number: "birthNumber",
    company_name: "companyName",
    company_id: "companyId",
    tax_id: "taxId",
    bank_account: "bankAccount",
    email: "email",
    phone: "phone",
  };

  for (const r of replacements) {
    const field = r.field;
    const role = field.entity || "";
    if (!role) continue;

    // Enforce single party per role: merge into existing party if role already seen
    if (!partyMap.has(role)) {
      partyMap.set(role, {
        role,
        label: roleToLabel(role, explicitRoles),
        attributes: {},
        fieldNames: [],
      });
    }

    const party = partyMap.get(role)!;
    party.fieldNames.push(field.name);

    // Determine attribute key from field name prefix (strip role prefix)
    const fieldSuffix = field.name.startsWith(role + "_")
      ? field.name.slice(role.length + 1).replace(/_\d+$/, "")
      : field.name.replace(/_\d+$/, "");

    const attrKey = fieldToAttr[fieldSuffix] || fieldSuffix;
    // Only set if not already set (first occurrence wins — no overwrite)
    if (!party.attributes[attrKey]) {
      party.attributes[attrKey] = field.example;
    }
  }

  // ── Merge auxiliary roles into main contract parties ──

  // Only "company" gets merged — representative, shareholder, administrator
  // stay as separate groups for clearer UI categorization.
  const MERGE_INTO_PARENT = new Set<string>(["company"]);

  const expectedPair = CONTRACT_ROLE_PAIRS[contractType];

  // Check if "Společnost" is an explicitly defined role in the document.
  // If so, it's a transaction object (e.g. the company being sold/transferred)
  // and should NOT be merged into buyer/seller.
  const isCompanyExplicitRole = explicitRoles.has("společnost") || explicitRoles.has("společnosti");

  // 1. Merge "company" into the appropriate main party (only if not explicitly defined)
  if (expectedPair && partyMap.has("company") && !isCompanyExplicitRole) {
    const companyParty = partyMap.get("company")!;
    const hasRole1 = partyMap.has(expectedPair[0]);
    const hasRole2 = partyMap.has(expectedPair[1]);

    if (hasRole1 || hasRole2) {
      // Merge into an existing main party
      const targetRole = !hasRole2 ? expectedPair[1] : expectedPair[0];
      if (partyMap.has(targetRole)) {
        const target = partyMap.get(targetRole)!;
        target.fieldNames.push(...companyParty.fieldNames);
        for (const [k, v] of Object.entries(companyParty.attributes)) {
          if (v && !target.attributes[k]) target.attributes[k] = v;
        }
      } else {
        companyParty.role = targetRole;
        companyParty.label = roleToLabel(targetRole, explicitRoles);
        partyMap.set(targetRole, companyParty);
      }
    } else {
      // Company is the only party — relabel it as the second role (seller/landlord/etc.)
      companyParty.role = expectedPair[1];
      companyParty.label = roleToLabel(expectedPair[1], explicitRoles);
      partyMap.set(expectedPair[1], companyParty);
    }
    partyMap.delete("company");
  }

  // Representative, shareholder, administrator are kept as separate parties
  // for clearer UI grouping — they are NOT merged into parent parties.

  const parties = Array.from(partyMap.values());

  // Build a role remapping for merged roles (e.g. "company" → "seller")
  // This allows the caller to relabel field groups after merging
  const roleRemapping = new Map<string, string>();
  for (const party of parties) {
    for (const fieldName of party.fieldNames) {
      // Extract the original role from the field name prefix
      const field = replacements.find((r) => r.field.name === fieldName);
      if (field && field.field.entity && field.field.entity !== party.role) {
        roleRemapping.set(field.field.entity, party.role);
      }
    }
  }

  // ──────────────────────────────────────────────────
  // Detect optional sections
  // ──────────────────────────────────────────────────
  const optionalSections: string[] = [];
  if (/DPH|daň z přidané hodnoty/i.test(text)) {
    optionalSections.push("DPH / VAT sekce");
    notes.push("Dokument obsahuje zmínku o DPH — zvažte podmíněnou sekci {{#if IS_PLATCE_DPH}}");
  }
  if (/příloha|přílohy/i.test(text)) {
    optionalSections.push("Přílohy");
    notes.push("Dokument odkazuje na přílohy");
  }
  if (/penále|smluvní pokut/i.test(text)) {
    optionalSections.push("Smluvní pokuty");
  }

  return { replacements, entities, parties, contractType, roleRemapping, notes, optionalSections };
}

/** Analyze plain text — replaces values with placeholders, nothing else */
export function analyzeDocument(text: string): AnalysisResult {
  const { replacements, entities, parties, contractType, roleRemapping, notes, optionalSections } = detectReplacements(text);

  // Apply replacements to a copy of the original text — only swap values, preserve everything else
  let templateText = text;
  const fields: DetectedField[] = [];

  for (const r of replacements) {
    const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    templateText = templateText.replace(new RegExp(escaped, "g"), r.placeholder);

    // Relabel field groups based on party merging (e.g. "Společnost" → "Prodávající")
    const field = { ...r.field };
    if (field.entity && roleRemapping.has(field.entity)) {
      const newRole = roleRemapping.get(field.entity)!;
      field.group = roleToLabel(newRole);
      field.entity = newRole;
    }
    fields.push(field);
  }

  const groups = [...new Set(fields.map((f) => f.group))];
  const totalOccurrences = fields.reduce((sum, f) => sum + f.occurrences, 0);

  if (fields.length === 0) {
    notes.push("Nebyly nalezeny žádné proměnné hodnoty. Zkuste nahrát dokument s konkrétními údaji (jména, data, IČO apod.).");
  } else {
    notes.push(`Nalezeno ${fields.length} unikátních polí (${totalOccurrences} výskytů) v ${groups.length} skupinách.`);
  }

  return { templateText, fields, groups, entities, parties, contractType, optionalSections, notes, originalText: text };
}

/**
 * Analyze a DOCX file.
 * - Detects variable values from extracted text.
 * - Replaces those values directly inside the DOCX XML (preserving all formatting).
 * - Returns the modified DOCX as base64 for later use with docxtemplater.
 */
export function analyzeDocx(arrayBuffer: ArrayBuffer): AnalysisResult {
  const text = extractTextFromDocx(arrayBuffer);
  const { replacements, entities, parties, contractType, roleRemapping, notes, optionalSections } = detectReplacements(text);

  // Apply replacements to plain text preview
  let templateText = text;
  const fields: DetectedField[] = [];

  for (const r of replacements) {
    const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    templateText = templateText.replace(new RegExp(escaped, "g"), r.placeholder);

    // Relabel field groups based on party merging
    const field = { ...r.field };
    if (field.entity && roleRemapping.has(field.entity)) {
      const newRole = roleRemapping.get(field.entity)!;
      field.group = roleToLabel(newRole);
      field.entity = newRole;
    }
    fields.push(field);
  }

  // Apply replacements directly inside the DOCX XML (preserves formatting)
  let templateDocxBase64: string | undefined;
  try {
    const zip = new PizZip(arrayBuffer);
    const docFile = zip.file("word/document.xml");
    if (docFile) {
      let xml = docFile.asText();

      for (const r of replacements) {
        xml = replaceInDocxXml(xml, r.original, r.placeholder);
      }

      zip.file("word/document.xml", xml);
      templateDocxBase64 = zip.generate({ type: "base64" });
    }
  } catch (e) {
    console.error("Failed to create template DOCX:", e);
  }

  const groups = [...new Set(fields.map((f) => f.group))];
  const totalOccurrences = fields.reduce((sum, f) => sum + f.occurrences, 0);

  if (fields.length === 0) {
    notes.push("Nebyly nalezeny žádné proměnné hodnoty. Zkuste nahrát dokument s konkrétními údaji (jména, data, IČO apod.).");
  } else {
    notes.push(`Nalezeno ${fields.length} unikátních polí (${totalOccurrences} výskytů) v ${groups.length} skupinách.`);
  }

  return { templateText, fields, groups, entities, parties, contractType, optionalSections, notes, originalText: text, templateDocxBase64 };
}

/**
 * Reprocess an already-generated template text.
 * Scans for any remaining literal entities (addresses, names, IČO, etc.)
 * that were missed in the first pass and replaces them with placeholders.
 *
 * Existing {{placeholder}} tokens are preserved — only literal values are replaced.
 */
export function reprocessTemplate(templateText: string): AnalysisResult {
  // Strip existing placeholders temporarily so patterns don't match inside them.
  // We replace {{...}} with a unique token, run detection, then restore.
  const placeholderTokens: { token: string; original: string }[] = [];
  let safeText = templateText;
  const placeholderRegex = /\{\{[^}]+\}\}/g;
  let idx = 0;
  safeText = safeText.replace(placeholderRegex, (match) => {
    const token = `__PH${idx++}__`;
    placeholderTokens.push({ token, original: match });
    return token;
  });

  // Run standard detection on the text with placeholders removed
  const { replacements, entities, parties, contractType, roleRemapping, notes, optionalSections } = detectReplacements(safeText);

  // Apply new replacements
  let result = safeText;
  const fields: DetectedField[] = [];

  for (const r of replacements) {
    const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "g"), r.placeholder);

    const field = { ...r.field };
    if (field.entity && roleRemapping.has(field.entity)) {
      const newRole = roleRemapping.get(field.entity)!;
      field.group = roleToLabel(newRole);
      field.entity = newRole;
    }
    fields.push(field);
  }

  // Restore original placeholders
  for (const { token, original } of placeholderTokens) {
    result = result.replace(new RegExp(token, "g"), original);
  }

  const groups = [...new Set(fields.map((f) => f.group))];

  if (fields.length > 0) {
    notes.push(`Reprocessing nalezlo ${fields.length} dalších polí k nahrazení.`);
  } else {
    notes.push("Reprocessing nenalezlo žádné zbývající literální hodnoty.");
  }

  return {
    templateText: result,
    fields,
    groups,
    entities,
    parties,
    contractType,
    optionalSections,
    notes,
    originalText: templateText,
  };
}

/** Convert analysis result to a template-schemas.ts compatible schema */
export function analysisToSchema(analysis: AnalysisResult) {
  const properties: Record<string, { type: string; title: string }> = {};
  const required: string[] = [];

  for (const field of analysis.fields) {
    properties[field.name] = {
      type: field.type === "number" || field.type === "currency" ? "number" : "string",
      title: field.title,
    };
    if (field.required) {
      required.push(field.name);
    }
  }

  return { type: "object" as const, properties, required };
}
