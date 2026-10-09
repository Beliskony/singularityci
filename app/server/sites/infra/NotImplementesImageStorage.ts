// ============ sites/infra/NotImplementedImageStorage.ts ============
// Placeholder volontaire : le choix du provider de stockage (Cloudinary, S3...)
// a été mis de côté ("plutard") plus tôt dans le projet. Ce stub permet de
// câbler site.container.ts dès maintenant sans bloquer dessus — il échoue
// bruyamment si jamais une suppression d'image est déclenchée avant que
// le vrai provider soit branché, plutôt que d'échouer silencieusement.

export class NotImplementedImageStorage {
  async delete(url: string): Promise<void> {
    throw new Error(
      `ImageStorage non implémenté — impossible de supprimer "${url}". Choisis un provider (Cloudinary, S3...) et remplace NotImplementedImageStorage dans site.container.ts.`
    );
  }
}