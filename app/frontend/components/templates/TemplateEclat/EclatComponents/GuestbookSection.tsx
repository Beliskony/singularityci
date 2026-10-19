import { useInView } from "../hooks/useInView";

interface GuestbookSectionProps {
  themeColors?: Record<string, string>;
}

const GuestbookSection = ({ themeColors }: GuestbookSectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const c = (key: string) => (themeColors?.[key] ? { color: themeColors[key] } : undefined);
  const bg = themeColors?.guestbookBg ? { backgroundColor: themeColors.guestbookBg } : undefined;

  return (
    <div ref={ref} className={`px-8 pt-14 pb-14 text-center ${inView ? "in-view" : ""}`} style={bg}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3" style={{ "--delay": "0s", ...c("guestbookEyebrowColor") } as React.CSSProperties}>
        Amour partagé
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-4" style={{ "--delay": "0.1s", ...c("guestbookTitleColor") } as React.CSSProperties}>
        Notre livre d'or
      </h2>
      <p className="ec-reveal text-sm leading-relaxed text-ink/65 max-w-75 mx-auto mb-5" style={{ "--delay": "0.2s", ...c("guestbookBodyColor") } as React.CSSProperties}>
        Nous serions ravis que vous laissiez un message, un souvenir ou un conseil pour commencer ce nouveau chapitre.
      </p>
    </div>
  );
};

export default GuestbookSection;