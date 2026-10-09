// ============ server/rsvp/rsvp.container.ts ============
import { RsvpService } from "./Rsvp.service";
import { RsvpRepositoryImpl } from "./Rsvp.repository";
import { SiteRepositoryImpl } from "../sites/Site.repository";

let instance: RsvpService | null = null;

export function getRsvpService(): RsvpService {
  if (!instance) {
    instance = new RsvpService(new RsvpRepositoryImpl(), new SiteRepositoryImpl());
  }
  return instance;
}