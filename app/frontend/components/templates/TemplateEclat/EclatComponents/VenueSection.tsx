import { useInView } from "../hooks/useInView";

interface VenueSectionProps {
  venueName?: string;
  venueImage?: string;
  address?: string;
  eventDate: Date;
  themeColors?: Record<string, string>;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const VenueSection = ({ venueName, venueImage, address, eventDate, themeColors }: VenueSectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  if (!venueName) return null;

  const mapsQuery = encodeURIComponent(address || venueName);
  const c = (key: string) => (themeColors?.[key] ? { color: themeColors[key] } : undefined);
  const bg = themeColors?.venueBg ? { backgroundColor: themeColors.venueBg } : undefined;
  const cardBg = themeColors?.venueCardBg ? { backgroundColor: themeColors.venueCardBg } : undefined;

  return (
    <div ref={ref} className={`bg-cream px-8 pt-4 pb-14 ${inView ? "in-view" : ""}`} style={bg}>
      <div className="ec-reveal border border-ink/15 bg-sand/40 overflow-hidden" style={{ "--delay": "0s", ...cardBg } as React.CSSProperties}>
        {venueImage && (
          <div className="aspect-16/10 bg-sand">
            <img src={venueImage} alt={venueName} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-dust mb-2 text-center" style={c("venueEyebrowColor")}>Cérémonie &amp; réception</p>
          <p className="font-medium text-lg text-(--text-on-light) mb-4 text-center" style={c("venueNameColor")}>{venueName}</p>

          {address && <p className="text-xs text-ink/60 mb-2 text-center" style={c("venueAddressColor")}>{address}</p>}
          <p className="text-xs text-ink/60 mb-5 text-center" style={c("venueTimeColor")}>{formatTime(eventDate)}</p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs tracking-wide text-(--text-on-dark) bg-(--text-on-light) py-3 mb-2"
            style={{
              ...(themeColors?.venueButtonBg ? { backgroundColor: themeColors.venueButtonBg } : {}),
              ...(themeColors?.venueButtonTextColor ? { color: themeColors.venueButtonTextColor } : {}),
            }}
          >
            Obtenir l'itinéraire
          </a>
        </div>
      </div>
    </div>
  );
};

export default VenueSection;