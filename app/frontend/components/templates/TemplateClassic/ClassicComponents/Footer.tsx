// ============ TemplateClassic/ClassicComponents/principal/Footer.tsx ============
import { useInView } from "../../hooks/useInView";
import type { ClassicTexts } from "../../classicConfig";

interface FooterProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  texts: ClassicTexts;
}

function formatDate(date: Date): string {
  return date
    .toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replace(/\//g, " - ");
}

const Footer = ({ groomName, brideName, eventDate, texts }: FooterProps) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);

  return (
    <footer
      ref={ref}
      className={`relative isolate w-full bg-(--c-footerBg) py-10 px-6 flex flex-col items-center text-center ${
        inView ? "in-view" : ""
      }`}
    >
      <p
        className="ft-item text-(--c-footerTaglineColor) text-sm sm:text-base tracking-[0.2em] uppercase"
        style={{ "--delay": "0.2s" } as React.CSSProperties}
      >
        {texts.footerTagline}
      </p>

      <h2
        className="ft-item mt-3 text-4xl text-(--c-footerNamesColor) font-script leading-none"
        style={{ "--delay": "0.5s" } as React.CSSProperties}
      >
        {groomName} &amp; {brideName}
      </h2>

      <p
        className="ft-item mt-6 text-2xl sm:text-3xl font-bold text-(--c-footerDateColor) tracking-[0.3em]"
        style={{ "--delay": "0.8s" } as React.CSSProperties}
      >
        {formatDate(eventDate)}
      </p>

      <div
        className="ft-item w-full max-w-xs h-px bg-(--c-footerLineColor)/30 mt-10"
        style={{ "--delay": "1.1s" } as React.CSSProperties}
      />

      {/* Crédit neutralisé : dis-moi ce que tu veux afficher ici (rien, ta marque, un lien) */}
      <p
        className="ft-item text-(--c-footerCreditColor) text-xs sm:text-sm tracking-wide"
        style={{ "--delay": "1.4s" } as React.CSSProperties}
      >
        Créé avec <span className="font-semibold">SINGULARITY.CI</span>
      </p>
    </footer>
  );
};

export default Footer;