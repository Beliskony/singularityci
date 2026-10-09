// ============ sites/Site.service.ts (corrigé) ============
import { ISite, ISiteImage, SiteStatus, SiteImageRole, IProgramItem } from "./ISite";
import { CreateSiteInput, UpdateSiteCustomizationInput } from "./SiteSchemaZod";
import { getTemplateFieldSchema, TemplateFieldSchema } from "@/app/frontend/types/TemplateFielSchemas";

const EXPIRATION_GRACE_DAYS = 7;

// ---- Contrats des repositories ----

interface SiteRepository {
  create(data: Partial<ISite>): Promise<ISite>;
  findById(id: string): Promise<ISite | null>;
  findBySubdomain(subdomain: string): Promise<ISite | null>;
  update(id: string, data: Partial<ISite>): Promise<ISite>;
  updateStatus(id: string, status: SiteStatus, extra?: Partial<ISite>): Promise<void>;
}

interface SiteImageRepository {
  findBySiteId(siteId: string): Promise<ISiteImage[]>;
  add(data: Partial<ISiteImage>): Promise<ISiteImage>;
  remove(imageId: string): Promise<void>;
  reorder(siteId: string, role: SiteImageRole, orderedImageIds: string[]): Promise<void>;
  deleteAllBySiteId(siteId: string): Promise<void>;
}

interface TemplateRepository {
  isActiveTemplate(templateId: string): Promise<boolean>;
  getSlugById(templateId: string): Promise<string>;
}

export interface IPublicSite {
  groomName: string;
  brideName: string;
  eventDate: Date;
  templateSlug: string;
  images: { url: string; role: SiteImageRole }[];
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
  programItems?: IProgramItem[];
  rsvpCount: number;
}

interface ImageStorage {
  delete(url: string): Promise<void>;
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

export class SiteService {
  constructor(
    private siteRepo: SiteRepository,
    private imageRepo: SiteImageRepository,
    private templateRepo: TemplateRepository,
    private imageStorage: ImageStorage
  ) {}

  // =========================================================
  // CRÉATION
  // =========================================================

  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const existing = await this.siteRepo.findBySubdomain(subdomain.toLowerCase());
    return existing === null;
  }

  async createDraftSite(clientId: string, input: CreateSiteInput): Promise<ISite> {
    const templateActive = await this.templateRepo.isActiveTemplate(input.templateId);
    if (!templateActive) throw new BusinessRuleError("TEMPLATE_NOT_AVAILABLE");

    const subdomain = input.subdomain.toLowerCase();
    const available = await this.checkSubdomainAvailability(subdomain);
    if (!available) throw new BusinessRuleError("SUBDOMAIN_ALREADY_TAKEN");

    return this.siteRepo.create({
      clientId,
      templateId: input.templateId,
      subdomain,
      groomName: input.groomName,
      brideName: input.brideName,
      eventDate: input.eventDate,
      images: [],
      status: SiteStatus.DRAFT,
      rsvpCount: 0,
    });
  }

  // =========================================================
  // PERSONNALISATION
  // =========================================================

  async updateCustomization(
    clientId: string,
    siteId: string,
    input: UpdateSiteCustomizationInput
  ): Promise<ISite> {
    const site = await this.getOwnedSite(clientId, siteId);
    this.assertEditable(site);

    if (input.eventDate && site.status === SiteStatus.ACTIVE) {
      throw new BusinessRuleError("CANNOT_CHANGE_EVENT_DATE_AFTER_PAYMENT");
    }

    const fieldSchema = await this.getFieldSchemaForSite(site);

    if (input.themeColors) {
      this.assertValidColorKeys(input.themeColors, fieldSchema);
    }
    if (input.customTexts) {
      this.assertValidTextFields(input.customTexts, fieldSchema);
    }
    if (input.programItems) {
      this.assertValidProgramItems(input.programItems, fieldSchema);
    }

    return this.siteRepo.update(siteId, {
      groomName: input.groomName ?? site.groomName,
      brideName: input.brideName ?? site.brideName,
      eventDate: input.eventDate ?? site.eventDate,
      themeColors: input.themeColors ?? site.themeColors,
      customTexts: input.customTexts ?? site.customTexts,
      programItems: input.programItems ?? site.programItems,
    });
  }

  async getCustomizationSchema(clientId: string, siteId: string): Promise<TemplateFieldSchema> {
    const site = await this.getOwnedSite(clientId, siteId);
    return this.getFieldSchemaForSite(site);
  }

  // =========================================================
  // IMAGES (par rôle : HERO / GALLERY / VENUE)
  // =========================================================

  async addImage(
    clientId: string,
    siteId: string,
    url: string,
    role: SiteImageRole
  ): Promise<ISiteImage> {
    const site = await this.getOwnedSite(clientId, siteId);
    this.assertEditable(site);

    const fieldSchema = await this.getFieldSchemaForSite(site);
    const maxForRole = fieldSchema.maxImagesByRole[role];

    const currentImages = await this.imageRepo.findBySiteId(siteId);
    const imagesOfRole = currentImages.filter((img) => img.role === role);

    if (imagesOfRole.length >= maxForRole) {
      throw new BusinessRuleError(`MAX_IMAGES_REACHED_FOR_ROLE: ${role}`);
    }

    return this.imageRepo.add({
      siteId,
      url,
      role,
      position: imagesOfRole.length,
    });
  }

async getSiteForEditing(
  clientId: string,
  siteId: string
): Promise<{ site: ISite; images: ISiteImage[]; fieldSchema: TemplateFieldSchema }> {
  const site = await this.getOwnedSite(clientId, siteId);
 
  const [images, fieldSchema] = await Promise.all([
    this.imageRepo.findBySiteId(siteId),
    this.getFieldSchemaForSite(site),
  ]);
 
  return { site, images, fieldSchema };
}

  async removeImage(clientId: string, siteId: string, imageId: string): Promise<void> {
    const site = await this.getOwnedSite(clientId, siteId);
    this.assertEditable(site);

    const images = await this.imageRepo.findBySiteId(siteId);
    const target = images.find((img) => img.id === imageId);
    if (!target) throw new NotFoundError("SITE_IMAGE");

    await this.imageStorage.delete(target.url);
    await this.imageRepo.remove(imageId);
  }

  // Le réordonnancement se fait à l'intérieur d'un seul rôle (ex: réordonner la galerie
  // ne doit jamais mélanger une photo HERO au milieu)
  async reorderImages(
    clientId: string,
    siteId: string,
    role: SiteImageRole,
    orderedImageIds: string[]
  ): Promise<void> {
    const site = await this.getOwnedSite(clientId, siteId);
    this.assertEditable(site);

    const images = await this.imageRepo.findBySiteId(siteId);
    const imagesOfRole = images.filter((img) => img.role === role);
    const validIds = new Set(imagesOfRole.map((img) => img.id));

    const sameCount = orderedImageIds.length === imagesOfRole.length;
    const allBelongToRole = orderedImageIds.every((id) => validIds.has(id));
    const noDuplicates = new Set(orderedImageIds).size === orderedImageIds.length;

    if (!sameCount || !allBelongToRole || !noDuplicates) {
      throw new BusinessRuleError("INVALID_IMAGE_ORDER");
    }

    await this.imageRepo.reorder(siteId, role, orderedImageIds);
  }

  async findPublicSiteBySubdomain(subdomain: string): Promise<IPublicSite | null> {
  const site = await this.siteRepo.findBySubdomain(subdomain.toLowerCase());

  // Un site DRAFT, PENDING_PAYMENT, EXPIRED ou ARCHIVED n'est jamais visible publiquement —
  // seul un mariage ACTIVE (payé, dans sa fenêtre de validité) doit apparaître
  if (!site || site.status !== SiteStatus.ACTIVE) return null;

  const [images, templateSlug] = await Promise.all([
    this.imageRepo.findBySiteId(site.id),
    this.templateRepo.getSlugById(site.templateId),
  ]);

  return {
    groomName: site.groomName,
    brideName: site.brideName,
    eventDate: site.eventDate,
    templateSlug,
    images: images.map((img) => ({ url: img.url, role: img.role })),
    themeColors: site.themeColors,
    customTexts: site.customTexts,
    programItems: site.programItems,
    rsvpCount: site.rsvpCount,
  };
}

  // =========================================================
  // TRANSITIONS DE STATUT
  // =========================================================

  async activateAfterPayment(siteId: string, paymentId: string): Promise<ISite> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");

    if (site.status === SiteStatus.ACTIVE) return site;
    if (site.status !== SiteStatus.DRAFT && site.status !== SiteStatus.PENDING_PAYMENT) {
      throw new BusinessRuleError("SITE_NOT_PAYABLE_IN_CURRENT_STATUS");
    }

    const now = new Date();
    return this.siteRepo.update(siteId, {
      status: SiteStatus.ACTIVE,
      purchasedAt: now,
      expiresAt: site.eventDate,
      lastPaymentId: paymentId,
    });
  }

  async expireSite(siteId: string): Promise<void> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.status !== SiteStatus.ACTIVE) return;

    await this.siteRepo.updateStatus(siteId, SiteStatus.EXPIRED);
  }

  async archiveSite(siteId: string): Promise<void> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.status !== SiteStatus.EXPIRED) {
      throw new BusinessRuleError("SITE_MUST_BE_EXPIRED_BEFORE_ARCHIVING");
    }

    const images = await this.imageRepo.findBySiteId(siteId);
    await Promise.all(images.map((img) => this.imageStorage.delete(img.url)));
    await this.imageRepo.deleteAllBySiteId(siteId);

    await this.siteRepo.updateStatus(siteId, SiteStatus.ARCHIVED, {
      archivedAt: new Date(),
    });
  }

  async deactivateAfterRefund(siteId: string): Promise<ISite> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.status !== SiteStatus.ACTIVE) return site;

    return this.siteRepo.update(siteId, {
      status: SiteStatus.EXPIRED,
      expiresAt: new Date(),
    });
  }

  // =========================================================
  // HELPERS PRIVÉS
  // =========================================================

  private async getOwnedSite(clientId: string, siteId: string): Promise<ISite> {
    const site = await this.siteRepo.findById(siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.clientId !== clientId) throw new OwnershipError();
    return site;
  }

  private assertEditable(site: ISite): void {
    if (site.status === SiteStatus.EXPIRED || site.status === SiteStatus.ARCHIVED) {
      throw new BusinessRuleError("SITE_NOT_EDITABLE_IN_CURRENT_STATUS");
    }
  }

  private async getFieldSchemaForSite(site: ISite): Promise<TemplateFieldSchema> {
    const slug = await this.templateRepo.getSlugById(site.templateId);
    return getTemplateFieldSchema(slug);
  }

  private assertValidColorKeys(themeColors: Record<string, string>, schema: TemplateFieldSchema): void {
    const allowedKeys = new Set(schema.colorFields.map((f) => f.key));
    for (const key of Object.keys(themeColors)) {
      if (!allowedKeys.has(key)) throw new BusinessRuleError(`UNKNOWN_COLOR_FIELD: ${key}`);
    }
  }

  private assertValidTextFields(customTexts: Record<string, string>, schema: TemplateFieldSchema): void {
    const fieldsByKey = new Map(schema.textFields.map((f) => [f.key, f]));
    for (const [key, value] of Object.entries(customTexts)) {
      const field = fieldsByKey.get(key);
      if (!field) throw new BusinessRuleError(`UNKNOWN_TEXT_FIELD: ${key}`);
      if (value.length > field.maxLength) throw new BusinessRuleError(`TEXT_FIELD_TOO_LONG: ${key}`);
    }
  }

  private assertValidProgramItems(
    programItems: { time: string; label: string }[],
    schema: TemplateFieldSchema
  ): void {
    const max = schema.maxProgramItems ?? 0;
    if (max === 0) throw new BusinessRuleError("PROGRAM_ITEMS_NOT_SUPPORTED_BY_TEMPLATE");
    if (programItems.length > max) throw new BusinessRuleError("TOO_MANY_PROGRAM_ITEMS");
  }
}