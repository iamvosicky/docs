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

export interface AnalysisResult {
  templateText: string;
  fields: DetectedField[];
  groups: string[];
  entities: EntityGroup[];
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
    group: "Osobní údaje",
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
const COMPANY_SUFFIX = /(?:s\.r\.o\.|a\.s\.|k\.s\.|v\.o\.s\.|z\.s\.|spol\.\s*s\s*r\.o\.|SE|akciová společnost|společnost s ručením omezeným)/;

const PERSON_NAME_PATTERN = /(?:(?:pan[íu]?|panem|jméno|zastoupen[áý]?m?)\s+)?([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+)?)/g;

// Full-span address: capture everything after the keyword up to end of address (including PSČ)
// Important: [^\n] instead of \s to prevent matching across line breaks
const ADDRESS_PATTERN = /(?:(?:se sídlem|bytem|bydliště|adresa|trvale bytem|na adrese)[:\s]+)([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž ]+\d+[\w/]*(?:,\s*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž \d-]+)*(?:,\s*\d{3}\s?\d{2}(?:\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]+)?)?)/gi;

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

/** Map of English role IDs used in field names */
const ROLE_MAP: { pattern: RegExp; role: string }[] = [
  { pattern: /(?:kupující|objednatel|nabyvatel)/, role: "buyer" },
  { pattern: /(?:prodávající|zhotovitel|dodavatel|poskytovatel)/, role: "seller" },
  { pattern: /(?:zaměstnavatel)/, role: "employer" },
  { pattern: /(?:zaměstnanec|pracovník)/, role: "employee" },
  { pattern: /(?:zmocnitel|zmocňovatel)/, role: "principal" },
  { pattern: /(?:zmocněnec)/, role: "attorney" },
  { pattern: /(?:nájemce)/, role: "tenant" },
  { pattern: /(?:pronajímatel)/, role: "landlord" },
  { pattern: /(?:věřitel)/, role: "creditor" },
  { pattern: /(?:dlužník)/, role: "debtor" },
  { pattern: /(?:jednatel|statutární|ředitel|předseda)/, role: "representative" },
  { pattern: /(?:správce\s*vkladu)/, role: "administrator" },
  { pattern: /(?:akcionář|společník|vlastník)/, role: "shareholder" },
];

/** Detect the entity role from context text preceding the match.
 *  Finds the CLOSEST (most recent) role keyword to get accurate assignment. */
function detectRole(textBefore: string): string {
  const lower = textBefore.toLowerCase();
  const context = lower.slice(-500);

  let bestRole = "";
  let bestPos = -1;

  for (const { pattern, role } of ROLE_MAP) {
    // Find the last occurrence of this role keyword in context
    const regex = new RegExp(pattern.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = regex.exec(context)) !== null) {
      if (m.index > bestPos) {
        bestPos = m.index;
        bestRole = role;
      }
    }
  }
  return bestRole;
}

/** Czech label for entity/role used in UI groups */
function roleToLabel(role: string): string {
  const map: Record<string, string> = {
    buyer: "Kupující",
    seller: "Prodávající",
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
  };
  return map[role] || role;
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
  notes: string[];
  optionalSections: string[];
} {
  const notes: string[] = [];
  const ctx: FieldContext = { counters: {}, replacedTexts: new Set() };
  const replacements: { original: string; placeholder: string; field: DetectedField }[] = [];
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
    const group = roleToLabel(role) || defaultGroup;
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
        title: role ? `${titlePrefix} (${roleToLabel(role)})` : titlePrefix,
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
      const textBefore = text.slice(0, match.index);
      const role = detectRole(textBefore);
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

      const textBefore = text.slice(0, lineStart + before.lastIndexOf(words[nameStart] || ""));
      const role = detectRole(textBefore);
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
      const role = detectRole(textBefore);
      addReplacement(value, role, "birth_date", "date", "Datum narození", "Osobní údaje", "Datum narození", true);
    }
  }

  // 1d. Person names (full name as one field)
  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(PERSON_NAME_PATTERN.source, PERSON_NAME_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim();
      if (value.length < 4) continue;

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
      ];
      // Check if any word in the match is a skip word
      const words = value.split(/\s+/);
      if (skipWords.some((w) => words.some(word => word === w || value.includes(w)))) continue;

      // Reject if the same word appears twice (e.g. "Úplata Úplata")
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      if (uniqueWords.size < words.length) continue;

      // Reject 3-word matches if the first or last word duplicates part of an already-detected name
      if (words.length === 3) {
        const twoWordCombo1 = `${words[0]} ${words[1]}`;
        const twoWordCombo2 = `${words[1]} ${words[2]}`;
        // Prefer the 2-word version if it also appears in the text independently
        const combo1Count = countOccurrences(text, twoWordCombo1);
        const combo2Count = countOccurrences(text, twoWordCombo2);
        // If one combo appears much more than the 3-word version, skip the 3-word match
        const fullCount = countOccurrences(text, value);
        if (fullCount <= 1 && (combo1Count > fullCount || combo2Count > fullCount)) continue;
      }

      const textBefore = text.slice(0, match.index);
      const role = detectRole(textBefore);
      addReplacement(value, role, "name", "text", "Jméno a příjmení", "Osobní údaje", "Celé jméno osoby", true);
    }
  }

  // ──────────────────────────────────────────────────
  // PHASE 2: Structured patterns (IČO, DIČ, RČ, bank account, amounts)
  // ──────────────────────────────────────────────────

  for (const rule of PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1] || match[0];
      const textBefore = text.slice(0, match.index);
      const role = detectRole(textBefore);
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
      const role = detectRole(textBefore);
      if (isBirthDateContext(text, match.index)) {
        addReplacement(value, role, "birth_date", "date", "Datum narození", "Osobní údaje", "Datum narození", true);
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
      const role = detectRole(textBefore);
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
      const role = detectRole(textBefore);
      addReplacement(value, role, "email", "text", "E-mail", "Kontakt", "E-mailová adresa", false);
    }
  }

  {
    let match: RegExpExecArray | null;
    const regex = new RegExp(PHONE_PATTERN.source, PHONE_PATTERN.flags);
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim();
      const textBefore = text.slice(0, match.index);
      const role = detectRole(textBefore);
      addReplacement(value, role, "phone", "text", "Telefon", "Kontakt", "Telefonní číslo", false);
    }
  }

  // Sort longest first to avoid partial replacement overlaps
  replacements.sort((a, b) => b.original.length - a.original.length);

  // Build entity groups
  const entities: EntityGroup[] = [];
  for (const [role, fieldNames] of entityFields.entries()) {
    entities.push({
      id: role,
      label: roleToLabel(role),
      role,
      fields: [...fieldNames],
    });
  }

  // Detect optional sections
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

  return { replacements, entities, notes, optionalSections };
}

/** Analyze plain text — replaces values with placeholders, nothing else */
export function analyzeDocument(text: string): AnalysisResult {
  const { replacements, entities, notes, optionalSections } = detectReplacements(text);

  // Apply replacements to a copy of the original text — only swap values, preserve everything else
  let templateText = text;
  const fields: DetectedField[] = [];

  for (const r of replacements) {
    const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    templateText = templateText.replace(new RegExp(escaped, "g"), r.placeholder);
    fields.push(r.field);
  }

  const groups = [...new Set(fields.map((f) => f.group))];
  const totalOccurrences = fields.reduce((sum, f) => sum + f.occurrences, 0);

  if (fields.length === 0) {
    notes.push("Nebyly nalezeny žádné proměnné hodnoty. Zkuste nahrát dokument s konkrétními údaji (jména, data, IČO apod.).");
  } else {
    notes.push(`Nalezeno ${fields.length} unikátních polí (${totalOccurrences} výskytů) v ${groups.length} skupinách.`);
  }

  return { templateText, fields, groups, entities, optionalSections, notes, originalText: text };
}

/**
 * Analyze a DOCX file.
 * - Detects variable values from extracted text.
 * - Replaces those values directly inside the DOCX XML (preserving all formatting).
 * - Returns the modified DOCX as base64 for later use with docxtemplater.
 */
export function analyzeDocx(arrayBuffer: ArrayBuffer): AnalysisResult {
  const text = extractTextFromDocx(arrayBuffer);
  const { replacements, entities, notes, optionalSections } = detectReplacements(text);

  // Apply replacements to plain text preview
  let templateText = text;
  const fields: DetectedField[] = [];

  for (const r of replacements) {
    const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    templateText = templateText.replace(new RegExp(escaped, "g"), r.placeholder);
    fields.push(r.field);
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

  return { templateText, fields, groups, entities, optionalSections, notes, originalText: text, templateDocxBase64 };
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
