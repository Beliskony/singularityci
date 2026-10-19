"use client";

import { useState } from "react";

interface Props {
  groomName: string;
  brideName: string;
  eventDate: Date;
  onEnter: () => void;
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Écran d'accueil "enveloppe cachetée" — reprend l'esprit du faire-part de
 * référence (fond bordeaux profond, sceau de cire doré, bouquet floral,
 * carte crème). Couleurs écrites en dur (pas de var(--color-*)) pour ne
 * jamais dépendre du chargement de floral-theme.css : l'écran d'entrée
 * doit toujours s'afficher correctement, même si le pipeline CSS du projet
 * ne reprend pas ce fichier.
 */
export default function IntroScreen({ groomName, brideName, eventDate, onEnter }: Props) {
  const [closing, setClosing] = useState(false);

  function handleOpen() {
    setClosing(true);
    setTimeout(onEnter, 650);
  }

  const day = eventDate.getDate();
  const month = MONTHS_FR[eventDate.getMonth()];
  const year = eventDate.getFullYear();

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-16 text-center transition-opacity duration-500 ${
        closing ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 30%, #5a1222 0%, #330a12 75%)",
      }}
    >
      {/* cadre doré */}
      <div className="pointer-events-none absolute inset-4 border border-[#c9a24a]/40 sm:inset-8" />

      {/* fleurons d'angle, dessinés en SVG inline pour rester autoportant */}
      {[
        "top-6 left-6 rotate-0",
        "top-6 right-6 rotate-90",
        "bottom-6 right-6 rotate-180",
        "bottom-6 left-6 -rotate-90",
      ].map((pos) => (
        <svg
          key={pos}
          className={`pointer-events-none absolute h-14 w-14 opacity-60 ${pos}`}
          viewBox="0 0 64 64"
          fill="none"
          stroke="#c9a24a"
          strokeWidth="1"
        >
          <path d="M4 4 C 20 4, 28 12, 28 28 M4 4 C 4 20, 12 28, 28 28" />
          <circle cx="28" cy="28" r="2.5" fill="#c9a24a" stroke="none" />
        </svg>
      ))}

      {/* enveloppe + sceau */}
      <div className={`relative ${closing ? "fl-intro-seal-exit" : "fl-intro-seal"}`}>
        <svg width="92" height="64" viewBox="0 0 92 64" fill="none">
          <rect x="1" y="1" width="90" height="62" rx="2" stroke="#d8bd80" strokeWidth="1.2" fill="#4a0e1a" />
          <path d="M2 2 L46 38 L90 2" stroke="#d8bd80" strokeWidth="1.2" fill="none" />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
          style={{ background: "radial-gradient(circle at 35% 30%, #d8bd80, #c9a24a)" }}
        >
          <span className="font-serif text-sm italic text-[#330a12]">
            {brideName.charAt(0)}&{groomName.charAt(0)}
          </span>
        </div>
      </div>

      <p className="fl-intro-names mt-8 text-[11px] uppercase tracking-[0.4em] text-[#d8bd80]">
        Vous êtes invités
      </p>

      <h1 className="fl-intro-names mt-5 font-script text-5xl leading-tight text-[#f4ead9] sm:text-6xl">
        {brideName} &amp; {groomName}
      </h1>

      <div className="fl-intro-line mt-5 h-px w-16 bg-[#c9a24a]" />

      <p className="fl-intro-date mt-5 font-serif text-base tracking-wide text-[#d8bd80]">
        {day} {month} {year}
      </p>

      <button
        onClick={handleOpen}
        className="fl-intro-cta group mt-12 flex items-center gap-3 rounded-full border border-[#c9a24a] px-7 py-3 text-xs uppercase tracking-[0.3em] text-[#f4ead9] transition-colors hover:bg-[#c9a24a] hover:text-[#330a12]"
      >
        Ouvrir l&apos;invitation
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
