import { useInView } from "../hooks/useInView";

interface FooterProps {
  groomName: string;
  brideName: string;
  closingImage?: string;
}

const Footer = ({ groomName, brideName, closingImage }: FooterProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={inView ? "in-view" : ""}>
      <div className="ec-reveal w-full aspect-16/10 bg-sand overflow-hidden" style={{ "--delay": "0s" } as React.CSSProperties}>
        {closingImage ? (
          <img src={closingImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-xs text-ink/40">[ photo ]</span>
        )}
      </div>
      <div className="bg-cream px-8 py-10 text-center">
        <p className="ec-reveal font-script text-xl text-(--text-on-light) mb-2" style={{ "--delay": "0.1s" } as React.CSSProperties}>
          Avec amour, {groomName} &amp; {brideName}
        </p>
        <p className="ec-reveal text-[10px] tracking-[0.15em] uppercase text-dust" style={{ "--delay": "0.2s" } as React.CSSProperties}>
          Créé avec SINGULARITY.CI
        </p>
      </div>
    </div>
  );
};

export default Footer;