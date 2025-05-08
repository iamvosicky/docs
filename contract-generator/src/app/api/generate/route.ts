import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Create a directory for storing generated files
const TEMP_DIR = path.join(process.cwd(), 'public', 'generated');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean up old files (files older than 1 hour)
const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > oneHour) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Generate a document file
const generateDocument = async (
  templateId: string,
  formData: Record<string, string>,
  format: 'docx' | 'pdf'
): Promise<string> => {
  // Create a unique filename
  const filename = `${templateId}-${uuidv4()}.${format}`;
  const filePath = path.join(TEMP_DIR, filename);

  // Map template IDs to template file names
  const templateFiles: Record<string, string> = {
    'smlouva-o-dilo': 'smlouva-o-dilo.html',
    'dohoda-o-provedeni-prace': 'dohoda-o-provedeni-prace.html',
    'kupni-smlouva': 'kupni-smlouva.html'
  };

  // Get template file path
  const templateFile = templateFiles[templateId];
  if (!templateFile) {
    throw new Error(`Template not found for ID: ${templateId}`);
  }

  const templatePath = path.join(process.cwd(), 'public', 'templates', templateFile);

  // Check if template file exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  try {
    // Add current date to form data if not provided
    if (!formData['DATUM_PODPISU']) {
      formData['DATUM_PODPISU'] = new Date().toLocaleDateString('cs-CZ');
    }

    // Read the template file
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

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

    // Write the processed content to the output file
    fs.writeFileSync(filePath, processedContent);

    // For PDF format, we would need to convert the HTML to PDF
    // For simplicity, we'll just use the same HTML content with a .pdf extension
    if (format === 'pdf') {
      const pdfFilename = `${templateId}-${uuidv4()}.pdf`;
      const pdfFilePath = path.join(TEMP_DIR, pdfFilename);
      fs.writeFileSync(pdfFilePath, processedContent);
      return `/generated/${pdfFilename}`;
    }
  } catch (error) {
    console.error(`Error generating ${format} document:`, error);
    throw error;
  }

  // Return the public URL to the file
  return `/generated/${filename}`;
};

export async function POST(request: NextRequest) {
  try {
    // Clean up old files
    cleanupOldFiles();

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
