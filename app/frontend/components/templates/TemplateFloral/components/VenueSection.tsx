"use client";

import { useInView } from "../hooks/useInView";

interface Props {
  venueName?: string;
  venueImages: string[];
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
}

export default function VenueSection({ venueName, venueImages, themeColors = {}, customTexts = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  if (!venueName && (!venueImages || venueImages.length === 0)) return null;

  const bg = themeColors.venueBg ?? "#6e1b2b";
  const titleColor = themeColors.venueTitleColor ?? "#d8bd80";
  const nameColor = themeColors.venueNameColor ?? "#f4ead9";
  const textColor = themeColors.venueTextColor ?? "#efe0c8";

  const venueText = customTexts.venueText ?? "Le lieu où nous célébrerons notre union, entourés de ceux qui comptent.";

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-sm text-center ${isInView ? "fl-in" : ""}`}>
        <h3 className="text-xs uppercase tracking-[0.3em]" style={{ color: titleColor }}>
          Le lieu
        </h3>
        {venueName && (
          <p className="mt-4 font-script text-3xl" style={{ color: nameColor }}>
            {venueName}
          </p>
        )}
        <p className="mt-3 font-serif text-sm leading-relaxed" style={{ color: textColor }}>
          {venueText}
        </p>

        {venueImages && venueImages.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venueImages[0]}
            alt={venueName ?? "Lieu de réception"}
            className="mt-8 aspect-4/3 w-full rounded-sm object-cover"
          />
        )}
      </div>
    </section>
  );
}
