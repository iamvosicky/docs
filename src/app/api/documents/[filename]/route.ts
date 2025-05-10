import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // In a real implementation, we would:
    // 1. Validate the user has access to this document
    // 2. Retrieve the document from storage
    // 3. Return the document as a response
    
    // For this demo, we'll generate a simple text document
    const fileContent = `This is a mock document: ${filename}
    
Generated at: ${new Date().toISOString()}

This is a placeholder for the actual document content.
In a real implementation, this would be the actual document content.
`;
    
    // Determine content type based on file extension
    const isDocx = filename.endsWith('.docx');
    const contentType = isDocx 
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';
    
    // Create a response with the file content
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving document:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}
