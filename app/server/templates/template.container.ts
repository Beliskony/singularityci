// ============ server/templates/template.container.ts ============
import { TemplateService } from "./Template.service";

let instance: TemplateService | null = null;

export function getTemplateService(): TemplateService {
  if (!instance) {
    throw new Error("TemplateService non câblé : TemplateRepository manque encore.");
  }
  return instance;
}