"use client";

import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";

interface CalendarCountdownProps {
  eventDate: Date;
  themeColors?: Record<string, string>;
}

function getMonthMatrix(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return remaining;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const CalendarCountdown = ({ eventDate, themeColors }: CalendarCountdownProps) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const { days, hours, minutes, seconds } = useCountdown(eventDate);
  const weeks = getMonthMatrix(eventDate.getFullYear(), eventDate.getMonth());
  const targetDay = eventDate.getDate();
  const c = (key: string) => (themeColors?.[key] ? { color: themeColors[key] } : undefined);
  const bg = themeColors?.calendarBg ? { backgroundColor: themeColors.calendarBg } : undefined;
  const cardBg = themeColors?.calendarCardBg ? { backgroundColor: themeColors.calendarCardBg } : undefined;

  return (
    <div ref={ref} className={`bg-cream px-8 pt-4 pb-16 ${inView ? "in-view" : ""}`} style={bg}>
      <div className="ec-reveal border border-ink/15 bg-sand/40 p-6" style={{ "--delay": "0s", ...cardBg } as React.CSSProperties}>
        <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="text-[11px] tracking-wide text-dust" style={c("calendarWeekdayColor")}>{d}</span>
          ))}
          {weeks.flat().map((day, i) => (
            <span
              key={i}
              className={`text-[13px] py-1 ${day === targetDay ? "rounded-full" : ""}`}
              style={
                day === targetDay
                  ? { backgroundColor: themeColors?.calendarHighlightBg || "var(--primary)", color: themeColors?.calendarHighlightTextColor || "var(--text-on-dark)" }
                  : day
                  ? { color: themeColors?.calendarDayColor || "rgb(43 36 32 / 0.7)" }
                  : undefined
              }
            >
              {day ?? ""}
            </span>
          ))}
        </div>

        <p className="text-center text-xs tracking-wide text-dust mb-4" style={c("calendarCaptionColor")}>
          {days > 0 ? `${days} jours restants` : "C'est aujourd'hui !"}
        </p>

        <div className="flex justify-center gap-6 mb-6">
          {[
            { label: "jours", value: days },
            { label: "heures", value: hours },
            { label: "min", value: minutes },
            { label: "sec", value: seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-script text-3xl text-(--text-on-light) leading-none" style={c("calendarNumberColor")}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p className="text-[10px] tracking-wide text-dust uppercase mt-1" style={c("calendarLabelColor")}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarCountdown;