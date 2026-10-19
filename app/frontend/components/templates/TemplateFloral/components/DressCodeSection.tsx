"use client";

import { useInView } from "../hooks/useInView";

interface Props {
  customTexts?: Record<string, string>;
  themeColors?: Record<string, string>;
}

const DEFAULT_SWATCHES = [
  { name: "Bordeaux", hex: "#4a0e1a" },
  { name: "Or", hex: "#c9a24a" },
  { name: "Crème", hex: "#f4ead9" },
  { name: "Vin", hex: "#6e1b2b" },
];

export default function DressCodeSection({ customTexts = {}, themeColors = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  const bg = themeColors.dressCodeBg ?? "#330a12";
  const titleColor = themeColors.dressCodeTitleColor ?? "#d8bd80";
  const textColor = themeColors.dressCodeTextColor ?? "#efe0c8";

  const title = customTexts.dressCodeTitle ?? "Code vestimentaire";
  const text =
    customTexts.dressCodeText ??
    "Nous vous invitons à vous parer des couleurs de notre mariage pour cette journée exceptionnelle.";

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-sm text-center ${isInView ? "fl-in" : ""}`}>
        <h3 className="font-script text-3xl" style={{ color: titleColor }}>
          {title}
        </h3>
        <p className="mt-4 font-serif text-sm leading-relaxed" style={{ color: textColor }}>
          {text}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          {DEFAULT_SWATCHES.map((s) => (
            <div key={s.hex} className="flex flex-col items-center gap-2">
              <span
                className="h-10 w-10 rounded-full border border-[#c9a24a]/50 shadow-sm"
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-[10px] uppercase tracking-wide" style={{ color: textColor }}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] italic opacity-60" style={{ color: textColor }}>
          Palette indicative — à adapter selon vos envies.
        </p>
      </div>
    </section>
  );
}
