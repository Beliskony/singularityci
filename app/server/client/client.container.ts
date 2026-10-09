// ============ server/client/client.container.ts ============
import { ClientService } from "./Client.service";
import { ClientRepositoryImpl } from "./Client.repository";
import { SiteRepositoryImpl } from "../sites/Site.repository";
import { RsvpRepositoryImpl } from "../rsvp/Rsvp.repository";

let instance: ClientService | null = null;

export function getClientService(): ClientService {
  if (!instance) {
    instance = new ClientService(new ClientRepositoryImpl(), new SiteRepositoryImpl(), new RsvpRepositoryImpl());
  }
  return instance;
}