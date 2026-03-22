import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert Czech legal document template analyzer. Your job is to identify every value in the document that would change when this contract is reused for a different client or transaction. You output only valid JSON.`;

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
If a field in the document is written as "(_)" or "( )" or left as a blank line, the originalText must be exactly "(_)" or the blank pattern as it appears. Do NOT skip these.

## Step 4 — Company names
Always capture the FULL company name including legal suffix as one originalText. Example: "ATLANTIK finanční trhy, a.s." is one field, never split it.

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
    const maxChars = 80_000;
    const truncatedText =
      text.length > maxChars ? text.slice(0, maxChars) + "\n\n[...dokument zkrácen...]" : text;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
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

    // Parse JSON — strip any markdown fences if Claude adds them
    let jsonText = contentBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let parsed: ClaudeResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse Claude response as JSON:", jsonText.slice(0, 500));
      return NextResponse.json(
        { error: "Invalid JSON from Claude", raw: jsonText.slice(0, 1000) },
        { status: 500 },
      );
    }

    console.log("Claude response:", JSON.stringify(parsed, null, 2));

    // Validate and normalize fields
    const validTypes = new Set([
      "text", "date", "number", "currency", "ico", "rc", "textarea", "account", "percentage",
    ]);

    const fields = (parsed.fields || []).map((f) => ({
      name: f.name || "unknown",
      type: validTypes.has(f.type) ? f.type : "text",
      title: f.title || f.name,
      description: f.description || "",
      example: f.example || f.originalText || "",
      group: f.group || "Obecné",
      required: f.required !== false,
      originalText: f.originalText || "",
      occurrences: f.occurrences || 1,
      entity: f.entity || undefined,
      confidence: typeof f.confidence === "number" ? f.confidence : 0.85,
      source: { page: 1, section: undefined, lineNumber: undefined },
    }));

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
