// ============ sites/infra/DbImageStorage.ts ============
// Les photos des clients sont stockées dans la table image_files. Les URLs de la forme
// /api/images/<uuid> sont les nôtres : delete() retire le fichier. Toute autre URL
// (image d'origine d'un template dans /public…) n'est pas à nous : rien à supprimer.
import { ImageFileRepository, imageFileIdFromUrl } from "./ImageFile.repository";

export class DbImageStorage {
  constructor(private files = new ImageFileRepository()) {}

  async delete(url: string): Promise<void> {
    const id = imageFileIdFromUrl(url);
    if (id) await this.files.delete(id);
  }
}