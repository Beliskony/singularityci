"use client";

import { useState } from "react";

interface IntroScreenProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  onEnter: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const IntroScreen = ({ groomName, brideName, eventDate, onEnter }: IntroScreenProps) => {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 550);
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center px-8 transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="ec-intro-ornament flex items-center gap-3 mb-8">
        <span className="w-8 h-px bg-(--primary)" />
        <span className="w-1.5 h-1.5 rotate-45 bg-(--primary)" />
        <span className="w-8 h-px bg-(--primary)" />
      </div>

      <p className="ec-intro-amp text-xs tracking-[0.2em] uppercase text-dust mb-6" style={{ animationDelay: "0.3s" }}>
        Nous nous marions
      </p>

      <p
        className="ec-intro-amp-mark font-script text-[56px] leading-tight text-(--text-on-light) mb-3 text-center"
        style={{ animationDelay: "0.6s" }}
      >
        {groomName} &amp; {brideName}
      </p>

      <p className="ec-intro-amp text-sm tracking-wide text-dust mb-14" style={{ animationDelay: "1s" }}>
        {formatDate(eventDate)}
      </p>

      <button
        onClick={handleEnter}
        className="ec-intro-cta text-sm tracking-wide text-(--text-on-light) border border-(--text-on-light)/30 px-7 py-3 transition-colors hover:bg-(--text-on-light) hover:text-(--text-on-dark)"
        style={{ animationDelay: "1.4s" }}
      >
        Découvrir l'invitation
      </button>
    </div>
  );
};

export default IntroScreen;