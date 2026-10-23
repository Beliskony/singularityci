"use client";

import { useState } from "react";
import { useInView } from "../hooks/useInView";

// Image servie depuis /public - référencée par chemin, pas importée.
const DEFAULT_BOUQUET = "/floralTemplate/bouquet-default.png";

interface RsvpFormData {
  guestName: string;
  guestEmail?: string;
  status: "ATTENDING" | "NOT_ATTENDING";
  numberOfGuests: number;
  message?: string;
}

interface Props {
  rsvpCount: number;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;
}

const DRINK_OPTIONS = ["Vin rouge", "Vin blanc", "Cocktail sans alcool", "Champagne"];

export default function RsvpSection({ rsvpCount, onSubmitRsvp, themeColors = {}, customTexts = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState<"ATTENDING" | "NOT_ATTENDING">("ATTENDING");
  const [guestsCount, setGuestsCount] = useState(1);
  const [drinks, setDrinks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fond bordeaux (comme "Анкета гостя" sur la référence) : un formulaire
  // sur fond clair perdait le ton du template et le rendait interchangeable
  // avec Classic. Le bouton "Confirmer" passe en or plein pour rester
  // lisible sur fond sombre.
  const bg = themeColors.rsvpBg ?? "#330a12";
  const titleColor = themeColors.rsvpTitleColor ?? "#d8bd80";
  const labelColor = themeColors.rsvpLabelColor ?? "#f4ead9";
  const acceptBg = themeColors.rsvpAcceptBg ?? "#c9a24a";
  const declineBg = themeColors.rsvpDeclineBg ?? "transparent";
  const accentColor = themeColors.rsvpAccentColor ?? "#c9a24a";

  function toggleDrink(option: string) {
    setDrinks((prev) => (prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Merci d'indiquer votre nom.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const drinkNote = status === "ATTENDING" && drinks.length > 0 ? ` | Préférences boissons : ${drinks.join(", ")}` : "";
      await onSubmitRsvp({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
        status,
        numberOfGuests: status === "ATTENDING" ? guestsCount : 0,
        message: drinkNote ? drinkNote.slice(3) : undefined,
      });
      setDone(true);
    } catch {
      setError("Une erreur est survenue, merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  const title = customTexts.rsvpTitle ?? "Confirmez votre présence";

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-sm ${isInView ? "fl-in" : ""}`}>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customTexts.rsvpBouquetUrl || DEFAULT_BOUQUET}
            alt="Bouquet"
            className="h-24 w-24 object-contain"
          />
        </div>

        <h3 className="mt-2 text-center font-script text-3xl" style={{ color: titleColor }}>
          {title}
        </h3>

        {rsvpCount > 0 && (
          <p className="mt-2 text-center text-xs" style={{ color: labelColor }}>
            {rsvpCount} invité{rsvpCount > 1 ? "s" : ""} ont déjà répondu
          </p>
        )}

        {done ? (
          <p className="mt-8 text-center font-serif text-base" style={{ color: labelColor }}>
            Merci, votre réponse a bien été enregistrée !
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: labelColor }}>
                Nom complet
              </label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="mt-1 w-full border-b bg-transparent py-2 font-serif text-sm outline-none"
                style={{ borderColor: accentColor, color: labelColor }}
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: labelColor }}>
                Email (optionnel)
              </label>
              <input
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                type="email"
                className="mt-1 w-full border-b bg-transparent py-2 font-serif text-sm outline-none"
                style={{ borderColor: accentColor, color: labelColor }}
                placeholder="vous@email.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("ATTENDING")}
                className="flex-1 rounded-sm border py-2 text-sm font-medium transition"
                style={{
                  borderColor: accentColor,
                  backgroundColor: status === "ATTENDING" ? acceptBg : declineBg,
                  color: status === "ATTENDING" ? "#330a12" : labelColor,
                }}
              >
                Je serai présent(e)
              </button>
              <button
                type="button"
                onClick={() => setStatus("NOT_ATTENDING")}
                className="flex-1 rounded-sm border py-2 text-sm font-medium transition"
                style={{
                  borderColor: accentColor,
                  backgroundColor: status === "NOT_ATTENDING" ? acceptBg : declineBg,
                  color: status === "NOT_ATTENDING" ? "#330a12" : labelColor,
                }}
              >
                Je ne pourrai pas venir
              </button>
            </div>

            {status === "ATTENDING" && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wide" style={{ color: labelColor }}>
                    Nombre de personnes
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="mt-1 w-full border-b bg-transparent py-2 font-serif text-sm outline-none"
                    style={{ borderColor: accentColor, color: labelColor }}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide" style={{ color: labelColor }}>
                    Préférence de boisson
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {DRINK_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: labelColor }}
                      >
                        <input
                          type="checkbox"
                          checked={drinks.includes(opt)}
                          onChange={() => toggleDrink(opt)}
                          className="accent-[#c9a24a]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
              style={{ backgroundColor: acceptBg, color: "#330a12" }}
            >
              {submitting ? "Envoi..." : "Confirmer"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}