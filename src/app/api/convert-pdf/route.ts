import { NextRequest, NextResponse } from 'next/server';
import {
  convertDocxToPdf,
  PdfConversionError,
} from '@/lib/pdf-converter';

/**
 * POST /api/convert-pdf
 *
 * Accepts a DOCX file (multipart/form-data or raw binary),
 * converts it to PDF via the configured provider, and returns the PDF.
 *
 * Request:
 *   Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *   Body: raw DOCX bytes
 *
 * Response:
 *   200  Content-Type: application/pdf    (PDF bytes)
 *   400  Bad request (no body / wrong content type)
 *   501  No PDF provider configured
 *   502  Upstream conversion failed
 *   500  Unexpected error
 */
export async function POST(request: NextRequest) {
  try {
    // ── Read the DOCX from the request body ──────────────────────────────
    const contentType = request.headers.get('content-type') ?? '';
    let docxBuffer: ArrayBuffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: 'Missing "file" field in form data' },
          { status: 400 },
        );
      }
      docxBuffer = await file.arrayBuffer();
    } else {
      // Accept raw DOCX binary
      docxBuffer = await request.arrayBuffer();
    }

    if (!docxBuffer || docxBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 },
      );
    }

    // Basic DOCX validation: ZIP files start with PK (0x50 0x4B)
    const header = new Uint8Array(docxBuffer.slice(0, 2));
    if (header[0] !== 0x50 || header[1] !== 0x4b) {
      return NextResponse.json(
        { error: 'Invalid DOCX file (not a valid ZIP archive)' },
        { status: 400 },
      );
    }

    // ── Convert ──────────────────────────────────────────────────────────
    const pdfBuffer = await convertDocxToPdf(docxBuffer);

    if (pdfBuffer === null) {
      return NextResponse.json(
        {
          error: 'No PDF conversion provider configured',
          hint: 'Set PDF_PROVIDER env var to "cloudconvert" or "gotenberg"',
        },
        { status: 501 },
      );
    }

    // ── Return PDF ───────────────────────────────────────────────────────
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[convert-pdf]', err);

    if (err instanceof PdfConversionError) {
      return NextResponse.json(
        {
          error: err.message,
          provider: err.provider,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Unexpected error during PDF conversion' },
      { status: 500 },
    );
  }
}
