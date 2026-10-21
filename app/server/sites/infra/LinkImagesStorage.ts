// ============ sites/infra/LinkImageStorage.ts ============
// Tant que l'import de fichiers n'est pas branché (Cloudinary, S3…), les photos des clients
// sont des liens https:// : rien n'est stocké chez nous, donc il n'y a rien à supprimer.
// À remplacer par le vrai provider le jour où l'import depuis l'appareil arrive.
export class LinkImageStorage {
  async delete(_url: string): Promise<void> {
    /* lien externe : aucune ressource à libérer */
  }
}