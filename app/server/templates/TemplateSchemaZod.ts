// ============ templates/TemplateSchemaZod.ts ============
import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug invalide"),
  description: z.string().max(500).optional(),
  price: z.number().int().positive(),
  previewImages: z.array(z.string().url()).min(1),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(500).optional(),
  price: z.number().int().positive().optional(),
  previewImages: z.array(z.string().url()).min(1).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;