// ============ TemplateClassic/components/ThirdSection.tsx ============
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

interface ThirdSectionProps {
  venueName?: string;
  venueImages: string[];
}

const ThirdSection = ({ venueName, venueImages }: ThirdSectionProps) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);
  const [current, setCurrent] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  const loopedImages = venueImages.length > 0 ? [...venueImages, venueImages[0]] : [];

  const next = useCallback(() => {
    if (venueImages.length === 0) return;
    setCurrent((c) => c + 1);
  }, [venueImages.length]);

  const prev = useCallback(() => {
    if (venueImages.length === 0) return;
    setCurrent((c) => {
      if (c === 0) {
        setEnableTransition(false);
        return venueImages.length;
      }
      return c - 1;
    });
  }, [venueImages.length]);

  useEffect(() => {
    if (current === venueImages.length && venueImages.length > 0) {
      const timeout = setTimeout(() => {
        setEnableTransition(false);
        setCurrent(0);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [current, venueImages.length]);

  useEffect(() => {
    if (!enableTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [enableTransition]);

  useEffect(() => {
    if (venueImages.length === 0) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, venueImages.length]);

  const mapsQuery = venueName ? encodeURIComponent(venueName) : "";

  return (
    <section
      ref={ref}
      className={`relative isolate w-full h-full bg-brand-sage overflow-hidden lg:flex lg:items-center lg:justify-center lg:py-10 ${
        inView ? "in-view" : ""
      }`}
    >
      <div
        className="relative w-full min-h-screen bg-ivoire rounded-t-[160px] flex flex-col items-center mt-5 pt-5 pb-10
                   sm:max-w-md sm:mx-auto
                   lg:min-h-0 lg:max-w-sm lg:mt-0 lg:pt-8 lg:pb-14 lg:rounded-[160px] lg:shadow-2xl"
      >
        <div className="ts-item relative w-50 mt-2 lg:-mt-10">
          <img src="/templates/classic/Illustrion2.png" alt="" className="w-full h-full object-cover" />
        </div>

        {venueImages.length > 0 && (
          <div className="ts-item relative w-[95%] aspect-7/5 mt-10 lg:max-w-65 rounded-3xl overflow-hidden shadow-lg">
            <div
              className={`ts-track flex w-full h-full ${!enableTransition ? "ts-track--no-transition" : ""}`}
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {loopedImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Lieu de la cérémonie ${(index % venueImages.length) + 1}`}
                  className="w-full h-full object-cover shrink-0"
                />
              ))}
            </div>

            <button onClick={prev} aria-label="Image précédente" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button onClick={next} aria-label="Image suivante" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {venueName && (
          <div className="ts-item flex flex-col items-center mt-8 px-6 text-center">
            <p className="italic text-brand-sage font-script text-2xl sm:text-3xl leading-snug">{venueName}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ts-map-btn mt-6 inline-flex items-center px-9 py-3.5 rounded-full
                bg-primary text-ivoire text-sm sm:text-base font-medium tracking-widest uppercase
                shadow-md shadow-primary/30 ring-1 ring-ivoire/20 hover:shadow-lg hover:shadow-primary/40"
            >
              Itinéraire Google Maps
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ThirdSection;