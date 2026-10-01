// ============ templates/Template.service.ts ============
import { ITemplate } from "./ITemplate";
import { CreateTemplateInput, UpdateTemplateInput } from "./TemplateSchemaZod";
import { IAdminAuthPayload, AdminRole, AdminPermission } from "../admin/IAdmin";

// ---- Contrats des repositories ----

interface TemplateRepository {
  create(data: Partial<ITemplate>): Promise<ITemplate>;
  findById(id: string): Promise<ITemplate | null>;
  findBySlug(slug: string): Promise<ITemplate | null>;
  listActive(): Promise<ITemplate[]>;
  update(id: string, data: Partial<ITemplate>): Promise<ITemplate>;
  setActive(id: string, isActive: boolean): Promise<void>;
}

// ---- Erreurs métier typées ----

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`NOT_FOUND: ${entity}`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(permission: string) {
    super(`FORBIDDEN: missing permission ${permission}`);
    this.name = "ForbiddenError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class TemplateService {
  constructor(private templateRepo: TemplateRepository) {}

  // =========================================================
  // CATALOGUE (public, consommé par le site vitrine + Payment.service)
  // =========================================================

  async listActiveTemplates(): Promise<ITemplate[]> {
    return this.templateRepo.listActive();
  }

  async getPrice(templateId: string): Promise<number | null> {
    const template = await this.templateRepo.findById(templateId);
    if (!template || !template.isActive) return null;
    return template.price;
  }

  async isActiveTemplate(templateId: string): Promise<boolean> {
    const template = await this.templateRepo.findById(templateId);
    return template !== null && template.isActive;
  }

  // =========================================================
  // GESTION (admin, permission MANAGE_TEMPLATES)
  // =========================================================

  async createTemplate(caller: IAdminAuthPayload, input: CreateTemplateInput): Promise<ITemplate> {
    this.assertPermission(caller, AdminPermission.MANAGE_TEMPLATES);

    const existing = await this.templateRepo.findBySlug(input.slug);
    if (existing) throw new BusinessRuleError("SLUG_ALREADY_USED");

    return this.templateRepo.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      previewImages: input.previewImages,
      isActive: true,
    });
  }

  async updateTemplate(
    caller: IAdminAuthPayload,
    templateId: string,
    input: UpdateTemplateInput
  ): Promise<ITemplate> {
    this.assertPermission(caller, AdminPermission.MANAGE_TEMPLATES);

    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("TEMPLATE");

    return this.templateRepo.update(templateId, input);
  }

  async deactivateTemplate(caller: IAdminAuthPayload, templateId: string): Promise<void> {
    this.assertPermission(caller, AdminPermission.MANAGE_TEMPLATES);

    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("TEMPLATE");

    // Désactiver retire juste du catalogue — les sites déjà achetés sur ce template
    // continuent de fonctionner normalement (Site.service ne vérifie isActiveTemplate
    // qu'à la création, pas à chaque lecture)
    await this.templateRepo.setActive(templateId, false);
  }

  async activateTemplate(caller: IAdminAuthPayload, templateId: string): Promise<void> {
    this.assertPermission(caller, AdminPermission.MANAGE_TEMPLATES);

    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("TEMPLATE");

    await this.templateRepo.setActive(templateId, true);
  }

  // =========================================================
  // HELPER PRIVÉ
  // =========================================================

  private assertPermission(caller: IAdminAuthPayload, permission: AdminPermission): void {
    if (caller.role === AdminRole.SUPER_ADMIN) return;
    if (!caller.permissions.includes(permission)) {
      throw new ForbiddenError(permission);
    }
  }
}