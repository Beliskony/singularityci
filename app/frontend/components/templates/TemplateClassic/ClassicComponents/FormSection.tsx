// ============ TemplateClassic/ClassicComponents/principal/FormSection.tsx ============
import { useState } from "react";
import { useInView } from "../../hooks/useInView";
import type { RsvpFormData } from "../../../registry";
import type { ClassicImages, ClassicTexts } from "../../classicConfig";

type Attendance = "ATTENDING" | "PENDING" | null;

interface FormSectionProps {
  texts: ClassicTexts; // rsvpDeadline : ex. "avant le 26 Juin"
  imgs: ClassicImages;
  onSubmitRsvp: (data: RsvpFormData) => Promise<void>;
}

// Détection simple : si ça ressemble à un email, on le range dans guestEmail, sinon guestPhone
function splitContact(contact: string): { guestEmail?: string; guestPhone?: string } {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  return isEmail ? { guestEmail: contact } : { guestPhone: contact };
}

const FormSection = ({ texts, imgs, onSubmitRsvp }: FormSectionProps) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);
  const rsvpDeadlineLabel = texts.rsvpDeadline;
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
        numberOfGuests: 1, // le formulaire actuel ne demande pas de groupe, 1 par soumission
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
    <section
      ref={ref}
      className={`relative isolate w-full bg-(--c-rsvpBg) py-10 px-6 flex flex-col items-center ${
        inView ? "in-view" : ""
      }`}
    >
      <div
        className="sf-item relative flex items-center justify-center"
        style={{ "--delay": "0s" } as React.CSSProperties}
      >
        <h2 className="text-8xl font-bold text-(--c-rsvpTitleColor) tracking-[20px] w-full">{texts.rsvpHeading}</h2>
        <img
          src={imgs.rsvpFlowersImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      <p
        className="sf-item mt-4 text-center text-(--c-rsvpSubtitleColor) font-script text-sm sm:text-3xl italic leading-snug max-w-sm"
        style={{ "--delay": "0.3s" } as React.CSSProperties}
      >
        {rsvpDeadlineLabel
          ? `Veuillez confirmer votre présence ${rsvpDeadlineLabel} svp !`
          : "Veuillez confirmer votre présence svp !"}
      </p>

      <div
        className="sf-item w-full max-w-sm mt-10"
        style={{ "--delay": "0.6s" } as React.CSSProperties}
      >
        {submitted ? (
          <div className="sf-confirm flex flex-col items-center text-center gap-2 py-8">
            <p className="font-script text-3xl text-(--c-rsvpTitleColor)">{texts.rsvpThanksTitle}</p>
            <p className="text-(--c-rsvpLabelColor) text-base">{texts.rsvpThanksText}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm text-(--c-rsvpLabelColor) tracking-wide">
                {texts.rsvpNameLabel}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={texts.rsvpNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-(--c-rsvpFieldBorderColor)/30 bg-(--c-rsvpFieldBg)
                           text-(--c-rsvpFieldTextColor) placeholder:text-(--c-rsvpFieldTextColor)/40
                           focus:outline-none focus:ring-2 focus:ring-(--c-rsvpFieldBorderColor)/50 transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact" className="text-sm text-(--c-rsvpLabelColor) tracking-wide">
                {texts.rsvpContactLabel}
              </label>
              <input
                id="contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={texts.rsvpContactPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-(--c-rsvpFieldBorderColor)/30 bg-(--c-rsvpFieldBg)
                           text-(--c-rsvpFieldTextColor) placeholder:text-(--c-rsvpFieldTextColor)/40
                           focus:outline-none focus:ring-2 focus:ring-(--c-rsvpFieldBorderColor)/50 transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <span className="text-sm text-(--c-rsvpLabelColor) tracking-wide">{texts.rsvpAttendanceLabel}</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAttendance("ATTENDING")}
                  className={`flex-1 py-3 rounded-full text-sm font-medium tracking-wide border transition-colors duration-300 ${
                    attendance === "ATTENDING"
                      ? "bg-(--c-rsvpChoiceActiveBg) text-(--c-rsvpChoiceActiveTextColor) border-(--c-rsvpChoiceActiveBg)"
                      : "bg-(--c-rsvpFieldBg) text-(--c-rsvpFieldTextColor) border-(--c-rsvpFieldBorderColor)/30"
                  }`}
                >
                  {texts.rsvpYesLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setAttendance("PENDING")}
                  className={`flex-1 py-3 rounded-full text-sm font-medium tracking-wide border transition-colors duration-300 ${
                    attendance === "PENDING"
                      ? "bg-(--c-rsvpChoiceActiveBg) text-(--c-rsvpChoiceActiveTextColor) border-(--c-rsvpChoiceActiveBg)"
                      : "bg-(--c-rsvpFieldBg) text-(--c-rsvpFieldTextColor) border-(--c-rsvpFieldBorderColor)/30"
                  }`}
                >
                  {texts.rsvpMaybeLabel}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center -mb-2">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="sf-submit-btn mt-4 px-8 py-3.5 rounded-full bg-(--c-rsvpButtonBg) text-(--c-rsvpButtonTextColor)
                         text-sm sm:text-base font-medium tracking-widest uppercase
                         shadow-md shadow-(color:--c-rsvpButtonBg)/30 ring-1 ring-(--c-rsvpButtonTextColor)/20
                         hover:shadow-lg hover:shadow-(color:--c-rsvpButtonBg)/40
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : texts.rsvpSubmitLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default FormSection;