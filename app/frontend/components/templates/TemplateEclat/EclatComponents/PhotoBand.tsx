import { useInView } from "../hooks/useInView";

interface PhotoBandProps {
  image?: string;
  quote?: string;
}

const PhotoBand = ({ image, quote }: PhotoBandProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`px-8 ${inView ? "in-view" : ""}`}>
      <div className="ec-reveal relative aspect-square bg-sand overflow-hidden" style={{ "--delay": "0s" } as React.CSSProperties}>
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs tracking-wide text-ink/40">[ photo ]</span>
        )}
        <span className="absolute top-3 right-3 text-[10px] tracking-wide text-white/90 bg-black/30 px-2 py-0.5">N°01</span>
      </div>
      <p className="ec-reveal font-script text-xl leading-relaxed text-(--text-on-light) text-center mt-6" style={{ "--delay": "0.15s" } as React.CSSProperties}>
        « {quote || "Deux chemins qui se rencontrent, un seul qui continue."} »
      </p>
    </div>
  );
};

export default PhotoBand;