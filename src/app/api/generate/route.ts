import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock templates data
const mockTemplates: Record<string, string> = {
  'template-1': 'Employment Contract',
  'template-2': 'Non-Disclosure Agreement',
  'template-3': 'Service Agreement',
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
    const links: Record<string, { docx?: string; pdf?: string }> = {};

    for (const templateId of templates) {
      // Generate both DOCX and PDF versions
      const docxUrl = await generateDocument(templateId, formData, 'docx');
      const pdfUrl = await generateDocument(templateId, formData, 'pdf');

      links[templateId] = {
        docx: docxUrl,
        pdf: pdfUrl
      };
    }

    return NextResponse.json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Error generating documents:', error);
    return NextResponse.json(
      { error: 'Failed to generate documents' },
      { status: 500 }
    );
  }
}

// Generate a document file
async function generateDocument(
  templateId: string,
  formData: Record<string, string>,
  format: 'docx' | 'pdf'
): Promise<string> {
  // Create a unique filename
  const filename = `${templateId}-${uuidv4()}.${format}`;

  // Get template content
  const templateContent = mockTemplates[templateId];
  if (!templateContent) {
    throw new Error(`Template not found for ID: ${templateId}`);
  }

  // In a real implementation, we would:
  // 1. Load the template file
  // 2. Replace placeholders with form data
  // 3. Generate the document
  // 4. Save the document to a storage service

  // For this demo, we'll just return a mock URL
  const mockUrl = `/api/documents/${filename}`;

  return mockUrl;
}
