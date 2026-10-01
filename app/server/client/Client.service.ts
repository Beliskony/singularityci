// ============ client/Client.service.ts ============
import bcrypt from "bcrypt";
import { IClient, ISiteRsvpSummary } from "./IClient";
import { ISite, SiteStatus } from "../sites/ISite";

// ---- Contrats des repositories ----

interface ClientRepository {
  findById(id: string): Promise<IClient | null>;
  findByPhone(phone: string): Promise<IClient | null>;
  updateProfile(id: string, data: Partial<Pick<IClient, "fullName" | "phone">>): Promise<IClient>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}

interface SiteRepository {
  findByClientId(clientId: string): Promise<ISite[]>;
  findById(id: string): Promise<ISite | null>;
  countByClientAndStatus(clientId: string, statuses: SiteStatus[]): Promise<number>;
}

interface RsvpRepository {
  getSummaryBySite(siteId: string): Promise<ISiteRsvpSummary>;
}

// ---- Erreurs métier typées ----

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`NOT_FOUND: ${entity}`);
    this.name = "NotFoundError";
  }
}

export class OwnershipError extends Error {
  constructor() {
    super("FORBIDDEN: resource does not belong to this client");
    this.name = "OwnershipError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class ClientService {
  constructor(
    private clientRepo: ClientRepository,
    private siteRepo: SiteRepository,
    private rsvpRepo: RsvpRepository
  ) {}

  // =========================================================
  // PROFIL
  // =========================================================

  async getProfile(clientId: string): Promise<IClient> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) throw new NotFoundError("CLIENT");
    return client;
  }

  async updateProfile(
    clientId: string,
    data: Partial<Pick<IClient, "fullName" | "phone">>
  ): Promise<IClient> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) throw new NotFoundError("CLIENT");

    if (data.phone && data.phone !== client.phone) {
      const existing = await this.clientRepo.findByPhone(data.phone);
      if (existing) throw new BusinessRuleError("PHONE_ALREADY_USED");
    }

    return this.clientRepo.updateProfile(clientId, data);
  }

  async changePassword(
    clientId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) throw new NotFoundError("CLIENT");

    const valid = await bcrypt.compare(currentPassword, client.passwordHash || "");
    if (!valid) throw new BusinessRuleError("CURRENT_PASSWORD_INVALID");

    const sameAsBefore = await bcrypt.compare(newPassword, client.passwordHash || "");
    if (sameAsBefore) throw new BusinessRuleError("NEW_PASSWORD_MUST_DIFFER");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.clientRepo.updatePasswordHash(clientId, passwordHash);
  }

  async requestAccountDeletion(clientId: string): Promise<void> {
    const activeSitesCount = await this.siteRepo.countByClientAndStatus(clientId, [
      SiteStatus.ACTIVE,
      SiteStatus.PENDING_PAYMENT,
    ]);

    if (activeSitesCount > 0) {
      throw new BusinessRuleError("CANNOT_DELETE_ACCOUNT_WITH_ACTIVE_SITES");
    }

    await this.clientRepo.softDelete(clientId);
  }

  // =========================================================
  // SITES DU CLIENT (lecture + vérification d'ownership)
  // =========================================================

  async listMySites(clientId: string): Promise<ISite[]> {
    return this.siteRepo.findByClientId(clientId);
  }

  async getMySite(clientId: string, siteId: string): Promise<ISite> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");

    this.assertOwnership(clientId, site);
    return site;
  }

  // =========================================================
  // RÉSUMÉ RSVP D'UN SITE (formulaires soumis / présents / absents)
  // =========================================================

  async getSiteRsvpSummary(clientId: string, siteId: string): Promise<ISiteRsvpSummary> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");

    this.assertOwnership(clientId, site);

    return this.rsvpRepo.getSummaryBySite(siteId);
  }

  // =========================================================
  // HELPERS PRIVÉS
  // =========================================================

  private assertOwnership(clientId: string, site: ISite): void {
    if (site.clientId !== clientId) {
      throw new OwnershipError();
    }
  }
}