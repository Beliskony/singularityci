// ============ shared/templateFieldSchemas.ts (pur, sans React — importable back ET front) ============

export interface TemplateColorField {
  key: string;
  label: string;
  defaultValue: string;
}

export interface TemplateTextField {
  key: string;
  label: string;
  defaultValue: string;
  maxLength: number;
}

export interface TemplateFieldSchema {
  colorFields: TemplateColorField[];
  textFields: TemplateTextField[];
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
    maxImagesByRole: { HERO: 1, GALLERY: 5, VENUE: 3 },
    maxProgramItems: 8,
  },
};

export function getTemplateFieldSchema(slug: string): TemplateFieldSchema {
  const schema = TEMPLATE_FIELD_SCHEMAS[slug];
  if (!schema) throw new Error(`FIELD_SCHEMA_NOT_FOUND_FOR_SLUG: ${slug}`);
  return schema;
}