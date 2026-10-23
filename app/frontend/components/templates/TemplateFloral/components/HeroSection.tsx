"use client";

import RibbonDrape from "./RibbonDrape";

// L'image vit dans /public, donc on la référence par chemin (string), pas
// par import JS - un fichier de /public n'est pas un module, l'import
// plantait avec "Module not found". Place le fichier à
// public/floralTemplate/bouquet-default.png (même convention que
// public/classiqueTemplate/...).
const DEFAULT_BOUQUET = "/floralTemplate/bouquet-default.png";

interface Props {
  groomName: string;
  brideName: string;
  eventDate: Date;
  venueName?: string;
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Bandeau d'ouverture, affiché juste après l'IntroScreen (qui porte déjà
 * le sceau + les prénoms + la date). Pour éviter de répéter la même
 * composition, ce bloc met en avant le bouquet floral - l'élément qui
 * donne au template son identité "Floral" distincte des autres templates.
 */
export default function HeroSection({ groomName, brideName, eventDate, venueName, themeColors = {}, customTexts = {} }: Props) {
  const day = eventDate.getDate();
  const month = MONTHS_FR[eventDate.getMonth()];
  const year = eventDate.getFullYear();

  const heroBg = themeColors.heroBg ?? "linear-gradient(180deg, #330a12, #4a0e1a)";
  const eyebrowColor = themeColors.heroEyebrowColor ?? "#d8bd80";
  const namesColor = themeColors.heroNamesColor ?? "#f4ead9";
  const dateColor = themeColors.heroDateColor ?? "#d8bd80";
  const venueColor = themeColors.heroVenueColor ?? "#efe0c8";

  return (
    <section
      className="relative flex w-full flex-col items-center px-6 pb-0 pt-16 text-center"
      style={{ background: heroBg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={customTexts.heroBouquetUrl || DEFAULT_BOUQUET}
        alt="Bouquet"
        className="h-36 w-36 object-contain"
      />

      <p className="mt-2 text-xs uppercase tracking-[0.35em]" style={{ color: eyebrowColor }}>
        Le mariage de
      </p>

      <h1 className="mt-3 font-script text-5xl leading-tight sm:text-6xl" style={{ color: namesColor }}>
        {brideName} &amp; {groomName}
      </h1>

      <p className="mt-4 font-serif text-base tracking-wide" style={{ color: dateColor }}>
        {day} {month} {year}
      </p>

      {venueName && (
        <p className="mt-1 text-sm" style={{ color: venueColor }}>
          {venueName}
        </p>
      )}

      <RibbonDrape className="mt-10 h-14 w-full" />
    </section>
  );
}