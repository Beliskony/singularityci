// ============ TemplateClassic/demoProps.ts ============
import type { TemplateRenderProps } from "../registry";

// Toutes les données de démo pour l'aperçu /apercu/classic.
// Pas de onSubmitRsvp ici : c'est un closure client, construit dans TemplatePreviewClient.
export const classicDemoProps: Omit<TemplateRenderProps, "onSubmitRsvp"> = {
  groomName: "Jean-Marc",
  brideName: "Aïcha",
  eventDate: new Date("2026-12-12"),

  heroImage: "/classiqueTemplate/couple.jpg",
  galleryImages: [
    "/classiqueTemplate/fullSlides/slide-1.jpg",
    "/classiqueTemplate/fullSlides/slide-2.jpg",
    "/classiqueTemplate/fullSlides/slide-3.jpg",
    "/classiqueTemplate/fullSlides/slide-4.jpg",
  ],
  venueImages: [
    "/classiqueTemplate/espaceSlides/venue-1.jpg",
    "/classiqueTemplate/espaceSlides/venue-2.jpg",
    "/classiqueTemplate/espaceSlides/venue-3.jpg",
  ],
  venueName: "Jardin Botanique d'Abidjan",

  themeColors: {
    primary: "#E35336", // terracotta, cohérent avec DEFAULT_PRIMARY dans index.tsx
    background: "#FFF8E7",
  },
  styleOptions: {
    fontStyle: "script",
  },

  customTexts: {
    welcomeMessage:
      "Nous vous invitons à partager ce moment unique de notre vie, et à célébrer avec nous le début de notre éternité.",
  },

  programItems: [
    { time: "14h00", label: "Cérémonie civile" },
    { time: "16h00", label: "Cocktail" },
    { time: "19h00", label: "Dîner & soirée dansante" },
  ],

  rsvpCount: 128,
};