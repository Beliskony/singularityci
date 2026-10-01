// ============ server/client/client.container.ts ============
import { ClientService } from "./Client.service";

let instance: ClientService | null = null;

export function getClientService(): ClientService {
  if (!instance) {
    throw new Error(
      "ClientService non câblé : ClientRepository, SiteRepository et RsvpRepository manquent encore."
    );
  }
  return instance;
}