import { useInView } from "../hooks/useInView";

interface InvitationSectionProps {
  groomName: string;
  brideName: string;
  eventDate: Date;
  body?: string;
}

const InvitationSection = ({ eventDate, body }: InvitationSectionProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const monthYear = eventDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div ref={ref} className={`px-8 pb-14 text-center ${inView ? "in-view" : ""}`}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3" style={{ "--delay": "0s" } as React.CSSProperties}>
        L'invitation
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-5" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        Joignez-vous à nous
      </h2>
      <p className="ec-reveal text-[15px] leading-[1.75] text-ink/70 max-w-[320px] mx-auto mb-6" style={{ "--delay": "0.2s" } as React.CSSProperties}>
        {body ||
          "Nous serions honorés de votre présence à nos côtés pour échanger nos vœux et célébrer le début de notre nouvelle vie ensemble."}
      </p>
      <p className="ec-reveal font-script text-3xl text-(--primary) capitalize" style={{ "--delay": "0.3s" } as React.CSSProperties}>
        {monthYear}
      </p>
    </div>
  );
};

export default InvitationSection;