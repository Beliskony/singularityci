// ============ server/sites/site.container.ts ============
import { SiteService } from "./Site.service";

let instance: SiteService | null = null;

export function getSiteService(): SiteService {
  if (!instance) {
    throw new Error(
      "SiteService non câblé : SiteRepository, SiteImageRepository, TemplateRepository et ImageStorage manquent encore."
    );
  }
  return instance;
}