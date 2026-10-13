// ============ TemplateClassic/index.tsx ============
"use client";

import "./classic-theme.css";
import { TemplateRenderProps } from "../registry";
import FirstSection from "../TemplateClassic/ClassicComponents/principal/FirstSection";
import SecondSection from "../TemplateClassic/ClassicComponents/principal/SecondSection";
import ThirdSection from "../TemplateClassic/ClassicComponents/principal/ThirdSection";
import FullSlideSection from "../TemplateClassic/ClassicComponents/principal/FullSlideSection";
import ProgramSection from "../TemplateClassic/ClassicComponents/principal/ProgramSection";
import FormSection from "../TemplateClassic/ClassicComponents/principal/FormSection";
import Footer from "../TemplateClassic/ClassicComponents/principal/Footer";

// Terracotta — même valeur que --color-primary dans classic-theme.css, pour
// que le rendu reste cohérent tant que le client n'a pas encore personnalisé
// sa couleur (site DRAFT) ou n'a pas touché ce champ.
const DEFAULT_PRIMARY = "#E35336";
const DEFAULT_TEXT_COLOR = "#8B5E3C";

export default function TemplateClassic({
  groomName,
  brideName,
  eventDate,
  heroImage,
  galleryImages,
  venueImages,
  venueName,
  themeColors,
  styleOptions,
  customTexts,
  programItems,
  onSubmitRsvp,
}: TemplateRenderProps) {
  return (
    <div 
      className="max-w-md mx-auto w-full overflow-x-hidden"
      data-font-style={styleOptions?.fontStyle ?? "script"}
      style={{
        "--primary": themeColors?.primary ?? DEFAULT_PRIMARY,
        "--text-color": themeColors?.textColor ?? DEFAULT_TEXT_COLOR,
      } as React.CSSProperties}
    >
      <FirstSection groomName={groomName} brideName={brideName} heroImage={heroImage} />
      <SecondSection eventDate={eventDate} welcomeMessage={customTexts?.welcomeMessage} />
      <ThirdSection venueName={venueName} venueImages={venueImages} />
      <FullSlideSection images={galleryImages} />
      <ProgramSection eventDate={eventDate} programItems={programItems ?? []} />
      <FormSection rsvpDeadlineLabel={customTexts?.rsvpDeadline} onSubmitRsvp={onSubmitRsvp} />
      <Footer groomName={groomName} brideName={brideName} eventDate={eventDate} />
    </div>
  );
}