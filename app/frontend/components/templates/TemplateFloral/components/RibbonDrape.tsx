"use client";

interface Props {
  className?: string;
}

/**
 * Drapé de satin en SVG, motif signature du faire-part de référence
 * (le "ruban" bordeaux qui traverse le bas de chaque panneau). Permet à
 * Floral d'avoir une identité visuelle propre plutôt qu'une simple
 * section de couleur unie comme les autres templates.
 */
export default function RibbonDrape({ className = "h-16 w-full" }: Props) {
  return (
    <svg viewBox="0 0 400 70" preserveAspectRatio="none" className={className} fill="none">
      <path
        d="M0 10 C 60 40, 120 0, 200 24 C 280 48, 320 8, 400 28 L400 70 L0 70 Z"
        fill="#6e1b2b"
      />
      <path
        d="M0 22 C 60 50, 120 14, 200 36 C 280 58, 320 20, 400 40 L400 70 L0 70 Z"
        fill="#4a0e1a"
        opacity="0.85"
      />
      <path
        d="M0 10 C 60 40, 120 0, 200 24 C 280 48, 320 8, 400 28"
        stroke="#c9a24a"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  );
}