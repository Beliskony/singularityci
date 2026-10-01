// HeroSection.tsx (EnvelopeIntro)
import { useRef, useState } from "react";
import { gsap } from "gsap";

interface EnvelopeIntroProps {
  onComplete: () => void;
}

export default function HeroSection({ onComplete }: EnvelopeIntroProps) {
  const flapRef = useRef<HTMLImageElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [hasOpened, setHasOpened] = useState(false);

  const handleTap = () => {
    if (hasOpened) return;
    setHasOpened(true);

    const tl = gsap.timeline({ onComplete });

    tl.to(textRef.current, { opacity: 0, duration: 0.6 });

    tl.to(
      sealRef.current,
      { y: -40, opacity: 0, scale: 0.9, duration: 0.8, ease: "power2.out" },
      "-=0.1"
    );

    tl.to(
      flapRef.current,
      { rotateX: -180, duration: 1.5, ease: "power3.inOut" },
      "-=0.05"
    );

    tl.to(
      sceneRef.current,
      { opacity: 0, duration: 0.8, ease: "power1.in" },
      "-=0.3"
    );
  };

  return (
    <div
      ref={sceneRef}
      className="fixed w-screen inset-0 z-50 overflow-hidden cursor-pointer"
      style={{ perspective: 1600 }}
      onClick={handleTap}
    >
      {/* Corps de l'enveloppe : couvre TOUT l'écran, recadré proprement */}
      <img
        src="/hero/envelope-body.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Rabat : mêmes dimensions de recadrage que le corps, donc alignement conservé */}
      <img
        ref={flapRef}
        src="/hero/envelope-flap.png"
        alt=""
        className="absolute inset-0 w-full h-full md:-translate-y-10 object-cover origin-top select-none pointer-events-none"
        style={{ backfaceVisibility: "hidden" }}
      />

      {/* Sceau, centré sur l'écran (à la pointe du rabat) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div ref={sealRef} className="relative flex items-center justify-center">
          <div className="absolute top-[80%] w-20 h-4 sm:w-28 sm:h-6 bg-black/15 rounded-full blur-lg" />
          <img
            src="/hero/sealImg.png"
            alt=""
            className="relative w-64 md:w-96 max-sm:translate-y-22 object-contain drop-shadow-md"
          />
        </div>
      </div>

      <p
        ref={textRef}
        className="absolute bottom-16 inset-x-0 text-center text-xs sm:text-sm tracking-[0.35em] text-[#5c3f22] uppercase"
      >
        Touchez pour ouvrir
      </p>
    </div>
  );
}