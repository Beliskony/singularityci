import { useInView } from "../hooks/useInView";

interface WelcomeSectionProps {
  eyebrow?: string;
  title?: string;
  welcomeMessage?: string;
  themeColors?: Record<string, string>;
}

const WelcomeSection = ({ eyebrow, title, welcomeMessage, themeColors }: WelcomeSectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const c = (key: string) => (themeColors?.[key] ? { color: themeColors[key] } : undefined);
  const bg = themeColors?.welcomeBg ? { backgroundColor: themeColors.welcomeBg } : undefined;

  return (
    <div ref={ref} className={`px-8 pt-14 pb-10 text-center ${inView ? "in-view" : ""}`} style={bg}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3" style={{ "--delay": "0s", ...c("welcomeEyebrowColor") } as React.CSSProperties}>
        {eyebrow || "Un nouveau départ"}
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-5" style={{ "--delay": "0.1s", ...c("welcomeTitleColor") } as React.CSSProperties}>
        {title || "Bienvenue dans notre histoire"}
      </h2>
      <p className="ec-reveal text-[15px] leading-[1.75] text-ink/70 max-w-[320px] mx-auto text-left" style={{ "--delay": "0.2s", ...c("welcomeBodyColor") } as React.CSSProperties}>
        {welcomeMessage ||
          "Alors que le soleil se couche sur l'horizon et que les collines dorent, nous vous invitons à nos côtés pour dire 'oui'. Votre présence est la lumière qui complète notre célébration."}
      </p>
    </div>
  );
};

export default WelcomeSection;