// ============ TemplateClassic/components/Footer.tsx ============
import { useInView } from "../../hooks/useInView";

interface FooterProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
}

function formatDate(date: Date): string {
  return date
    .toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replace(/\//g, " - ");
}

const Footer = ({ groomName, brideName, eventDate }: FooterProps) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);

  return (
    <footer
      ref={ref}
      className={`relative isolate w-full bg-brand-sage py-10 px-6 flex flex-col items-center text-center ${
        inView ? "in-view" : ""
      }`}
    >
      <p
        className="ft-item text-ivoire/90 text-sm sm:text-base tracking-[0.2em] uppercase"
        style={{ "--delay": "0.2s" } as React.CSSProperties}
      >
        Avec tout notre amour
      </p>

      <h2
        className="ft-item mt-3 text-4xl text-ivoire font-script leading-none"
        style={{ "--delay": "0.5s" } as React.CSSProperties}
      >
        {groomName} &amp; {brideName}
      </h2>

      <p
        className="ft-item mt-6 text-2xl sm:text-3xl font-bold text-ivoire tracking-[0.3em]"
        style={{ "--delay": "0.8s" } as React.CSSProperties}
      >
        {formatDate(eventDate)}
      </p>

      <div
        className="ft-item w-full max-w-xs h-px bg-ivoire/30 mt-10"
        style={{ "--delay": "1.1s" } as React.CSSProperties}
      />

      {/* Crédit neutralisé : dis-moi ce que tu veux afficher ici (rien, ta marque, un lien) */}
      <p
        className="ft-item text-ivoire/80 text-xs sm:text-sm tracking-wide"
        style={{ "--delay": "1.4s" } as React.CSSProperties}
      >
        Créé avec <span className="font-semibold text-ivoire">SINGULARITY.CI</span>
      </p>
    </footer>
  );
};

export default Footer;