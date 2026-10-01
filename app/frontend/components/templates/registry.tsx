// ============ frontend/components/templates/registry.tsx ============
import { ComponentType } from "react";
import TemplateClassic from "../templates/TemplateClassic/Index";
import type { SubmitRsvpInput } from "@/app/server/rsvp/RsvpSchemaZod";
import type { IProgramItem } from "@/app/server/sites/ISite";

export type RsvpFormData = Omit<SubmitRsvpInput, "siteId">;

export interface TemplateRenderProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  heroImage?: string;
  galleryImages: string[];
  venueImages: string[];
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
  programItems?: IProgramItem[];
  rsvpCount: number;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
}

export const TEMPLATE_COMPONENTS: Record<string, ComponentType<TemplateRenderProps>> = {
  classic: TemplateClassic,
};

export function getTemplateComponent(slug: string) {
  const Component = TEMPLATE_COMPONENTS[slug];
  if (!Component) throw new Error(`Template inconnu: ${slug}`);
  return Component;
}