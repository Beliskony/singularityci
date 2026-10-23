// ============ server/sites/site.container.ts ============
import { SiteService } from "./Site.service";
import { SiteRepositoryImpl, SiteImageRepositoryImpl } from "./Site.repository";
import { TemplateRepositoryImpl } from "../templates/Template.repository";
import { DbImageStorage } from "./infra/DbImageStorage";

let instance: SiteService | null = null;

export function getSiteService(): SiteService {
  if (!instance) {
    instance = new SiteService(
      new SiteRepositoryImpl(),
      new SiteImageRepositoryImpl(),
      new TemplateRepositoryImpl(),
      new DbImageStorage()
    );
  }
  return instance;
}