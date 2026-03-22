import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert Czech legal document analyzer. Extract all variable fields from the provided contract text. Return ONLY valid JSON, no other text.`;

function buildUserPrompt(documentText: string): string {
  return `Analyze this Czech legal document and extract all variable fields that should become template placeholders.

For each detected field return:
- name: unique identifier using role_prefix format (e.g. seller_name, buyer_company_id, payment, contract_date). Use English role prefixes: buyer, seller, employer, employee, tenant, landlord, etc.
- type: one of: text | date | number | currency | ico | rc | textarea | account | percentage
- title: human-readable Czech label (e.g. "Jméno a příjmení (Prodávající)", "IČO (Kupující)")
- description: brief Czech description
- example: the actual value extracted from the document
- group: logical group in Czech matching the party role (e.g. "Kupující", "Prodávající", "Zaměstnavatel", "Identifikace", "Úplata", "Termíny", "Obecné")
- required: boolean
- originalText: the EXACT string from the document to replace (must match character-for-character)
- occurrences: how many times this exact value appears in the document
- entity: English role id if this field belongs to a contract party (buyer, seller, employer, employee, tenant, landlord, etc.), omit for contract-level fields
- confidence: float 0-1 (0.95+ for structured data like IČO/dates, 0.75 for names, 0.8 for addresses)

Also detect contract parties and return:
- parties: array of { role: English role id, label: Czech label, attributes: { name?, address?, companyId?, taxId?, birthNumber?, bankAccount?, email?, phone? } }

Also return:
- contractType: one of: purchase | transfer | work | lease | employment | power | loan | assignment | donation | other
- notes: array of Czech strings with observations about the document

Rules:
- Only extract values that vary per contract instance (names, IČO, addresses, dates, amounts, bank accounts)
- Do NOT extract static legal boilerplate text, article numbers, or section headings
- Do NOT extract role labels themselves (e.g. "Poskytovatel", "Kupující") — only the actual values
- For the same value appearing multiple times, create ONE field with occurrences > 1
- IČO must be exactly 8 digits
- Dates in Czech format (DD.MM.YYYY or written out)
- Currency amounts: extract the numeric value. If a written-out form follows in parentheses, note it
- Person names: only extract actual person names (e.g. "Jan Novák"), never legal terms or section headings
- Addresses: extract the full address as one field, not individual parts
- originalText must be the EXACT substring from the document — it will be used for find-and-replace

Return JSON in this exact shape (no markdown, no code fences, just raw JSON):
{
  "fields": [{ "name": "string", "type": "string", "title": "string", "description": "string", "example": "string", "group": "string", "required": true, "originalText": "string", "occurrences": 1, "entity": "string", "confidence": 0.9 }],
  "parties": [{ "role": "string", "label": "string", "attributes": {} }],
  "contractType": "string",
  "notes": ["string"]
}

Document text:
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
  fields: ClaudeField[];
  parties: ClaudeParty[];
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

    // Build templateText by replacing originalText values with {{name}} placeholders
    let templateText = text;
    for (const field of fields) {
      if (!field.originalText) continue;
      const escaped = field.originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      templateText = templateText.replace(new RegExp(escaped, "g"), `{{${field.name}}}`);
    }

    // Build groups from fields
    const groups = [...new Set(fields.map((f) => f.group))];

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
