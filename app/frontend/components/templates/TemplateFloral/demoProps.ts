// Données de démonstration pour /apercu/floral - même convention que
// TemplateClassic/demoProps.ts et TemplateEclat/demoProps.ts.

export const floralDemoProps = {
  groomName: "Yacouba",
  brideName: "Awa",
  eventDate: new Date("2026-12-12T14:00:00"),
  heroImage: undefined,
  galleryImages: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
  venueImages: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
  ],
  venueName: "Domaine des Palmiers, Abidjan",
  themeColors: {
    // Les 3 clés de base - fallback automatique du template si absentes.
    primary: "#c9a24a",
    textOnLight: "#4a0e1a",
    textOnDark: "#f4ead9",
  },
  customTexts: {
    welcomeTitle: "Chers invités",
    welcomeText:
      "C'est avec une immense joie que nous vous convions à célébrer notre union. Votre présence rendra ce jour encore plus précieux.",
    dressCodeTitle: "Code vestimentaire",
    dressCodeText:
      "Nous vous invitons à vous parer des couleurs de notre mariage pour cette journée exceptionnelle.",
    venueText: "Le lieu où nous célébrerons notre union, entourés de ceux qui comptent.",
    rsvpTitle: "Confirmez votre présence",
    // Chaque section retombe sur /floralTemplate/bouquet-default.png si ces
    // clés sont absentes - on les précise ici juste pour l'aperçu démo,
    // mais ce ne sont pas obligatoires pour qu'un vrai site s'affiche.
    heroBouquetUrl: "/floralTemplate/bouquet-default.png",
    programBouquetUrl: "/floralTemplate/bouquet-default.png",
    rsvpBouquetUrl: "/floralTemplate/bouquet-default.png",
    footerBouquetUrl: "/floralTemplate/bouquet-default.png",
  },
  programItems: [
    { time: "14:00", label: "Cérémonie religieuse" },
    { time: "16:00", label: "Séance photo" },
    { time: "18:30", label: "Cocktail de bienvenue" },
    { time: "20:00", label: "Dîner & soirée dansante" },
  ],
  rsvpCount: 42,
};