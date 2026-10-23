"use client";

import { useInView } from "../hooks/useInView";
import RibbonDrape from "./RibbonDrape";

// Image servie depuis /public - référencée par chemin, pas importée.
const DEFAULT_BOUQUET = "/floralTemplate/bouquet-default.png";

interface ProgramItem {
  time: string;
  label: string;
}

interface Props {
  programItems?: ProgramItem[];
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
}

const DEFAULT_PROGRAM: ProgramItem[] = [
  { time: "14:00", label: "Cérémonie religieuse" },
  { time: "16:00", label: "Séance photo" },
  { time: "18:30", label: "Cocktail de bienvenue" },
  { time: "20:00", label: "Dîner & soirée dansante" },
];

export default function ProgramSection({ programItems, themeColors = {}, customTexts = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const items = programItems && programItems.length > 0 ? programItems : DEFAULT_PROGRAM;

  // Fond bordeaux (comme le panneau "Программа дня" de la référence), pas
  // crème : c'était ça qui manquait pour que le template ait le ton sombre
  // et floral voulu plutôt qu'une mise en page claire et passe-partout.
  const bg = themeColors.programBg ?? "#4a0e1a";
  const titleColor = themeColors.programTitleColor ?? "#d8bd80";
  const timeColor = themeColors.programTimeColor ?? "#c9a24a";
  const labelColor = themeColors.programLabelColor ?? "#f4ead9";
  const lineColor = themeColors.programLineColor ?? "#c9a24a";

  return (
    <section className="relative w-full pt-16" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-sm px-6 ${isInView ? "fl-in" : ""}`}>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customTexts.programBouquetUrl || DEFAULT_BOUQUET}
            alt="Bouquet"
            className="h-28 w-28 object-contain"
          />
        </div>

        <h3 className="mt-4 text-center font-script text-3xl" style={{ color: titleColor }}>
          Déroulé du jour
        </h3>

        <div className="relative mt-10 space-y-8 border-l pl-6" style={{ borderColor: lineColor }}>
          {items.map((item, i) => (
            <div key={i} className="relative">
              <span
                className="absolute -left-7.25 top-1 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lineColor }}
              />
              <p className="font-serif text-sm font-semibold tracking-wide" style={{ color: timeColor }}>
                {item.time}
              </p>
              <p className="mt-1 font-serif text-base" style={{ color: labelColor }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <RibbonDrape className="mt-16 h-14 w-full" />
    </section>
  );
}