"use client";

import { useState } from "react";
import { useInView } from "../hooks/useInView";
import type { RsvpFormData } from "../../registry";

type Attendance = "ATTENDING" | "NOT_ATTENDING" | null;

interface RsvpTicketProps {
  rsvpDeadlineLabel?: string;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
}

function splitContact(contact: string): { guestEmail?: string; guestPhone?: string } {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  return isEmail ? { guestEmail: contact } : { guestPhone: contact };
}

const RsvpTicket = ({ rsvpDeadlineLabel, onSubmitRsvp }: RsvpTicketProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [attendance, setAttendance] = useState<Attendance>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contact.trim() || !attendance) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitRsvp({
        guestName: fullName,
        numberOfGuests: 1,
        status: attendance,
        ...splitContact(contact),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={ref} className={`bg-sand px-6 pt-14 pb-14 ${inView ? "in-view" : ""}`}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3 text-center" style={{ "--delay": "0s" } as React.CSSProperties}>
        Réponse souhaitée
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) text-center mb-3" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        Serez-vous des nôtres ?
      </h2>
      <p className="ec-reveal text-sm text-ink/60 text-center mb-7" style={{ "--delay": "0.15s" } as React.CSSProperties}>
        Partagerez-vous ce coucher de soleil avec nous ?
      </p>

      {submitted ? (
        <div className="ec-reveal border border-ink/15 bg-cream py-12 text-center" style={{ "--delay": "0.2s" } as React.CSSProperties}>
          <p className="font-script text-2xl text-(--text-on-light) mb-2">Merci !</p>
          <p className="text-sm text-ink/60">Votre réponse a bien été enregistrée.</p>
        </div>
      ) : (
        <div className="ec-reveal" style={{ "--delay": "0.2s" } as React.CSSProperties}>
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAttendance("ATTENDING")}
              className={`flex-1 text-[11px] tracking-wide py-3 border rounded-full ${
                attendance === "ATTENDING" ? "bg-(--text-on-light) text-(--text-on-dark) border-(--text-on-light)" : "border-ink/25 text-ink"
              }`}
            >
              ✓ J'accepte avec joie
            </button>
            <button
              type="button"
              onClick={() => setAttendance("NOT_ATTENDING")}
              className={`flex-1 text-[11px] tracking-wide py-3 border rounded-full ${
                attendance === "NOT_ATTENDING" ? "bg-ink/80 text-cream border-ink/80" : "border-ink/25 text-ink"
              }`}
            >
              ✕ Je décline avec regret
            </button>
          </div>

          {attendance && (
            <form onSubmit={handleSubmit} className="border border-ink/15 bg-cream px-6 py-6">
              <label htmlFor="fullName" className="block text-xs text-ink/50 mb-1.5">Nom et prénom</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                className="w-full border-0 border-b border-ink/20 bg-transparent py-1.5 text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-(--primary) mb-5"
              />

              <label htmlFor="contact" className="block text-xs text-ink/50 mb-1.5">Téléphone ou email</label>
              <input
                id="contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Votre contact"
                className="w-full border-0 border-b border-ink/20 bg-transparent py-1.5 text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-(--primary) mb-6"
              />

              {error && <p className="text-xs text-red-700 mb-3">{error}</p>}
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-ink/50 leading-relaxed">
                  {rsvpDeadlineLabel || "Merci de répondre avant la date limite indiquée."}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shrink-0 bg-(--text-on-light) text-(--text-on-dark) px-6 py-3 text-[13px] tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi..." : "Confirmer"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default RsvpTicket;