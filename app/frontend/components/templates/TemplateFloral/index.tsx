"use client";

import "./floral-theme.css";
import HeroSection from "./components/HeroSection";
import WelcomeSection from "./components/WelcomeSection";
import CalendarCountdownSection from "./components/CalendarCountdownSection";
import ProgramSection from "./components/ProgramSection";
import DressCodeSection from "./components/DressCodeSection";
import GallerySection from "./components/GallerySection";
import VenueSection from "./components/VenueSection";
import RsvpSection from "./components/RsvpSection";
import Footer from "./components/Footer";

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
      <div className="mx-auto w-full max-w-md">
        <HeroSection
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDate}
          venueName={venueName}
          themeColors={themeColors}
        />
        <WelcomeSection customTexts={customTexts} themeColors={themeColors} />
        <CalendarCountdownSection eventDate={eventDate} themeColors={themeColors} />
        <ProgramSection programItems={programItems} themeColors={themeColors} />
        <DressCodeSection customTexts={customTexts} themeColors={themeColors} />
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
        <Footer groomName={groomName} brideName={brideName} themeColors={themeColors} />
      </div>
    </div>
  );
}
