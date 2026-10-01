// ============ templates/ITemplate.ts ============

export interface ITemplate {
  id: string;
  name: string;        // ex: "Classic", "Floral"
  slug: string;         // ex: "classic", "floral" — correspond au dossier frontend/components/templates/Template<X>
  description?: string;
  price: number;        // en XOF
  previewImages: string[];
  isActive: boolean;     // un template désactivé n'apparaît plus au catalogue, mais reste utilisable par ceux qui l'ont déjà acheté
  createdAt: Date;
  updatedAt: Date;
}