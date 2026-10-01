// ============ rsvp/Rsvp.service.ts ============
import { IRsvp, RsvpStatus } from "./IRsvp";
import { SubmitRsvpInput } from "./RsvpSchemaZod";
import { SiteStatus } from "../sites/ISite";
import { ISiteRsvpSummary } from "../client/IClient";

// ---- Contrats des repositories ----

interface RsvpRepository {
  findBySiteId(siteId: string): Promise<IRsvp[]>;
  findExisting(siteId: string, guestPhone?: string, guestEmail?: string): Promise<IRsvp | null>;
  create(data: Partial<IRsvp>): Promise<IRsvp>;
  update(id: string, data: Partial<IRsvp>): Promise<IRsvp>;
}

interface SiteReadRepository {
  findById(siteId: string): Promise<{ id: string; status: SiteStatus } | null>;
  incrementRsvpCount(siteId: string, delta: number): Promise<void>;
}

// ---- Erreurs métier typées ----

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`NOT_FOUND: ${entity}`);
    this.name = "NotFoundError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class RsvpService {
  constructor(
    private rsvpRepo: RsvpRepository,
    private siteRepo: SiteReadRepository
  ) {}

  // =========================================================
  // SOUMISSION (publique, pas d'auth — n'importe quel invité avec le lien)
  // =========================================================

  async submitRsvp(input: SubmitRsvpInput): Promise<IRsvp> {
    const site = await this.siteRepo.findById(input.siteId);
    if (!site) throw new NotFoundError("SITE");

    if (site.status !== SiteStatus.ACTIVE) {
      throw new BusinessRuleError("SITE_NOT_ACCEPTING_RSVP");
    }

    // Upsert : un invité qui a déjà répondu peut mettre à jour sa réponse
    // (identifié par téléphone ou email, selon ce qu'il a fourni)
    const existing = await this.rsvpRepo.findExisting(
      input.siteId,
      input.guestPhone,
      input.guestEmail
    );

    if (existing) {
      return this.updateExistingRsvp(existing, input);
    }

    const created = await this.rsvpRepo.create({
      siteId: input.siteId,
      guestName: input.guestName,
      guestPhone: input.guestPhone,
      guestEmail: input.guestEmail,
      numberOfGuests: input.numberOfGuests,
      status: input.status as RsvpStatus,
      message: input.message,
      respondedAt: new Date(),
    });

    // Compteur dénormalisé sur ISite : c'est LE chiffre affiché publiquement en bas de page
    await this.siteRepo.incrementRsvpCount(input.siteId, 1);

    return created;
  }

  private async updateExistingRsvp(existing: IRsvp, input: SubmitRsvpInput): Promise<IRsvp> {
    // Le compteur public compte les FORMULAIRES, pas les personnes : une mise à jour
    // ne touche pas incrementRsvpCount, seule une nouvelle soumission l'incrémente
    return this.rsvpRepo.update(existing.id, {
      guestName: input.guestName,
      numberOfGuests: input.numberOfGuests,
      status: input.status as RsvpStatus,
      message: input.message,
      respondedAt: new Date(),
    });
  }

  // =========================================================
  // RÉSUMÉ (consommé par Client.service.ts, ownership déjà vérifiée en amont)
  // =========================================================

  async getSummaryBySite(siteId: string): Promise<ISiteRsvpSummary> {
    const responses = await this.rsvpRepo.findBySiteId(siteId);

    let confirmedGuestsCount = 0;
    let absentGuestsCount = 0;

    for (const r of responses) {
      if (r.status === RsvpStatus.ATTENDING) {
        confirmedGuestsCount += r.numberOfGuests;
      } else if (r.status === RsvpStatus.NOT_ATTENDING) {
        absentGuestsCount += r.numberOfGuests;
      }
    }

    return {
      submissionsCount: responses.length,
      confirmedGuestsCount,
      absentGuestsCount,
    };
  }
}