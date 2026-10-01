// ============ TemplateClassic/index.tsx ============
"use client";

import { TemplateRenderProps } from "../registry";
import FirstSection from "../TemplateClassic/ClassicComponents/Principal/FirstSection";
import SecondSection from "../TemplateClassic/ClassicComponents/Principal/SecondSection";
import ThirdSection from "../TemplateClassic/ClassicComponents/Principal/ThirdSection";
import FullSlideSection from "../TemplateClassic/ClassicComponents/Principal/FullSlideSection";
import ProgramSection from "../TemplateClassic/ClassicComponents/Principal/ProgramSection";
import FormSection from "../TemplateClassic/ClassicComponents/Principal/FormSection";
import Footer from "../TemplateClassic/ClassicComponents/Principal/Footer";

export default function TemplateClassic({
  groomName,
  brideName,
  eventDate,
  heroImage,
  galleryImages,
  venueImages,
  themeColors,
  customTexts,
  programItems,
  onSubmitRsvp,
}: TemplateRenderProps) {
  return (
    <div style={{ "--primary": themeColors?.primary } as React.CSSProperties}>
      <FirstSection groomName={groomName} brideName={brideName} heroImage={heroImage} />
      <SecondSection eventDate={eventDate} welcomeMessage={customTexts?.welcomeMessage} />
      <ThirdSection venueName={customTexts?.venue} venueImages={venueImages} />
      <FullSlideSection images={galleryImages} />
      <ProgramSection eventDate={eventDate} programItems={programItems ?? []} />
      <FormSection rsvpDeadlineLabel={customTexts?.rsvpDeadline} onSubmitRsvp={onSubmitRsvp} />
      <Footer groomName={groomName} brideName={brideName} eventDate={eventDate} />
    </div>
  );
}