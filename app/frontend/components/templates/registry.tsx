// ============ frontend/components/templates/registry.tsx ============
import { ComponentType } from "react";
import type { StaticImageData } from "next/image";
import TemplateClassic from "./TemplateClassic/Index";
import TemplateClassicCover from "./TemplateClassic/cover.png";
import { classicDemoProps } from "./TemplateClassic/DemoProps";

import TemplateEclat from "./TemplateEclat/index";
import TemplateEclatCover from "./TemplateEclat/cover.png";
import { eclatDemoProps } from "./TemplateEclat/demoProps";
import TemplateFloral from "./TemplateFloral/index";
import TemplateFloralCover from "./TemplateFloral/cover.png";
import { floralDemoProps } from "./TemplateFloral/demoProps";
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
  venueName?: string;
  venueBg?: string;
  themeColors?: Record<string, string>;
  styleOptions?: Record<string, string>;
  customTexts?: Record<string, string>;
  programItems?: IProgramItem[];
  rsvpCount: number;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
}

// Les données de démo n'ont jamais de onSubmitRsvp : c'est un closure
// client, construit à la volée dans TemplatePreviewClient.
export type TemplateDemoProps = Omit<TemplateRenderProps, "onSubmitRsvp">;

interface TemplateRegistryEntry {
  component: ComponentType<TemplateRenderProps>;
  cover: StaticImageData;
  demoProps: TemplateDemoProps;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateRegistryEntry> = {
  classic: {
    component: TemplateClassic,
    cover: TemplateClassicCover,
    demoProps: classicDemoProps,
  },
  eclat: {
    component: TemplateEclat,
    cover: TemplateEclatCover,
    demoProps: eclatDemoProps,
  },
  floral: {
    component: TemplateFloral,
    cover: TemplateFloralCover,
    demoProps: floralDemoProps,
  },
};

export function getTemplateComponent(slug: string) {
  const entry = TEMPLATE_REGISTRY[slug];
  if (!entry) throw new Error(`Template inconnu: ${slug}`);
  return entry.component;
}

export function getTemplateCover(slug: string): StaticImageData | null {
  return TEMPLATE_REGISTRY[slug]?.cover ?? null;
}

export function getTemplateDemoProps(slug: string): TemplateDemoProps | null {
  return TEMPLATE_REGISTRY[slug]?.demoProps ?? null;
}