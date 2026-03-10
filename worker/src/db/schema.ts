import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Template schema
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  schema_json: z.string(),
  r2_key: z.string(),
  created_at: z.string().datetime(),
});

export type Template = z.infer<typeof TemplateSchema>;

// File schema
export const FileSchema = z.object({
  id: z.string(),
  template_id: z.string(),
  user_id: z.string(),
  docx_key: z.string(),
  pdf_key: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type File = z.infer<typeof FileSchema>;

// Audit log schema
export const AuditLogSchema = z.object({
  id: z.number(),
  actor_id: z.string(),
  action: z.string(),
  obj_id: z.string(),
  ts: z.string().datetime(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
