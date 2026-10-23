"use client";

import { useState } from "react";
import "./floral-theme.css";
import IntroScreen from "./IntroScreen";
import HeroSection from "./HeroSection";
import WelcomeSection from "./WelcomeSection";
import CalendarCountdownSection from "./CalendarCountdownSection";
import ProgramSection from "./ProgramSection";
import GallerySection from "./GallerySection";
import VenueSection from "./VenueSection";
import RsvpSection from "./RsvpSection";
import Footer from "./Footer";

interface IProgramItem {
  time: string;
  label: string;
}

interface RsvpFormData {
  guestName: string;
  guestEmail?: string;
  status: "ATTENDING" | "NOT_ATTENDING";
  numberOfGuests: number;
  message?: string;
}

/**
 * Doit rester compatible avec TemplateRenderProps de registry.tsx.
 * Redéclaré ici localement (pas d'import de type partagé) pour que le
 * template reste 100% autoportant, comme Classic et Éclat.
 */
interface TemplateFloralProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  heroImage?: string;
  galleryImages: string[];
  venueImages: string[];
  venueName?: string;
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
  programItems?: IProgramItem[];
  rsvpCount: number;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
}

const DEFAULT_PRIMARY = "#c9a24a"; // --color-gold
const DEFAULT_TEXT_ON_LIGHT = "#4a0e1a"; // --color-burgundy
const DEFAULT_TEXT_ON_DARK = "#f4ead9"; // --color-cream

export default function TemplateFloral({
  groomName,
  brideName,
  eventDate,
  galleryImages,
  venueImages,
  venueName,
  themeColors,
  customTexts,
  programItems,
  rsvpCount,
  onSubmitRsvp,
}: TemplateFloralProps) {
  const primary = themeColors?.primary ?? DEFAULT_PRIMARY;
  const textOnLight = themeColors?.textOnLight ?? DEFAULT_TEXT_ON_LIGHT;
  const textOnDark = themeColors?.textOnDark ?? DEFAULT_TEXT_ON_DARK;

  // Pattern "remplacement d'état" (pas de position:fixed) : un overlay fixed
  // casse quand un ancêtre (le cadre de /apercu) a un transform CSS - déjà
  // rencontré sur Éclat. On bascule donc tout le contenu plutôt que de
  // superposer un calque.
  const [entered, setEntered] = useState(false);

  return (
    <div
      className="w-full overflow-x-hidden font-serif"
      style={
        {
          "--primary": primary,
          "--text-on-light": textOnLight,
          "--text-on-dark": textOnDark,
          colorScheme: "light",
        } as React.CSSProperties
      }
    >
      {!entered ? (
        <IntroScreen
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDate}
          onEnter={() => setEntered(true)}
        />
      ) : (
      <div className="mx-auto w-full max-w-md">
        <HeroSection
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDate}
          venueName={venueName}
          themeColors={themeColors}
          customTexts={customTexts}
        />
        <WelcomeSection customTexts={customTexts} themeColors={themeColors} />
        <CalendarCountdownSection eventDate={eventDate} themeColors={themeColors} />
        <ProgramSection programItems={programItems} themeColors={themeColors} />
        <GallerySection galleryImages={galleryImages} themeColors={themeColors} />
        <VenueSection
          venueName={venueName}
          venueImages={venueImages}
          themeColors={themeColors}
          customTexts={customTexts}
        />
        <RsvpSection
          rsvpCount={rsvpCount}
          onSubmitRsvp={onSubmitRsvp}
          themeColors={themeColors}
          customTexts={customTexts}
        />
        <Footer groomName={groomName} brideName={brideName} themeColors={themeColors} customTexts={customTexts} />
      </div>
      )}
    </div>
  );
}