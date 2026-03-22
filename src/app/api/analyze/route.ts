import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert Czech legal document analyzer. Extract all variable fields from the provided contract text. Return ONLY valid JSON, no other text.`;

function buildUserPrompt(documentText: string): string {
  return `Analyze this Czech legal document and extract ALL variable fields that must become template placeholders.

CRITICAL RULES:
1. Company names must be extracted IN FULL including their legal suffix (s.r.o., a.s., k.s. etc.) — never split them
2. Every address (sídlem, bytem, adresa) must be its own field — never leave addresses as static text
3. IČO placeholders must replace the actual 8-digit number — if IČO is blank (e.g. "IČO: (_)"), add a placeholder anyway
4. When multiple people sign for one company (e.g. předseda + člen představenstva), give each person a DISTINCT title: "Jméno předsedy představenstva", "Jméno člena představenstva" — never use the same title twice
5. Registry details (oddíl, vložka, soud) must be separate fields if they vary per contract
6. If a value appears blank or as (_) in the document, still create the field with originalText set to "(_)"
7. The templateText must have NO leftover literal values — every name, IČO, address, amount, date must be a {{placeholder}}

For each field return:
- name: unique SNAKE_CASE identifier describing the entity and attribute (e.g. zajemce_address, poskytovatel_ico, predseda_name)
- type: text | date | number | currency | ico | rc | textarea | account | percentage
- title: specific Czech label (e.g. "Adresa sídla (Zájemce)", "IČO (Poskytovatel)", "Jméno předsedy představenstva")
- description: one-line Czech description
- example: realistic example value
- group: party name in Czech matching the document's "dále jen" label (e.g. "Zájemce", "Poskytovatel", "Převodce")
- required: true for all identity fields (name, address, IČO), false for optional clauses
- originalText: the EXACT string from the document to replace (must exist verbatim in the text)
- occurrences: count of exact matches in the full text
- entity: English role id if this field belongs to a contract party (buyer, seller, employer, employee, tenant, landlord, etc.), omit for contract-level fields
- confidence: 0.95 for IČO/RC/amounts, 0.85 for names/addresses, 0.75 for context-dependent fields

Also detect contract parties and return:
- parties: array of { role: English role id, label: Czech label, attributes: { name?, address?, companyId?, taxId?, birthNumber?, bankAccount?, email?, phone? } }

Return JSON (no markdown, no code fences, just raw JSON):
{
  "templateText": "full document text with all values replaced by {{placeholder_name}}",
  "fields": [{ "name": "string", "type": "string", "title": "string", "description": "string", "example": "string", "group": "string", "required": true, "originalText": "string", "occurrences": 1, "entity": "string", "confidence": 0.9 }],
  "parties": [{ "role": "string", "label": "string", "attributes": {} }],
  "groups": ["Zájemce", "Poskytovatel"],
  "contractType": "work|purchase|transfer|lease|employment|power|loan|assignment|donation|other",
  "notes": ["string"]
}

Document:
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
  parties: ClaudeParty[];
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

    // Use Claude's templateText if provided, otherwise build it ourselves
    let templateText = parsed.templateText || text;
    if (!parsed.templateText) {
      for (const field of fields) {
        if (!field.originalText) continue;
        const escaped = field.originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        templateText = templateText.replace(new RegExp(escaped, "g"), `{{${field.name}}}`);
      }
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
