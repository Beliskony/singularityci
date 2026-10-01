// ============ TemplateClassic/components/FullSlideSection.tsx ============
import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FullSlideSectionProps {
  images: string[]; // vient de galleryImages, plus de tableau codé en dur
}

const FullSlideSection = ({ images }: FullSlideSectionProps) => {
  const total = images.length;
  const angleStep = total > 0 ? 360 / total : 0;

  const [current, setCurrent] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (total === 0) return;
    const update = () => {
      const width = viewportRef.current?.offsetWidth ?? 0;
      const r = width / 2 / Math.tan(Math.PI / total);
      setRadius(r);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [total]);

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c + 1) % total);
    setRotation((r) => r - angleStep);
  }, [total, angleStep]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c - 1 + total) % total);
    setRotation((r) => r + angleStep);
  }, [total, angleStep]);

  const goTo = useCallback(
    (index: number) => {
      const diff = index - current;
      const shortest =
        diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;
      setCurrent(index);
      setRotation((r) => r - shortest * angleStep);
    },
    [current, total, angleStep]
  );

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, total]);

  // Pas de photos uploadées : on n'affiche pas la section plutôt qu'un carousel vide/cassé
  if (total === 0) return null;

  return (
    <section className="relative isolate w-full min-h-screen h-210 overflow-hidden flex flex-col items-center px-3 py-6">
      <div ref={viewportRef} className="wheel-viewport relative w-full min-h-125 flex-1 rounded-3xl mt-2">
        {radius > 0 && (
          <div className="wheel-ring" style={{ transform: `rotateY(${rotation}deg)` }}>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Photo ${index + 1}`}
                className="wheel-face"
                style={{ transform: `rotateY(${index * angleStep}deg) translateZ(${radius}px)` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-3xl" />

        <button onClick={prev} aria-label="Photo précédente" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center">
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-md" />
        </button>
        <button onClick={next} aria-label="Photo suivante" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center">
          <ChevronRight className="w-8 h-8 text-white drop-shadow-md" />
        </button>
      </div>

      <div className="relative w-full shrink-0 flex items-center justify-center mt-3 h-24">
        {images.map((src, index) => {
          let delta = index - current;
          if (delta > total / 2) delta -= total;
          if (delta < -total / 2) delta += total;
          if (Math.abs(delta) > 1) return null;

          const isActive = delta === -1;
          const size = 88;
          const gap = 8;

          return (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Aller à la photo ${index + 1}`}
              className="thumbnail-item"
              style={
                {
                  width: size,
                  height: size,
                  "--thumb-x": `${delta * (size + gap)}px`,
                  "--thumb-scale": isActive ? 1 : 0.9,
                  "--thumb-opacity": isActive ? 1 : 0.9,
                  "--thumb-z": isActive ? 2 : 1,
                } as React.CSSProperties
              }
            >
              <img src={src} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover object-top" />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FullSlideSection;