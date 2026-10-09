// ============ frontend/components/templates/registry.tsx ============
import { ComponentType } from "react";
import type { StaticImageData } from "next/image";
import TemplateClassic from "./TemplateClassic/Index";
import TemplateClassicCover from "./TemplateClassic/cover.png";
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

interface TemplateRegistryEntry {
  component: ComponentType<TemplateRenderProps>;
  cover: StaticImageData; // import statique Next : largeur/hauteur connues, optimisation automatique
}

export const TEMPLATE_REGISTRY: Record<string, TemplateRegistryEntry> = {
  classic: { component: TemplateClassic, cover: TemplateClassicCover },
};

export function getTemplateComponent(slug: string) {
  const entry = TEMPLATE_REGISTRY[slug];
  if (!entry) throw new Error(`Template inconnu: ${slug}`);
  return entry.component;
}

export function getTemplateCover(slug: string): StaticImageData | null {
  return TEMPLATE_REGISTRY[slug]?.cover ?? null;
}