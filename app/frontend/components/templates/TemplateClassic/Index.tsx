// ============ TemplateClassic/Index.tsx ============
"use client";

import "./classic-theme.css";
import { TemplateRenderProps } from "../registry";
import { resolveClassic } from "./classicConfig";
import FirstSection from "../TemplateClassic/ClassicComponents/principal/FirstSection";
import SecondSection from "../TemplateClassic/ClassicComponents/principal/SecondSection";
import ThirdSection from "../TemplateClassic/ClassicComponents/principal/ThirdSection";
import FullSlideSection from "../TemplateClassic/ClassicComponents/principal/FullSlideSection";
import ProgramSection from "../TemplateClassic/ClassicComponents/principal/ProgramSection";
import FormSection from "../TemplateClassic/ClassicComponents/principal/FormSection";
import Footer from "../TemplateClassic/ClassicComponents/principal/Footer";

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
  // Chaque couleur devient une variable CSS --c-<clé> lue par les sections (bg-(--c-…)),
  // chaque texte / illustration arrive résolu (valeur client ou valeur d'origine).
  const { cssVars, texts, imgs } = resolveClassic(themeColors, customTexts);

  return (
    <div
      className="max-w-md mx-auto w-full overflow-x-hidden"
      data-font-style={styleOptions?.fontStyle ?? "script"}
      style={cssVars as React.CSSProperties}
    >
      <FirstSection groomName={groomName} brideName={brideName} heroImage={heroImage} imgs={imgs} />
      <SecondSection eventDate={eventDate} texts={texts} imgs={imgs} />
      <ThirdSection venueName={venueName || texts.venue || undefined} venueImages={venueImages} texts={texts} imgs={imgs} />
      <FullSlideSection images={galleryImages} />
      <ProgramSection eventDate={eventDate} programItems={programItems ?? []} texts={texts} imgs={imgs} />
      <FormSection texts={texts} imgs={imgs} onSubmitRsvp={onSubmitRsvp} />
      <Footer groomName={groomName} brideName={brideName} eventDate={eventDate} texts={texts} />
    </div>
  );
}