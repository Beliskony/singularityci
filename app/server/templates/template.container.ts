// ============ server/templates/template.container.ts ============
import { TemplateService } from "./Template.service";
import { TemplateRepositoryImpl } from "./Template.repository";

let instance: TemplateService | null = null;

export function getTemplateService(): TemplateService {
  if (!instance) {
    instance = new TemplateService(
      new TemplateRepositoryImpl()
    )
  }
  return instance;
}