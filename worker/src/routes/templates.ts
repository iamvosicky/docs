import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { TemplateSchema } from '../db/schema';

// Define environment bindings
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
}

// Create router
const app = new Hono<{ Bindings: Env }>();

// Get all templates
app.get('/', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, version, created_at FROM Templates'
    ).all();
    
    return c.json({ templates: results });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return c.json({ error: 'Failed to fetch templates' }, 500);
  }
});

// Get template by ID
app.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  
  try {
    const template = await c.env.DB.prepare(
      'SELECT * FROM Templates WHERE id = ?'
    ).bind(id).first();
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    return c.json({ template });
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    return c.json({ error: 'Failed to fetch template' }, 500);
  }
});

// Create template schema
const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  schema_json: z.string().min(1),
  file: z.instanceof(File),
});

// Create template
app.post('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const schema_json = formData.get('schema_json') as string;
    const file = formData.get('file') as File;
    
    // Validate input
    const validatedData = CreateTemplateSchema.parse({
      name,
      schema_json,
      file,
    });
    
    // Generate ID and version
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const version = '1.0';
    const created_at = new Date().toISOString();
    const r2_key = `templates/${id}/${version}.docx`;
    
    // Upload file to R2
    await c.env.STORAGE.put(r2_key, file);
    
    // Insert into database
    await c.env.DB.prepare(
      'INSERT INTO Templates (id, name, version, schema_json, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, name, version, schema_json, r2_key, created_at).run();
    
    // Log action
    await c.env.DB.prepare(
      'INSERT INTO AuditLog (actor_id, action, obj_id, ts) VALUES (?, ?, ?, ?)'
    ).bind(c.get('user').id, 'TEMPLATE_CREATED', id, created_at).run();
    
    return c.json({
      message: 'Template created successfully',
      template: {
        id,
        name,
        version,
        created_at,
      },
    }, 201);
  } catch (error) {
    console.error('Error creating template:', error);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

// Delete template
app.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  
  try {
    // Get template
    const template = await c.env.DB.prepare(
      'SELECT * FROM Templates WHERE id = ?'
    ).bind(id).first();
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Delete from R2
    await c.env.STORAGE.delete(template.r2_key);
    
    // Delete from database
    await c.env.DB.prepare(
      'DELETE FROM Templates WHERE id = ?'
    ).bind(id).run();
    
    // Log action
    await c.env.DB.prepare(
      'INSERT INTO AuditLog (actor_id, action, obj_id, ts) VALUES (?, ?, ?, ?)'
    ).bind(c.get('user').id, 'TEMPLATE_DELETED', id, new Date().toISOString()).run();
    
    return c.json({
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    return c.json({ error: 'Failed to delete template' }, 500);
  }
});

export const templateRoutes = app;
