// ============ sites/SiteSchemaZod.ts ============
import { z } from "zod";

// slug : lettres minuscules, chiffres, tirets uniquement
const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const createSiteSchema = z.object({
  templateId: z.string().uuid(),
  subdomain: z.string()
    .min(3).max(50)
    .regex(subdomainRegex, "Uniquement lettres minuscules, chiffres et tirets"),
  groomName: z.string().min(1).max(60),
  brideName: z.string().min(1).max(60),
  eventDate: z.coerce.date()
    .refine((d) => d.getTime() > Date.now(), "La date de l'événement doit être dans le futur"),
});

const programItemSchema = z.object({
  time: z.string().min(1).max(10),
  label: z.string().min(1).max(100),
});

export const updateSiteCustomizationSchema = z.object({
  siteId: z.string().uuid(),
  groomName: z.string().min(1).max(60).optional(),
  brideName: z.string().min(1).max(60).optional(),
  eventDate: z.coerce.date()
    .refine((d) => d.getTime() > Date.now(), "La date doit rester dans le futur")
    .optional(),
  themeColors: z.record(z.string(), z.string()).optional(),
  customTexts: z.record(z.string(), z.string()).optional(),
  programItems: z.array(programItemSchema).max(15).optional(),
});

export const checkSubdomainAvailabilitySchema = z.object({
  subdomain: z.string().min(3).max(50).regex(subdomainRegex),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteCustomizationInput = z.infer<typeof updateSiteCustomizationSchema>;