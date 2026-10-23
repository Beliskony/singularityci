// ============ TemplateClassic/classicConfig.ts ============
// Résout, pour le rendu, toutes les valeurs personnalisables de Classic : couleur client si
// elle existe, sinon valeur d'origine du schéma. Le schéma (TemplateFielSchemas.ts) reste la
// source unique : ajouter un champ là-bas suffit à le rendre disponible ici.
import { CLASSIC_FIELD_SCHEMA } from "@/app/frontend/types/TemplateFielSchemas";

export type ClassicTexts = Record<string, string>; // textes simples
export type ClassicImages = Record<string, string>; // URLs d'illustrations

export function resolveClassic(
  themeColors?: Record<string, string>,
  customTexts?: Record<string, string>
) {
  const cssVars: Record<string, string> = {};
  for (const f of CLASSIC_FIELD_SCHEMA.colorFields) {
    cssVars[`--c-${f.key}`] = themeColors?.[f.key] || f.defaultValue;
  }

  const texts: ClassicTexts = {};
  const imgs: ClassicImages = {};
  for (const f of CLASSIC_FIELD_SCHEMA.textFields) {
    const v = customTexts?.[f.key]?.trim();
    if (f.kind === "image") imgs[f.key] = v || f.defaultValue;
    else texts[f.key] = v || f.defaultValue;
  }

  return { cssVars, texts, imgs };
}