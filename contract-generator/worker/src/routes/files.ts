import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { FileSchema } from '../db/schema';
import { generateDocx } from '../utils/docx-generator';

// Define environment bindings
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  PDF_QUEUE: Queue;
}

// Create router
const app = new Hono<{ Bindings: Env }>();

// Generate document
app.post('/generate/:templateId', authMiddleware, async (c) => {
  const templateId = c.req.param('templateId');
  const user = c.get('user');
  
  try {
    // Get template
    const template = await c.env.DB.prepare(
      'SELECT * FROM Templates WHERE id = ?'
    ).bind(templateId).first();
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Parse JSON data
    const data = await c.req.json();
    
    // Generate DOCX
    const fileId = crypto.randomUUID();
    const docxKey = `files/${fileId}.docx`;
    
    // Get template file from R2
    const templateFile = await c.env.STORAGE.get(template.r2_key);
    
    if (!templateFile) {
      return c.json({ error: 'Template file not found' }, 404);
    }
    
    // Generate DOCX
    const docxBuffer = await generateDocx(await templateFile.arrayBuffer(), data);
    
    // Upload DOCX to R2
    await c.env.STORAGE.put(docxKey, docxBuffer);
    
    // Create file record
    const created_at = new Date().toISOString();
    await c.env.DB.prepare(
      'INSERT INTO Files (id, template_id, user_id, docx_key, pdf_key, created_at) VALUES (?, ?, ?, ?, NULL, ?)'
    ).bind(fileId, templateId, user.id, docxKey, created_at).run();
    
    // Log action
    await c.env.DB.prepare(
      'INSERT INTO AuditLog (actor_id, action, obj_id, ts) VALUES (?, ?, ?, ?)'
    ).bind(user.id, 'FILE_GENERATED', fileId, created_at).run();
    
    // Queue PDF conversion
    await c.env.PDF_QUEUE.send({
      fileId,
      docxUrl: await c.env.STORAGE.createSignedUrl(docxKey, 3600), // 1 hour expiry
    });
    
    // Generate signed URLs for download
    const docxUrl = await c.env.STORAGE.createSignedUrl(docxKey, 86400); // 24 hour expiry
    
    return c.json({
      message: 'Document generated successfully',
      file: {
        id: fileId,
        docxUrl,
        pdfUrl: null, // Will be available after PDF conversion
      },
    });
  } catch (error) {
    console.error(`Error generating document for template ${templateId}:`, error);
    return c.json({ error: 'Failed to generate document' }, 500);
  }
});

// Get all files
app.get('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT f.id, f.template_id, f.user_id, f.created_at, t.name as template_name, u.email as user_email ' +
      'FROM Files f ' +
      'JOIN Templates t ON f.template_id = t.id ' +
      'JOIN Users u ON f.user_id = u.id ' +
      'ORDER BY f.created_at DESC'
    ).all();
    
    return c.json({ files: results });
  } catch (error) {
    console.error('Error fetching files:', error);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// Get file by ID
app.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  
  try {
    const file = await c.env.DB.prepare(
      'SELECT * FROM Files WHERE id = ?'
    ).bind(id).first();
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Check if user is admin or file owner
    if (user.role !== 'admin' && file.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Generate signed URLs for download
    const docxUrl = await c.env.STORAGE.createSignedUrl(file.docx_key, 86400); // 24 hour expiry
    let pdfUrl = null;
    
    if (file.pdf_key) {
      pdfUrl = await c.env.STORAGE.createSignedUrl(file.pdf_key, 86400); // 24 hour expiry
    }
    
    return c.json({
      file: {
        ...file,
        docxUrl,
        pdfUrl,
      },
    });
  } catch (error) {
    console.error(`Error fetching file ${id}:`, error);
    return c.json({ error: 'Failed to fetch file' }, 500);
  }
});

// Delete file
app.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  
  try {
    // Get file
    const file = await c.env.DB.prepare(
      'SELECT * FROM Files WHERE id = ?'
    ).bind(id).first();
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Delete from R2
    await c.env.STORAGE.delete(file.docx_key);
    
    if (file.pdf_key) {
      await c.env.STORAGE.delete(file.pdf_key);
    }
    
    // Delete from database
    await c.env.DB.prepare(
      'DELETE FROM Files WHERE id = ?'
    ).bind(id).run();
    
    // Log action
    await c.env.DB.prepare(
      'INSERT INTO AuditLog (actor_id, action, obj_id, ts) VALUES (?, ?, ?, ?)'
    ).bind(user.id, 'FILE_DELETED', id, new Date().toISOString()).run();
    
    return c.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting file ${id}:`, error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

export const fileRoutes = app;
