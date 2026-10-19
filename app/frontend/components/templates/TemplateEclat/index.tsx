"use client";

import { useState } from "react";
import "./eclat-theme.css";
import { TemplateRenderProps } from "../registry";
import IntroScreen from "./EclatComponents/IntroScreen";
import HeroSection from "./EclatComponents/HeroSection";
import WelcomeSection from "./EclatComponents/WelcomSection";
import PhotoBand from "./EclatComponents/PhotoBand";
import StorySection from "./EclatComponents/StorySection";
import InvitationSection from "./EclatComponents/InvitationSection";
import CalendarCountdown from "./EclatComponents/CalendarCountdown";
import ProgramTimeline from "./EclatComponents/ProgramTimeline";
import VenueSection from "./EclatComponents/VenueSection";
import RsvpTicket from "./EclatComponents/RsvpTicket";
import GuestbookSection from "./EclatComponents/GuestbookSection";
import Footer from "./EclatComponents/Footer";

const DEFAULT_PRIMARY = "#B8935A";
const DEFAULT_TEXT_ON_LIGHT = "#2B2420";
const DEFAULT_TEXT_ON_DARK = "#F5F0E6";

export default function TemplateEclat({
  groomName,
  brideName,
  eventDate,
  heroImage,
  galleryImages,
  venueImages,
  venueName,
  themeColors,
  customTexts,
  programItems,
  onSubmitRsvp,
}: TemplateRenderProps) {
  const [entered, setEntered] = useState(false);

  const cssVars = {
    "--primary": themeColors?.primary ?? DEFAULT_PRIMARY,
    "--text-on-light": themeColors?.textOnLight ?? DEFAULT_TEXT_ON_LIGHT,
    "--text-on-dark": themeColors?.textOnDark ?? DEFAULT_TEXT_ON_DARK,
    colorScheme: "light",
  } as React.CSSProperties;

  if (!entered) {
    return (
      <div className="max-w-md mx-auto w-full overflow-x-hidden bg-cream" style={cssVars}>
        <IntroScreen
          groomName={groomName}
          brideName={brideName}
          eventDate={eventDate}
          onEnter={() => setEntered(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full overflow-x-hidden bg-cream" style={cssVars}>
      <HeroSection
        groomName={groomName}
        brideName={brideName}
        eventDate={eventDate}
        heroImage={heroImage}
        venueName={venueName}
        title={customTexts?.heroTitle}
        themeColors={themeColors}
      />
      <WelcomeSection
        eyebrow={customTexts?.welcomeEyebrow}
        title={customTexts?.welcomeTitle}
        welcomeMessage={customTexts?.welcomeMessage}
        themeColors={themeColors}
      />
      <PhotoBand image={galleryImages?.[0]} quote={customTexts?.quote} themeColors={themeColors} />
      <StorySection
        eyebrow={customTexts?.storyEyebrow}
        title={customTexts?.storyTitle}
        body={customTexts?.storyBody}
        chapterLabel={customTexts?.chapterLabel}
        chapterTitle={customTexts?.chapterTitle}
        excerpt={customTexts?.storyExcerpt}
        image={galleryImages?.[1]}
        themeColors={themeColors}
      />
      <InvitationSection
        groomName={groomName}
        brideName={brideName}
        eventDate={eventDate}
        body={customTexts?.invitationBody}
        themeColors={themeColors}
      />
      <CalendarCountdown eventDate={eventDate} themeColors={themeColors} />
      <ProgramTimeline title={customTexts?.programTitle} programItems={programItems ?? []} themeColors={themeColors} />
      <VenueSection
        venueName={venueName}
        venueImage={venueImages?.[0]}
        address={customTexts?.venueAddress}
        eventDate={eventDate}
        themeColors={themeColors}
      />
      <RsvpTicket rsvpDeadlineLabel={customTexts?.rsvpDeadline} onSubmitRsvp={onSubmitRsvp} themeColors={themeColors} />
      <GuestbookSection themeColors={themeColors} />
      <Footer
        groomName={groomName}
        brideName={brideName}
        closingImage={galleryImages?.[galleryImages.length - 1]}
        themeColors={themeColors}
      />
    </div>
  );
}