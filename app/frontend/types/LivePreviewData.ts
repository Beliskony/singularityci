// ============ app/frontend/types/LivePreviewData.ts ============
// Données envoyées par le studio à l'iframe d'aperçu (postMessage).
export interface LivePreviewData {
  groomName: string;
  brideName: string;
  eventDate: string; // ISO
  themeColors: Record<string, string>;
  customTexts: Record<string, string>;
  programItems: { time: string; label: string }[];
  heroImage?: string;
  galleryImages: string[];
  venueImages: string[];
}