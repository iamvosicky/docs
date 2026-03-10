import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';

// Mock template content for the Edge runtime
const mockTemplates: Record<string, string> = {
  'smlouva-o-dilo': '<h1>Smlouva o dílo</h1><p>Mezi {{KUP_JMENO}} a {{PROD_JMENO}}</p><p>Předmět díla: {{PREDMET_DILA}}</p><p>Cena: {{CENA}}</p><p>Datum předání: {{DATUM_PREDANI}}</p>',
  'dohoda-o-provedeni-prace': '<h1>Dohoda o provedení práce</h1><p>Zaměstnavatel: {{ZAM_JMENO}}</p><p>Pracovník: {{PRAC_JMENO}}</p><p>Popis práce: {{POPIS_PRACE}}</p><p>Odměna: {{ODMENA}}</p>',
  'kupni-smlouva': '<h1>Kupní smlouva</h1><p>Kupující: {{KUP_JMENO}}</p><p>Prodávající: {{PROD_JMENO}}</p><p>Předmět prodeje: {{PREDMET_PRODEJE}}</p><p>Cena: {{CENA}}</p>'
};

// Generate a document file
const generateDocument = async (
  templateId: string,
  formData: Record<string, string>,
  format: 'docx' | 'pdf'
): Promise<string> => {
  // Create a unique filename
  const filename = `${templateId}-${uuidv4()}.${format}`;

  // Get template content
  const templateContent = mockTemplates[templateId];
  if (!templateContent) {
    throw new Error(`Template not found for ID: ${templateId}`);
  }

  try {
    // Add current date to form data if not provided
    if (!formData['DATUM_PODPISU']) {
      formData['DATUM_PODPISU'] = new Date().toLocaleDateString('cs-CZ');
    }

    // Process the template with the form data
    let processedContent = templateContent;

    // Replace placeholders in the template
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        const placeholder = `{{${key}}}`;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
      } else {
        // Replace empty values with a dash or empty string
        const placeholder = `{{${key}}}`;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), '-');
      }
    });

    // In a real implementation with Edge runtime, we would:
    // 1. Store the generated content in a database or cloud storage
    // 2. Return a URL to access the generated document

    // For this demo, we'll just return a mock URL
    const mockUrl = `/api/documents/${filename}`;

    return mockUrl;
  } catch (error) {
    console.error(`Error generating ${format} document:`, error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { templates, formData } = body;

    if (!templates || !Array.isArray(templates) || !formData) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Generate documents for each template
    const results: Record<string, { docx?: string; pdf?: string }> = {};

    for (const templateId of templates) {
      // Generate both DOCX and PDF versions
      const [docxUrl, pdfUrl] = await Promise.all([
        generateDocument(templateId, formData, 'docx'),
        generateDocument(templateId, formData, 'pdf')
      ]);

      results[templateId] = {
        docx: docxUrl,
        pdf: pdfUrl
      };
    }

    // Return the download links
    return NextResponse.json({ success: true, links: results });
  } catch (error) {
    console.error('Error generating documents:', error);
    return NextResponse.json(
      { error: 'Failed to generate documents' },
      { status: 500 }
    );
  }
}
