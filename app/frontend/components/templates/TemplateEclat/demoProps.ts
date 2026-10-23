import type { TemplateDemoProps } from "../registry";

export const eclatDemoProps: TemplateDemoProps = {
  groomName: "Jean-Marc",
  brideName: "Aïcha",
  eventDate: new Date("2026-12-12"),
  heroImage: "/eclatTemplate/couple.jpg",
  galleryImages: ["/eclatTemplate/gallery-1.jpg", "/eclatTemplate/gallery-2.jpg", "/eclatTemplate/gallery-3.jpg"],
  venueImages: ["/eclatTemplate/venue.jpg"],
  venueName: "Jardin Botanique d'Abidjan",
  themeColors: { 
    primary: "#B8935A",
    textOnLight: "#2B2420",
    textOnDark: "#F5F0E6",
    venueBg: "#F0E8D8",       // test: fond différent pour la section lieu
    rsvpAcceptBg: "#6B8F71",
  },
  customTexts: {
    heroTitle: "Notre commencement",
    welcomeEyebrow: "Un nouveau départ",
    welcomeTitle: "Bienvenue dans notre histoire",
    welcomeMessage:
      "Nous avons choisi de nous dire oui entourés de ceux qui comptent le plus. Votre présence est le plus beau des cadeaux - venez célébrer avec nous.",
    quote: "Deux chemins qui se rencontrent, un seul qui continue.",
    storyEyebrow: "Comment tout a commencé",
    storyTitle: "Le chapitre doré",
    storyBody:
      "D'une rencontre inattendue à Abidjan à une demande au coucher du soleil, voici un aperçu de notre histoire.",
    chapterLabel: "Chapitre 01",
    chapterTitle: "Entre les pages",
    storyExcerpt:
      "C'était un mardi tranquille dans une librairie du Plateau. L'un cherchait un livre, l'autre un signe…",
    invitationBody:
      "Nous serions honorés de votre présence à nos côtés pour échanger nos vœux et célébrer le début de notre nouvelle vie ensemble.",
    programTitle: "Détails de la soirée",
    venueAddress: "Cocody, Abidjan, Côte d'Ivoire",
    rsvpDeadline: "Merci de répondre avant le 20 novembre 2026.",
  },
  programItems: [
    { time: "14h00", label: "Cérémonie civile" },
    { time: "16h00", label: "Cocktail au jardin" },
    { time: "19h00", label: "Dîner" },
    { time: "21h30", label: "Soirée dansante" },
  ],
  rsvpCount: 94,
};