"use client";

import { useInView } from "../hooks/useInView";

interface Props {
  customTexts?: Record<string, string>;
  themeColors?: Record<string, string>;
}

export default function WelcomeSection({ customTexts = {}, themeColors = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  // Fond bordeaux (pas crème) : dans le faire-part de référence, le bloc
  // "chers invités" est une carte sombre encadrée d'or, pas une section
  // claire — c'est ce genre de détail qui donnait au rendu un air trop
  // générique / interchangeable avec les autres templates.
  const bg = themeColors.welcomeBg ?? "#330a12";
  const titleColor = themeColors.welcomeTitleColor ?? "#d8bd80";
  const textColor = themeColors.welcomeTextColor ?? "#f4ead9";
  const frameColor = themeColors.welcomeFrameColor ?? "#c9a24a";

  const title = customTexts.welcomeTitle ?? "Chers invités";
  const text =
    customTexts.welcomeText ??
    "C'est avec une immense joie que nous vous convions à célébrer notre union. Votre présence rendra ce jour encore plus précieux.";

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div
        ref={ref}
        className={`fl-reveal mx-auto max-w-sm border px-6 py-10 text-center ${isInView ? "fl-in" : ""}`}
        style={{ borderColor: `${frameColor}55` }}
      >
        <span className="text-xs tracking-[0.3em]" style={{ color: frameColor }}>
          ❧
        </span>
        <h2 className="mt-3 font-script text-4xl" style={{ color: titleColor }}>
          {title}
        </h2>
        <p className="mt-6 font-serif text-base leading-relaxed" style={{ color: textColor }}>
          {text}
        </p>
      </div>
    </section>
  );
}