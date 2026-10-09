// ============ templates/Template.repository.ts ============
import { randomUUID } from "crypto";
import { db } from "../config/Connection";
import { ITemplate } from "./ITemplate";

function mapRowToTemplate(row: any): ITemplate {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    price: row.price,
    previewImages: JSON.parse(row.preview_images ?? "[]"),
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TemplateRepositoryImpl {
  async create(data: Partial<ITemplate>): Promise<ITemplate> {
    const id = randomUUID();

    await db
      .insertInto("templates")
      .values({
        id,
        name: data.name!,
        slug: data.slug!,
        description: data.description ?? null,
        price: data.price!,
        preview_images: JSON.stringify(data.previewImages ?? []),
        is_active: data.isActive ?? true,
      })
      .execute();

    const created = await this.findById(id);
    if (!created) throw new Error("TEMPLATE_CREATION_FAILED");
    return created;
  }

  async findById(id: string): Promise<ITemplate | null> {
    const row = await db.selectFrom("templates").selectAll().where("id", "=", id).executeTakeFirst();
    return row ? mapRowToTemplate(row) : null;
  }

  async findBySlug(slug: string): Promise<ITemplate | null> {
    const row = await db.selectFrom("templates").selectAll().where("slug", "=", slug).executeTakeFirst();
    return row ? mapRowToTemplate(row) : null;
  }

  async listActive(): Promise<ITemplate[]> {
    const rows = await db.selectFrom("templates").selectAll().where("is_active", "=", true).execute();
    return rows.map(mapRowToTemplate);
  }

  async update(id: string, data: Partial<ITemplate>): Promise<ITemplate> {
    await db
      .updateTable("templates")
      .set({
        name: data.name,
        description: data.description,
        price: data.price,
        preview_images: data.previewImages ? JSON.stringify(data.previewImages) : undefined,
      })
      .where("id", "=", id)
      .execute();

    const updated = await this.findById(id);
    if (!updated) throw new Error("TEMPLATE_NOT_FOUND_AFTER_UPDATE");
    return updated;
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await db.updateTable("templates").set({ is_active: isActive }).where("id", "=", id).execute();
  }

  async isActiveTemplate(templateId: string): Promise<boolean> {
    const template = await this.findById(templateId);
    return template !== null && template.isActive;
  }

  async getSlugById(templateId: string): Promise<string> {
    const template = await this.findById(templateId);
    if (!template) throw new Error(`TEMPLATE_NOT_FOUND: ${templateId}`);
    return template.slug;
  }

  async getPrice(templateId: string): Promise<number | null> {
    const template = await this.findById(templateId);
    if (!template || !template.isActive) return null;
    return template.price;
  }
}