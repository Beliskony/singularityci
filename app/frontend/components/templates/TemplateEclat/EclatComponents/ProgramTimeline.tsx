import { useInView } from "../hooks/useInView";
import type { IProgramItem } from "@/app/server/sites/ISite";

interface ProgramTimelineProps {
  title?: string;
  programItems: IProgramItem[];
  themeColors?: Record<string, string>;
}

const ProgramTimeline = ({ title, programItems, themeColors }: ProgramTimelineProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const c = (key: string) => (themeColors?.[key] ? { color: themeColors[key] } : undefined);
  const bg = themeColors?.programBg ? { backgroundColor: themeColors.programBg } : undefined;
  const dotBg = themeColors?.programDotBg;

  return (
    <div ref={ref} className={`bg-sand px-8 pt-4 pb-14 ${inView ? "in-view" : ""}`} style={bg}>
      <p className="ec-reveal text-xs tracking-[0.2em] uppercase text-dust mb-3 text-center" style={{ "--delay": "0s", ...c("programEyebrowColor") } as React.CSSProperties}>
        Le jour J
      </p>
      <h2 className="ec-reveal font-script text-4xl text-(--text-on-light) mb-10 text-center" style={{ "--delay": "0.1s", ...c("programTitleColor") } as React.CSSProperties}>
        {title || "Détails de la soirée"}
      </h2>

      <div className="relative pl-7 border-l border-(--primary)/35">
        {programItems.map((item, index) => (
          <div
            key={`${item.time}-${index}`}
            className="ec-reveal relative pb-9 last:pb-0"
            style={{ "--delay": `${0.2 + index * 0.12}s` } as React.CSSProperties}
          >
            <span className="absolute left-[-32.5px] top-1 w-2.25 h-2.25 rounded-full bg-(--primary)" style={dotBg ? { backgroundColor: dotBg } : undefined} />
            <p className="text-[13px] tracking-wide text-(--primary) mb-1" style={c("programTimeColor")}>{item.time}</p>
            <p className="font-medium text-[17px] text-(--text-on-light)" style={c("programLabelColor")}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramTimeline;