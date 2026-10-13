import { useInView } from "../hooks/useInView";

interface StorySectionProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  chapterLabel?: string;
  chapterTitle?: string;
  excerpt?: string;
}

const StorySection = ({ eyebrow, title, body, chapterLabel, chapterTitle, excerpt }: StorySectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={`px-8 pt-14 pb-10 text-center ${inView ? "in-view" : ""}`}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3" style={{ "--delay": "0s" } as React.CSSProperties}>
        {eyebrow || "Comment tout a commencé"}
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-5" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        {title || "Le chapitre doré"}
      </h2>
      <p className="ec-reveal text-[15px] leading-[1.75] text-ink/70 max-w-[320px] mx-auto text-left mb-8" style={{ "--delay": "0.2s" } as React.CSSProperties}>
        {body || "D'une rencontre inattendue à une demande au sommet de la vallée, voici un aperçu de notre histoire."}
      </p>

      <div className="ec-reveal border border-ink/15 bg-sand/40 px-6 py-7 text-left" style={{ "--delay": "0.3s" } as React.CSSProperties}>
        <p className="text-[11px] tracking-[0.2em] uppercase text-dust mb-2 text-center">{chapterLabel || "Chapitre 01"}</p>
        <p className="font-script text-2xl text-(--text-on-light) mb-3 text-center">{chapterTitle || "Entre les pages"}</p>
        <p className="text-sm leading-relaxed text-ink/65 mb-5">
          {excerpt || "C'était un mardi tranquille dans une librairie, l'un cherchait un livre, l'autre un signe…"}
        </p>
        {/* ajouter une illustration de marier ou bouquet */}
      </div>
    </div>
  );
};

export default StorySection;