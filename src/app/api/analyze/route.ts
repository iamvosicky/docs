import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert Czech legal document template analyzer. Your job is to identify every value in the document that would change when this contract is reused for a different client or transaction. You MUST always respond with valid JSON only. Never refuse, never explain, never add prose before or after the JSON. If the document seems incomplete, still analyze whatever text is provided and return JSON.`;

function buildUserPrompt(documentText: string): string {
  return `Analyze the following Czech legal document. Identify every field that must become a template placeholder — meaning any value that would differ when this contract is signed with a different party or in a different situation.

## Step 1 — Identify all parties
Find every party defined via "(dále jen „X")" patterns. For each party, list ALL their attributes you find in the document: full legal name (including a.s., s.r.o. etc.), IČO, address, registry details (soud, oddíl, vložka), signatories.

## Step 2 — Identify all variable values
For EACH attribute of EACH party, create one field. Also identify:
- All monetary amounts (hourly rates, caps, penalties)
- All dates or date placeholders
- All blank fields written as (_) — these MUST become placeholders too

## Step 3 — Handle blank/empty fields
If a field in the document is written as "(_)" or "( )" or left as a blank line, the originalText must be exactly "(_)" or the blank pattern as it appears. Do NOT skip these. Blank fields MUST be replaced with {{placeholders}} in templateText.

## Step 4 — Company names
Company names MUST include their full legal suffix (a.s., s.r.o., k.s., v.o.s., spol. s r.o., etc.) as ONE single originalText value. Never split a company name from its suffix. Example: originalText must be "ATLANTIK finanční trhy, a.s." — never just "a.s." or just "ATLANTIK finanční trhy,".

## CRITICAL — originalText is MANDATORY
Every field MUST have an originalText property. originalText is the EXACT string as it appears verbatim in the document text. Without it, the template cannot be built. If you cannot find the exact text, use the closest match from the document. For blank fields, use "(_)" as originalText.

## Step 5 — Multiple signatories
If a company has multiple signatories (e.g. předseda představenstva + člen představenstva), create a separate field for each with a UNIQUE descriptive title: "Jméno předsedy představenstva (Zájemce)" and "Jméno člena představenstva (Zájemce)".

## Step 6 — Build templateText
Replace every originalText with its {{field_name}} placeholder in the full document text. The resulting templateText must contain NO remaining literal party names, IČO numbers, addresses, or amounts.

## Output format
Return this exact JSON structure (no markdown, no code fences, just raw JSON):
{
  "templateText": "<full document with all placeholders inserted>",
  "fields": [
    {
      "name": "zajemce_company_name",
      "type": "text",
      "title": "Název společnosti (Zájemce)",
      "description": "Plný název včetně právní formy",
      "example": "Novák s.r.o.",
      "group": "Zájemce",
      "required": true,
      "originalText": "ATLANTIK finanční trhy, a.s.",
      "occurrences": 2,
      "confidence": 0.95
    }
  ],
  "groups": ["Zájemce", "Poskytovatel", "Úplata"],
  "contractType": "work",
  "notes": []
}

Field naming convention:
- Use format: {party_slug}_{attribute} — e.g. zajemce_ico, poskytovatel_address, zajemce_predseda_name
- For blank (_) fields: use descriptive name based on the label before it — e.g. "poskytovatel_ico", "poskytovatel_address"
- Never reuse the same name twice

Types: text | date | number | currency | ico | rc | textarea | account | percentage

## Document to analyze:
${documentText}`;
}

interface ClaudeField {
  name: string;
  type: string;
  title: string;
  description: string;
  example: string;
  group: string;
  required: boolean;
  originalText: string;
  occurrences: number;
  entity?: string;
  confidence: number;
}

interface ClaudeParty {
  role: string;
  label: string;
  attributes: Record<string, string | undefined>;
}

interface ClaudeResponse {
  templateText?: string;
  fields: ClaudeField[];
  parties?: ClaudeParty[];
  groups?: string[];
  contractType: string;
  notes: string[];
}

export async function POST(req: NextRequest) {
  console.log("API ROUTE HIT");
  try {
    const { text, filename } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });

    // Truncate very long documents to stay within context limits
    const maxChars = 20_000;
    const truncatedText =
      text.length > maxChars ? text.slice(0, maxChars) + "\n\n[...dokument zkrácen...]" : text;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(truncatedText) }],
    });

    // Extract text content from response
    const contentBlock = response.content.find((b) => b.type === "text");
    if (!contentBlock || contentBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 },
      );
    }

    let jsonText = contentBlock.text.trim();

    // Remove markdown fences
    jsonText = jsonText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

    // Extract JSON object
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    console.log("JSON to parse (first 200):", jsonText.slice(0, 200));
    console.log("JSON char codes 0-5:", [...jsonText.slice(0, 5)].map(c => c.charCodeAt(0)));

    let parsed: ClaudeResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse Claude response as JSON.");
      console.error("Full raw Claude response:", contentBlock.text);
      return NextResponse.json(
        { error: "Invalid JSON from Claude", raw: jsonText.slice(0, 1000) },
        { status: 500 },
      );
    }

    console.log("Claude response:", JSON.stringify(parsed, null, 2));

console.log("RAW fields from Claude:");
(parsed.fields || []).forEach(f => {
  console.log(`  ${f.name}: originalText=${JSON.stringify(f.originalText)}, example=${JSON.stringify(f.example)}`);
});

    // Validate and normalize fields
    const validTypes = new Set([
      "text", "date", "number", "currency", "ico", "rc", "textarea", "account", "percentage",
    ]);

    const fields = (parsed.fields || []).map((f) => {
      // Fallback: if originalText is missing, try to find example value in the document
      let originalText = f.originalText || "";
      if (!originalText && f.example && text.includes(f.example)) {
        originalText = f.example;
      }

      return {
        name: f.name || "unknown",
        type: validTypes.has(f.type) ? f.type : "text",
        title: f.title || f.name,
        description: f.description || "",
        example: f.example || originalText || "",
        group: f.group || "Obecné",
        required: f.required !== false,
        originalText,
        occurrences: f.occurrences || 1,
        entity: f.entity || undefined,
        confidence: typeof f.confidence === "number" ? f.confidence : 0.85,
        source: { page: 1, section: undefined, lineNumber: undefined },
      };
    });

    // Always build templateText ourselves from the original document text
    // to ensure correct replacements. Claude's templateText can have errors
    // (e.g. partial company name replacements).
    // Sort fields by originalText length DESCENDING so longer strings
    // (full company names) are replaced before shorter substrings (e.g. "a.s.")
    let templateText = text;
    const sortedFields = [...fields].sort(
      (a, b) => (b.originalText?.length ?? 0) - (a.originalText?.length ?? 0),
    );
    for (const field of sortedFields) {
      if (!field.originalText) continue;
      const escaped = field.originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      templateText = templateText.replace(new RegExp(escaped, "g"), `{{${field.name}}}`);
    }

    // Use Claude's groups if provided, otherwise derive from fields
    const groups = parsed.groups && parsed.groups.length > 0
      ? parsed.groups
      : [...new Set(fields.map((f) => f.group))];

    // Build entity groups (legacy format)
    const entityFieldsMap = new Map<string, Set<string>>();
    for (const f of fields) {
      if (f.entity) {
        if (!entityFieldsMap.has(f.entity)) entityFieldsMap.set(f.entity, new Set());
        entityFieldsMap.get(f.entity)!.add(f.name);
      }
    }
    const entities = Array.from(entityFieldsMap.entries()).map(([role, fieldNames]) => ({
      id: role,
      label: (parsed.parties || []).find((p) => p.role === role)?.label || role,
      role,
      fields: [...fieldNames],
    }));

    // Build parties with fieldNames
    const parties = (parsed.parties || []).map((p) => ({
      role: p.role,
      label: p.label,
      attributes: p.attributes || {},
      fieldNames: fields.filter((f) => f.entity === p.role).map((f) => f.name),
    }));

    const contractType = parsed.contractType || "other";
    const notes = parsed.notes || [];

    // Add summary note
    const totalOccurrences = fields.reduce((sum, f) => sum + f.occurrences, 0);
    if (fields.length > 0) {
      notes.push(
        `Claude AI nalezlo ${fields.length} unikátních polí (${totalOccurrences} výskytů) v ${groups.length} skupinách.`,
      );
    }

    const result = {
      templateText,
      fields,
      groups,
      entities,
      parties,
      contractType,
      shares: [],
      optionalSections: [],
      notes,
      originalText: text,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
