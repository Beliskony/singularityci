import { useInView } from "../hooks/useInView";
import type { IProgramItem } from "@/app/server/sites/ISite";

interface ProgramTimelineProps {
  title?: string;
  programItems: IProgramItem[];
}

const ProgramTimeline = ({ title, programItems }: ProgramTimelineProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`bg-sand px-8 pt-4 pb-14 ${inView ? "in-view" : ""}`}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3 text-center" style={{ "--delay": "0s" } as React.CSSProperties}>
        Le jour J
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-10 text-center" style={{ "--delay": "0.1s" } as React.CSSProperties}>
        {title || "Détails de la soirée"}
      </h2>

      <div className="relative pl-7 border-l border-(--primary)/35">
        {programItems.map((item, index) => (
          <div
            key={`${item.time}-${index}`}
            className="ec-reveal relative pb-9 last:pb-0"
            style={{ "--delay": `${0.2 + index * 0.12}s` } as React.CSSProperties}
          >
            <span className="absolute left-[-32.5px] top-1 w-2.25 h-2.25 rounded-full bg-(--primary)" />
            <p className="text-[13px] tracking-wide text-(--primary) mb-1">{item.time}</p>
            <p className="font-medium text-[17px] text-(--text-on-light)">{item.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProgramTimeline;