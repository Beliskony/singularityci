"use client";

// Image servie depuis /public — référencée par chemin, pas importée.
const DEFAULT_BOUQUET = "/floralTemplate/bouquet-default.png";

interface Props {
  groomName: string;
  brideName: string;
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
}

export default function Footer({ groomName, brideName, themeColors = {}, customTexts = {} }: Props) {
  const bg = themeColors.footerBg ?? "#330a12";
  const namesColor = themeColors.footerNamesColor ?? "#d8bd80";
  const textColor = themeColors.footerTextColor ?? "#efe0c8";

  return (
    <footer className="w-full px-6 pb-14 pt-6 text-center" style={{ backgroundColor: bg }}>
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customTexts.footerBouquetUrl || DEFAULT_BOUQUET}
          alt="Bouquet"
          className="h-20 w-20 object-contain"
        />
      </div>
      <p className="mt-2 font-script text-3xl" style={{ color: namesColor }}>
        {brideName} &amp; {groomName}
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: textColor }}>
        Avec amour, merci d&apos;être des nôtres
      </p>
    </footer>
  );
}