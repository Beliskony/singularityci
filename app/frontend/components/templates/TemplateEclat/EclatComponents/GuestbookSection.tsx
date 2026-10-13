import { useInView } from "../hooks/useInView";

const GuestbookSection = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={`px-8 pt-14 pb-14 text-center ${inView ? "in-view" : ""}`}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3" style={{ "--delay": "0s" } as React.CSSProperties}>
        Amour partagé
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-4" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        Notre livre d'or
      </h2>
      <p className="ec-reveal text-sm leading-relaxed text-ink/65 max-w-75 mx-auto mb-5" style={{ "--delay": "0.2s" } as React.CSSProperties}>
        Nous serions ravis que vous laissiez un message, un souvenir ou un conseil pour commencer ce nouveau chapitre.
      </p>
    </div>
  );
};

export default GuestbookSection;