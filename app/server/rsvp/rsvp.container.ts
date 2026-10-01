// ============ server/rsvp/rsvp.container.ts ============
import { RsvpService } from "./Rsvp.service";

let instance: RsvpService | null = null;

export function getRsvpService(): RsvpService {
  if (!instance) {
    throw new Error("RsvpService non câblé : RsvpRepository et SiteReadRepository manquent encore.");
  }
  return instance;
}