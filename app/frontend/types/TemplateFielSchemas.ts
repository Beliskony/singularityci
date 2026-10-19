// ============ shared/templateFieldSchemas.ts (pur, sans React — importable back ET front) ============

import { SiteImageRole } from "@/app/server/sites/ISite";

export interface TemplateColorField {
  key: string;
  label: string;
  defaultValue: string;
}

export interface TemplateTextField {
  key: string;
  label: string;
  defaultValue: string;
  kind?: "text" | "image"
  maxLength: number;
}

export interface TemplateFieldSchema {
  colorFields: TemplateColorField[];
  textFields: TemplateTextField[];
  maxImagesByRole: Record<"HERO" | "GALLERY" | "VENUE", number>;
  maxProgramItems?: number;
}

export interface TemplateColorField {
  key: string;
  label: string;
  defaultValue: string;
}

export interface TemplateStyleOption {
  value: string;
  label: string;
}

export interface TemplateStyleField {
  key: string;
  label: string;
  options: TemplateStyleOption[];
  defaultValue: string;
}

export interface TemplateFieldSchema {
  colorFields: TemplateColorField[];
  textFields: TemplateTextField[];
  styleFields?: TemplateStyleField[]; // nouveau
  maxImagesByRole: Record<"HERO" | "GALLERY" | "VENUE", number>;
  maxProgramItems?: number;
}

export const TEMPLATE_FIELD_SCHEMAS: Record<string, TemplateFieldSchema> = {
  classic: {
    colorFields: [
      { key: "primary", label: "Couleur principale", defaultValue: "#C9A227" },
      { key: "background", label: "Fond", defaultValue: "#FFF8E7" },
    ],
    textFields: [
      { key: "welcomeMessage", label: "Message d'accueil", defaultValue: "Nous nous marions !", maxLength: 150 },
      { key: "venue", label: "Lieu de l'événement", defaultValue: "", maxLength: 100 },
      { key: "rsvpDeadline", label: "Date limite de réponse", defaultValue: "", maxLength: 30 },
    ],
      styleFields: [
    {
      key: "fontStyle",
      label: "Style d'écriture",
      defaultValue: "script",
      options: [
        { value: "script", label: "Manuscrit élégant" },
        { value: "serif", label: "Classique sérieux" },
        { value: "modern", label: "Moderne épuré" },
      ],
    },
  ],
    maxImagesByRole: { HERO: 1, GALLERY: 5, VENUE: 3 },
    maxProgramItems: 8,
  },
};

const BOUQUETS = [
  { label: "Bouquet 1", url: "/floralTemplate/bouquet-1.png" },
  { label: "Bouquet 2", url: "/floralTemplate/bouquet-2.png" },
  { label: "Bouquet 3", url: "/floralTemplate/bouquet-3.png" },
  { label: "Bouquet 4", url: "/floralTemplate/bouquet-4.png" },
];
 
export const FLORAL_FIELD_SCHEMA = {
  colorFields: [
    { key: "primary", label: "Couleur d'accent", defaultValue: "#c9a24a" },
    { key: "heroBg", label: "Accueil — fond", defaultValue: "#4a0e1a" },
    { key: "heroEyebrowColor", label: "Accueil — « Le mariage de »", defaultValue: "#d8bd80" },
    { key: "heroNamesColor", label: "Accueil — prénoms", defaultValue: "#f4ead9" },
    { key: "heroDateColor", label: "Accueil — date", defaultValue: "#d8bd80" },
    { key: "heroVenueColor", label: "Accueil — lieu", defaultValue: "#efe0c8" },
    { key: "welcomeBg", label: "Bienvenue — fond", defaultValue: "#330a12" },
    { key: "welcomeTitleColor", label: "Bienvenue — titre", defaultValue: "#d8bd80" },
    { key: "welcomeTextColor", label: "Bienvenue — texte", defaultValue: "#f4ead9" },
    { key: "welcomeFrameColor", label: "Bienvenue — cadre", defaultValue: "#c9a24a" },
    { key: "calendarBg", label: "Calendrier — fond", defaultValue: "#4a0e1a" },
    { key: "calendarTitleColor", label: "Calendrier — titre", defaultValue: "#d8bd80" },
    { key: "calendarDayColor", label: "Calendrier — jours", defaultValue: "#f4ead9" },
    { key: "calendarActiveColor", label: "Calendrier — jour J", defaultValue: "#c9a24a" },
    { key: "programBg", label: "Programme — fond", defaultValue: "#4a0e1a" },
    { key: "programTitleColor", label: "Programme — titre", defaultValue: "#d8bd80" },
    { key: "programTimeColor", label: "Programme — heures", defaultValue: "#c9a24a" },
    { key: "programLabelColor", label: "Programme — étapes", defaultValue: "#f4ead9" },
    { key: "programLineColor", label: "Programme — ligne", defaultValue: "#c9a24a" },
    { key: "galleryBg", label: "Galerie — fond", defaultValue: "#f4ead9" },
    { key: "galleryTitleColor", label: "Galerie — titre", defaultValue: "#4a0e1a" },
    { key: "venueBg", label: "Lieu — fond", defaultValue: "#6e1b2b" },
    { key: "venueTitleColor", label: "Lieu — titre", defaultValue: "#d8bd80" },
    { key: "venueNameColor", label: "Lieu — nom", defaultValue: "#f4ead9" },
    { key: "venueTextColor", label: "Lieu — texte", defaultValue: "#efe0c8" },
    { key: "rsvpBg", label: "Confirmation — fond", defaultValue: "#330a12" },
    { key: "rsvpTitleColor", label: "Confirmation — titre", defaultValue: "#d8bd80" },
    { key: "rsvpLabelColor", label: "Confirmation — libellés", defaultValue: "#f4ead9" },
    { key: "rsvpAcceptBg", label: "Confirmation — bouton « Je viens »", defaultValue: "#c9a24a" },
    { key: "rsvpAccentColor", label: "Confirmation — accents", defaultValue: "#c9a24a" },
    { key: "footerBg", label: "Pied de page — fond", defaultValue: "#330a12" },
    { key: "footerNamesColor", label: "Pied de page — prénoms", defaultValue: "#d8bd80" },
    { key: "footerTextColor", label: "Pied de page — texte", defaultValue: "#efe0c8" },
  ],
  textFields: [
    { key: "welcomeTitle", label: "Bienvenue — titre", defaultValue: "Chers invités", maxLength: 60 },
    {
      key: "welcomeText",
      label: "Bienvenue — message",
      defaultValue:
        "C'est avec une immense joie que nous vous convions à célébrer notre union. Votre présence rendra ce jour encore plus précieux.",
      maxLength: 400,
    },
    {
      key: "venueText",
      label: "Lieu — présentation",
      defaultValue: "Le lieu où nous célébrerons notre union, entourés de ceux qui comptent.",
      maxLength: 300,
    },
    { key: "rsvpTitle", label: "Confirmation — titre", defaultValue: "Confirmez votre présence", maxLength: 60 },
    // Illustrations : valeur = URL d'image, "" = bouquet d'origine du template.
    { key: "heroBouquetUrl", label: "Accueil — illustration", defaultValue: "/floralTemplate/bouquet-1.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "programBouquetUrl", label: "Programme — illustration", defaultValue: "/floralTemplate/bouquet-2.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "rsvpBouquetUrl", label: "Confirmation — illustration", defaultValue: "/floralTemplate/bouquet-3.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "footerBouquetUrl", label: "Pied de page — illustration", defaultValue: "/floralTemplate/bouquet-4.png", maxLength: 500, kind: "image", presets: BOUQUETS },
  ],
  maxImagesByRole: {
    [SiteImageRole.HERO]: 1,
    [SiteImageRole.GALLERY]: 8,
    [SiteImageRole.VENUE]: 3,
  },
  maxProgramItems: 8,
};

export function getTemplateFieldSchema(slug: string): TemplateFieldSchema {
  const schema = TEMPLATE_FIELD_SCHEMAS[slug];
  if (!schema) throw new Error(`FIELD_SCHEMA_NOT_FOUND_FOR_SLUG: ${slug}`);
  return schema;
}