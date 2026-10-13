import { useInView } from "../hooks/useInView";

interface HeroSectionProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  heroImage?: string;
  venueName?: string;
  title?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const HeroSection = ({ groomName, brideName, eventDate, heroImage, venueName, title }: HeroSectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  return (
    <div ref={ref} className={`relative w-full aspect-3/4 bg-sand overflow-hidden ${inView ? "in-view" : ""}`}>
      {heroImage && (
        <img src={heroImage} alt={`${groomName} & ${brideName}`} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/50" />

      <div className="relative flex flex-col items-center text-center pt-14 px-8">
        <p className="ec-reveal text-xs tracking-[0.25em] uppercase text-white mb-4" style={{ "--delay": "0s" } as React.CSSProperties}>
          {groomName} &amp; {brideName}
        </p>
        <h1 className="ec-reveal font-script text-5xl leading-tight text-white" style={{ "--delay": "0.15s" } as React.CSSProperties}>
          {title || "Notre commencement"}
        </h1>
        <p className="ec-reveal text-sm tracking-wide text-white/90 mt-3" style={{ "--delay": "0.3s" } as React.CSSProperties}>
          {formatDate(eventDate)}
        </p>
      </div>

      {venueName && (
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
          <p className="ec-reveal font-script text-xl text-white" style={{ "--delay": "0.45s" } as React.CSSProperties}>
            {venueName}
          </p>
          <p className="ec-reveal text-[10px] tracking-[0.2em] uppercase text-white/70 mt-3" style={{ "--delay": "0.6s" } as React.CSSProperties}>
            Faites défiler
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSection;