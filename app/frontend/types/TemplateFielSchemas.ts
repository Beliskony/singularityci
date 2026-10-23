// ============ app/frontend/types/TemplateFielSchemas.ts ============
// Pur, sans React - importable côté back ET front.
// Source unique de ce que le client peut personnaliser : l'éditeur, l'aperçu, le rendu
// du template et la validation serveur (Site.service) lisent tous ce fichier.

import { SiteImageRole } from "@/app/server/sites/ISite";

export interface TemplateColorField {
  key: string;
  label: string;
  defaultValue: string;
}

export interface TemplateImagePreset {
  label: string;
  url: string;
}

export interface TemplateTextField {
  key: string;
  label: string;
  defaultValue: string;
  kind?: "text" | "image"; // "image" : la valeur est une URL (clé terminée par « Url »)
  presets?: TemplateImagePreset[]; // images proposées pour un champ « image »
  maxLength: number;
}

export interface TemplateStyleOption {
  value: string;
  label: string;
}

export interface TemplateStyleField {
  key: string;
  label: string;
  options: TemplateStyleOption[];
  defaultValue: string;
}

export interface TemplateFieldSchema {
  colorFields: TemplateColorField[];
  textFields: TemplateTextField[];
  styleFields?: TemplateStyleField[];
  maxImagesByRole: Record<"HERO" | "GALLERY" | "VENUE", number>;
  maxProgramItems?: number;
}

// ======================= CLASSIC =======================
const CLASSIC_IMAGES: TemplateImagePreset[] = [
  { label: "Fleurs / illustration 1", url: "/classiqueTemplate/1.png" },
  { label: "Fleurs sous la photo", url: "/classiqueTemplate/flowers.png" },
  { label: "Illustration calendrier", url: "/classiqueTemplate/illustration1.png" },
  { label: "Illustration lieu", url: "/classiqueTemplate/Illustration2.png" },
  { label: "Fleurs programme", url: "/classiqueTemplate/flowersProg.png" },
  { label: "Ornement gauche", url: "/classiqueTemplate/gauche.png" },
  { label: "Ornement droit", url: "/classiqueTemplate/droite.png" },
  { label: "Fleurs confirmation", url: "/classiqueTemplate/rsvp-flowers.png" },
];

export const CLASSIC_FIELD_SCHEMA: TemplateFieldSchema = {
  colorFields: [
    { key: "primary", label: "Couleur d'accent", defaultValue: "#E35336" },
    { key: "firstBg", label: "Accueil - fond", defaultValue: "#5C6E4F" },
    { key: "firstCardBg", label: "Accueil - carte centrale", defaultValue: "#FBF3E7" },
    { key: "firstNamesColor", label: "Accueil - prénoms", defaultValue: "#8B5E3C" },
    { key: "firstAmpColor", label: "Accueil - esperluette (&)", defaultValue: "#E35336" },
    { key: "firstPhotoBg", label: "Accueil - fond du cadre photo", defaultValue: "#5C6E4F" },
    { key: "secondBg", label: "Calendrier - fond", defaultValue: "#5C6E4F" },
    { key: "secondTextColor", label: "Calendrier - message d'accueil", defaultValue: "#FBF3E7" },
    { key: "secondMonthColor", label: "Calendrier - mois", defaultValue: "#FBF3E7" },
    { key: "secondWeekdayColor", label: "Calendrier - jours de la semaine", defaultValue: "#FBF3E7" },
    { key: "secondDayColor", label: "Calendrier - numéros", defaultValue: "#FBF3E7" },
    { key: "secondActiveDayColor", label: "Calendrier - jour J", defaultValue: "#FBF3E7" },
    { key: "secondHeartColor", label: "Calendrier - cœur du jour J", defaultValue: "#FFFFFF" },
    { key: "thirdBg", label: "Lieu - fond", defaultValue: "#5C6E4F" },
    { key: "thirdCardBg", label: "Lieu - carte centrale", defaultValue: "#FBF3E7" },
    { key: "thirdVenueNameColor", label: "Lieu - nom du lieu", defaultValue: "#5C6E4F" },
    { key: "thirdButtonBg", label: "Lieu - bouton itinéraire", defaultValue: "#E35336" },
    { key: "thirdButtonTextColor", label: "Lieu - texte du bouton", defaultValue: "#FBF3E7" },
    { key: "thirdArrowColor", label: "Lieu - flèches du carrousel", defaultValue: "#FFFFFF" },
    { key: "galleryBg", label: "Galerie - fond", defaultValue: "#FBF3E7" },
    { key: "galleryArrowColor", label: "Galerie - flèches", defaultValue: "#FFFFFF" },
    { key: "programBg", label: "Programme - fond", defaultValue: "#FBF3E7" },
    { key: "programTitleColor", label: "Programme - titre", defaultValue: "#5C6E4F" },
    { key: "programTimeColor", label: "Programme - heures", defaultValue: "#3B2A20" },
    { key: "programLabelColor", label: "Programme - étapes", defaultValue: "#E35336" },
    { key: "programLineColor", label: "Programme - traits de séparation", defaultValue: "#3B2A20" },
    { key: "programDiamondColor", label: "Programme - losanges", defaultValue: "#5C6E4F" },
    { key: "programCountColor", label: "Programme - compte à rebours", defaultValue: "#5C6E4F" },
    { key: "rsvpBg", label: "Confirmation - fond", defaultValue: "#FBF3E7" },
    { key: "rsvpTitleColor", label: "Confirmation - grand titre", defaultValue: "#5C6E4F" },
    { key: "rsvpSubtitleColor", label: "Confirmation - phrase d'invitation", defaultValue: "#5C6E4F" },
    { key: "rsvpLabelColor", label: "Confirmation - libellés", defaultValue: "#3B2A20" },
    { key: "rsvpFieldBg", label: "Confirmation - fond des champs", defaultValue: "#FFFFFF" },
    { key: "rsvpFieldTextColor", label: "Confirmation - texte des champs", defaultValue: "#3B2A20" },
    { key: "rsvpFieldBorderColor", label: "Confirmation - bordure des champs", defaultValue: "#5C6E4F" },
    { key: "rsvpChoiceActiveBg", label: "Confirmation - choix sélectionné", defaultValue: "#5C6E4F" },
    { key: "rsvpChoiceActiveTextColor", label: "Confirmation - texte du choix sélectionné", defaultValue: "#FBF3E7" },
    { key: "rsvpButtonBg", label: "Confirmation - bouton d'envoi", defaultValue: "#E35336" },
    { key: "rsvpButtonTextColor", label: "Confirmation - texte du bouton", defaultValue: "#FBF3E7" },
    { key: "footerBg", label: "Pied de page - fond", defaultValue: "#5C6E4F" },
    { key: "footerTaglineColor", label: "Pied de page - phrase", defaultValue: "#FBF3E7" },
    { key: "footerNamesColor", label: "Pied de page - prénoms", defaultValue: "#FBF3E7" },
    { key: "footerDateColor", label: "Pied de page - date", defaultValue: "#FBF3E7" },
    { key: "footerLineColor", label: "Pied de page - trait", defaultValue: "#FBF3E7" },
    { key: "footerCreditColor", label: "Pied de page - crédit", defaultValue: "#FBF3E7" },
  ],
  textFields: [
    { key: "venue", label: "Lieu - nom du lieu", defaultValue: "", maxLength: 100 },
    { key: "welcomeMessage", label: "Calendrier - message d'accueil", defaultValue: "Nous vous invitons à partager ce moment unique de notre vie, et à célébrer avec nous le début de notre éternité.", maxLength: 250 },
    { key: "mapButtonLabel", label: "Lieu - texte du bouton", defaultValue: "Itinéraire Google Maps", maxLength: 40 },
    { key: "programTitle", label: "Programme - titre", defaultValue: "Programme du jour !", maxLength: 50 },
    { key: "daysLeftPlural", label: "Programme - « Jours restants »", defaultValue: "Jours restants", maxLength: 25 },
    { key: "daysLeftSingular", label: "Programme - « Jour restant »", defaultValue: "Jour restant", maxLength: 25 },
    { key: "rsvpHeading", label: "Confirmation - grand titre", defaultValue: "RSVP", maxLength: 8 },
    { key: "rsvpDeadline", label: "Confirmation - date limite (ex. « avant le 26 juin »)", defaultValue: "", maxLength: 30 },
    { key: "rsvpNameLabel", label: "Confirmation - libellé du nom", defaultValue: "Nom & prénom", maxLength: 40 },
    { key: "rsvpNamePlaceholder", label: "Confirmation - exemple du nom", defaultValue: "Votre nom complet", maxLength: 40 },
    { key: "rsvpContactLabel", label: "Confirmation - libellé du contact", defaultValue: "Contact (téléphone ou email)", maxLength: 50 },
    { key: "rsvpContactPlaceholder", label: "Confirmation - exemple du contact", defaultValue: "Votre numéro ou email", maxLength: 40 },
    { key: "rsvpAttendanceLabel", label: "Confirmation - question de présence", defaultValue: "Serez-vous présent(e) ?", maxLength: 50 },
    { key: "rsvpYesLabel", label: "Confirmation - bouton « présent »", defaultValue: "J'y serai", maxLength: 25 },
    { key: "rsvpMaybeLabel", label: "Confirmation - bouton « incertain »", defaultValue: "Pas sûr(e)", maxLength: 25 },
    { key: "rsvpSubmitLabel", label: "Confirmation - bouton d'envoi", defaultValue: "Confirmer ma présence", maxLength: 40 },
    { key: "rsvpThanksTitle", label: "Confirmation - remerciement (titre)", defaultValue: "Merci !", maxLength: 30 },
    { key: "rsvpThanksText", label: "Confirmation - remerciement (message)", defaultValue: "Votre réponse a bien été enregistrée.", maxLength: 100 },
    { key: "footerTagline", label: "Pied de page - phrase", defaultValue: "Avec tout notre amour", maxLength: 60 },
    // Illustrations : valeur = URL d'image, "" = image d'origine du template.
    { key: "firstTopImageUrl", label: "Accueil - illustration du haut", defaultValue: "/classiqueTemplate/1.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "firstFlowersImageUrl", label: "Accueil - fleurs sous la photo", defaultValue: "/classiqueTemplate/flowers.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "secondImageUrl", label: "Calendrier - illustration", defaultValue: "/classiqueTemplate/illustration1.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "thirdImageUrl", label: "Lieu - illustration", defaultValue: "/classiqueTemplate/Illustration2.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "programFlowersImageUrl", label: "Programme - fleurs", defaultValue: "/classiqueTemplate/flowersProg.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "programLeftImageUrl", label: "Programme - ornement gauche", defaultValue: "/classiqueTemplate/gauche.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "programRightImageUrl", label: "Programme - ornement droit", defaultValue: "/classiqueTemplate/droite.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
    { key: "rsvpFlowersImageUrl", label: "Confirmation - fleurs", defaultValue: "/classiqueTemplate/rsvp-flowers.png", maxLength: 500, kind: "image", presets: CLASSIC_IMAGES },
  ],
  styleFields: [
    {
      key: "fontStyle",
      label: "Style d'écriture",
      defaultValue: "script",
      options: [
        { value: "script", label: "Manuscrit élégant" },
        { value: "serif", label: "Classique sérieux" },
        { value: "modern", label: "Moderne épuré" },
      ],
    },
  ],
  maxImagesByRole: { [SiteImageRole.HERO]: 1, [SiteImageRole.GALLERY]: 5, [SiteImageRole.VENUE]: 3 },
  maxProgramItems: 8,
};

const BOUQUETS: TemplateImagePreset[] = [
  { label: "Bouquet 1", url: "/floralTemplate/bouquet-1.png" },
  { label: "Bouquet 2", url: "/floralTemplate/bouquet-2.png" },
  { label: "Bouquet 3", url: "/floralTemplate/bouquet-3.png" },
  { label: "Bouquet 4", url: "/floralTemplate/bouquet-4.png" },
];
 
// ======================= FLORAL =======================
export const FLORAL_FIELD_SCHEMA: TemplateFieldSchema = {
  colorFields: [
    { key: "primary", label: "Couleur d'accent", defaultValue: "#c9a24a" },
    { key: "heroBg", label: "Accueil - fond", defaultValue: "#4a0e1a" },
    { key: "heroEyebrowColor", label: "Accueil - « Le mariage de »", defaultValue: "#d8bd80" },
    { key: "heroNamesColor", label: "Accueil - prénoms", defaultValue: "#f4ead9" },
    { key: "heroDateColor", label: "Accueil - date", defaultValue: "#d8bd80" },
    { key: "heroVenueColor", label: "Accueil - lieu", defaultValue: "#efe0c8" },
    { key: "welcomeBg", label: "Bienvenue - fond", defaultValue: "#330a12" },
    { key: "welcomeTitleColor", label: "Bienvenue - titre", defaultValue: "#d8bd80" },
    { key: "welcomeTextColor", label: "Bienvenue - texte", defaultValue: "#f4ead9" },
    { key: "welcomeFrameColor", label: "Bienvenue - cadre", defaultValue: "#c9a24a" },
    { key: "calendarBg", label: "Calendrier - fond", defaultValue: "#4a0e1a" },
    { key: "calendarTitleColor", label: "Calendrier - titre", defaultValue: "#d8bd80" },
    { key: "calendarDayColor", label: "Calendrier - jours", defaultValue: "#f4ead9" },
    { key: "calendarActiveColor", label: "Calendrier - jour J", defaultValue: "#c9a24a" },
    { key: "programBg", label: "Programme - fond", defaultValue: "#4a0e1a" },
    { key: "programTitleColor", label: "Programme - titre", defaultValue: "#d8bd80" },
    { key: "programTimeColor", label: "Programme - heures", defaultValue: "#c9a24a" },
    { key: "programLabelColor", label: "Programme - étapes", defaultValue: "#f4ead9" },
    { key: "programLineColor", label: "Programme - ligne", defaultValue: "#c9a24a" },
    { key: "galleryBg", label: "Galerie - fond", defaultValue: "#f4ead9" },
    { key: "galleryTitleColor", label: "Galerie - titre", defaultValue: "#4a0e1a" },
    { key: "venueBg", label: "Lieu - fond", defaultValue: "#6e1b2b" },
    { key: "venueTitleColor", label: "Lieu - titre", defaultValue: "#d8bd80" },
    { key: "venueNameColor", label: "Lieu - nom", defaultValue: "#f4ead9" },
    { key: "venueTextColor", label: "Lieu - texte", defaultValue: "#efe0c8" },
    { key: "rsvpBg", label: "Confirmation - fond", defaultValue: "#330a12" },
    { key: "rsvpTitleColor", label: "Confirmation - titre", defaultValue: "#d8bd80" },
    { key: "rsvpLabelColor", label: "Confirmation - libellés", defaultValue: "#f4ead9" },
    { key: "rsvpAcceptBg", label: "Confirmation - bouton « Je viens »", defaultValue: "#c9a24a" },
    { key: "rsvpAccentColor", label: "Confirmation - accents", defaultValue: "#c9a24a" },
    { key: "footerBg", label: "Pied de page - fond", defaultValue: "#330a12" },
    { key: "footerNamesColor", label: "Pied de page - prénoms", defaultValue: "#d8bd80" },
    { key: "footerTextColor", label: "Pied de page - texte", defaultValue: "#efe0c8" },
  ],
  textFields: [
    { key: "welcomeTitle", label: "Bienvenue - titre", defaultValue: "Chers invités", maxLength: 60 },
    {
      key: "welcomeText",
      label: "Bienvenue - message",
      defaultValue:
        "C'est avec une immense joie que nous vous convions à célébrer notre union. Votre présence rendra ce jour encore plus précieux.",
      maxLength: 400,
    },
    {
      key: "venueText",
      label: "Lieu - présentation",
      defaultValue: "Le lieu où nous célébrerons notre union, entourés de ceux qui comptent.",
      maxLength: 300,
    },
    { key: "rsvpTitle", label: "Confirmation - titre", defaultValue: "Confirmez votre présence", maxLength: 60 },
    // Illustrations : valeur = URL d'image, "" = bouquet d'origine du template.
    { key: "heroBouquetUrl", label: "Accueil - illustration", defaultValue: "/floralTemplate/bouquet-1.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "programBouquetUrl", label: "Programme - illustration", defaultValue: "/floralTemplate/bouquet-2.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "rsvpBouquetUrl", label: "Confirmation - illustration", defaultValue: "/floralTemplate/bouquet-3.png", maxLength: 500, kind: "image", presets: BOUQUETS },
    { key: "footerBouquetUrl", label: "Pied de page - illustration", defaultValue: "/floralTemplate/bouquet-4.png", maxLength: 500, kind: "image", presets: BOUQUETS },
  ],
  maxImagesByRole: {
    [SiteImageRole.HERO]: 1,
    [SiteImageRole.GALLERY]: 8,
    [SiteImageRole.VENUE]: 3,
  },
  maxProgramItems: 8,
};


export const TEMPLATE_FIELD_SCHEMAS: Record<string, TemplateFieldSchema> = {
  classic: CLASSIC_FIELD_SCHEMA,
  floral: FLORAL_FIELD_SCHEMA,
};

export function getTemplateFieldSchema(slug: string): TemplateFieldSchema {
  const schema = TEMPLATE_FIELD_SCHEMAS[slug];
  if (!schema) throw new Error(`FIELD_SCHEMA_NOT_FOUND_FOR_SLUG: ${slug}`);
  return schema;
}