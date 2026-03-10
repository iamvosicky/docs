require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 8080;

// Temp directory for file processing
const TEMP_DIR = path.join(__dirname, 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// Process queue message
async function processQueueMessage(message) {
  const { fileId, docxUrl } = message;
  
  try {
    console.log(`Processing file ${fileId}`);
    
    // Download DOCX file
    const docxPath = path.join(TEMP_DIR, `${fileId}.docx`);
    const response = await axios.get(docxUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(docxPath, response.data);
    
    // Convert to PDF
    const pdfPath = path.join(TEMP_DIR, `${fileId}.pdf`);
    await convertToPdf(docxPath, pdfPath);
    
    // Upload PDF to R2
    await uploadPdfToR2(fileId, pdfPath);
    
    // Clean up
    fs.unlinkSync(docxPath);
    fs.unlinkSync(pdfPath);
    
    console.log(`Successfully processed file ${fileId}`);
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
  }
}

// Convert DOCX to PDF using LibreOffice
function convertToPdf(docxPath, pdfPath) {
  return new Promise((resolve, reject) => {
    const command = `libreoffice --headless --convert-to pdf --outdir ${TEMP_DIR} ${docxPath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting file: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

// Upload PDF to R2
async function uploadPdfToR2(fileId, pdfPath) {
  // This is a placeholder for the actual upload logic
  // In a real implementation, this would use the Cloudflare API to upload the file
  console.log(`Uploading PDF for file ${fileId} to R2`);
  
  // Read the PDF file
  const pdfData = fs.readFileSync(pdfPath);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', pdfData, { filename: `${fileId}.pdf` });
  
  // Upload to R2
  // This is a placeholder - in a real implementation, this would use the Cloudflare API
  // await axios.post('https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/{bucket_name}/objects', formData, {
  //   headers: {
  //     ...formData.getHeaders(),
  //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  //   },
  // });
  
  // Update the file record in D1
  // This is a placeholder - in a real implementation, this would use the Cloudflare API
  // await axios.patch(`https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}/query`, {
  //   sql: 'UPDATE Files SET pdf_key = ? WHERE id = ?',
  //   params: [`files/${fileId}.pdf`, fileId],
  // }, {
  //   headers: {
  //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  //   },
  // });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
  
  // In a real implementation, this would listen to a queue
  // For now, we'll just log a message
  console.log('Ready to process PDF conversion requests');
});
