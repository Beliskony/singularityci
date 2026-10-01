// ============ TemplateClassic/components/ProgramSection.tsx ============
import { useState, useEffect } from "react";
import { useInView } from "../../hooks/useInView";
import type { IProgramItem } from "@/app/server/sites/ISite";

interface ProgramSectionProps {
  eventDate: Date;
  programItems: IProgramItem[]; // vient de ISite.programItems, plus de tableau codé en dur
}

function useCountdown(targetDate: Date) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    calculate();
    const interval = setInterval(calculate, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [targetDate]);

  return daysLeft;
}

const ProgramSection = ({ eventDate, programItems }: ProgramSectionProps) => {
  const daysLeft = useCountdown(eventDate);
  const { ref, inView } = useInView<HTMLElement>(0.3);

  return (
    <section
      ref={ref}
      className={`bg-ivoire isolate flex flex-col items-center justify-center w-full py-16 px-4 ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="ps-item flex mb-5" style={{ "--delay": "0s" } as React.CSSProperties}>
        <img src="/templates/classic/flowersProg.png" alt="" className="w-28 h-28 sm:w-24 sm:h-24 object-contain" />
      </div>

      <div className="ps-item flex" style={{ "--delay": "0.15s" } as React.CSSProperties}>
        <h2 className="text-4xl sm:text-5xl text-vert mb-8 font-bold">Programme du jour !</h2>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-2xl text-center">
        {programItems.map((event, index) => (
          <div
            key={`${event.time}-${index}`}
            className="ps-row-item relative flex flex-col items-center gap-y-1.5 py-4 w-full"
            style={{ "--delay": `${0.4 + index * 0.15}s` } as React.CSSProperties}
          >
            <h3 className="text-xl text-brunCacao font-medium leading-relaxed tracking-wide">{event.time}</h3>
            <p className="text-lg text-primary font-medium leading-relaxed">{event.label}</p>

            {index < programItems.length - 1 && (
              <div className="flex items-center w-full mt-3 px-20">
                <span className="flex-1 h-px bg-brunCacao/40" />
                <span className="w-1.5 h-1.5 rotate-45 bg-vert mx-3" />
                <span className="flex-1 h-px bg-brunCacao/40" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="ps-item flex flex-row gap-x-2 justify-between items-center w-full max-w-2xl text-center mt-12"
        style={{ "--delay": `${0.4 + programItems.length * 0.15 + 0.2}s` } as React.CSSProperties}
      >
        <img
          src="/templates/classic/gauche.png"
          alt=""
          className="ps-from-left w-20 object-contain select-none pointer-events-none"
        />
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-5xl sm:text-4xl font-bold text-vert">{daysLeft}</h3>
          <p className="text-3xl text-vert">{daysLeft > 1 ? "Jours restants" : "Jour restant"}</p>
        </div>
        <img
          src="/templates/classic/droite.png"
          alt=""
          className="ps-from-right w-20 object-contain select-none pointer-events-none"
        />
      </div>
    </section>
  );
};

export default ProgramSection;