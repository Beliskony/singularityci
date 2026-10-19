"use client";

import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";

interface Props {
  eventDate: Date;
  themeColors?: Record<string, string>;
}

const WEEKDAYS_FR = ["L", "M", "M", "J", "V", "S", "D"];

function buildMonthGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // 0 = dimanche -> on veut une semaine commençant lundi
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getCountdown(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CalendarCountdownSection({ eventDate, themeColors = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  // IMPORTANT : ne jamais calculer le countdown pendant le rendu serveur —
  // Date.now() change entre le SSR et l'hydratation côté client, ce qui
  // provoque un mismatch React ("55" côté serveur vs "56" côté client).
  // On initialise à null et on ne calcule qu'après le montage (useEffect),
  // donc le HTML envoyé par le serveur et le premier rendu client sont
  // strictement identiques (le vrai chiffre apparaît une fraction de
  // seconde après, invisible à l'oeil).
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setCountdown(getCountdown(eventDate));
    const id = setInterval(() => setCountdown(getCountdown(eventDate)), 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  const bg = themeColors.calendarBg ?? "#4a0e1a";
  const titleColor = themeColors.calendarTitleColor ?? "#d8bd80";
  const dayColor = themeColors.calendarDayColor ?? "#f4ead9";
  const mutedColor = themeColors.calendarMutedColor ?? "rgba(244,234,217,0.35)";
  const activeBg = themeColors.calendarActiveColor ?? "#c9a24a";

  const grid = buildMonthGrid(eventDate);
  const targetDay = eventDate.getDate();

  const countdownUnits = [
    { label: "Jours", value: countdown?.days },
    { label: "Heures", value: countdown?.hours },
    { label: "Min", value: countdown?.minutes },
    { label: "Sec", value: countdown?.seconds },
  ];

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-sm ${isInView ? "fl-in" : ""}`}>
        <h3
          className="text-center text-xs uppercase tracking-[0.3em]"
          style={{ color: titleColor }}
        >
          Réservez la date
        </h3>

        {/* grille calendrier */}
        <div className="mt-8 rounded-sm border border-[#c9a24a]/30 p-5">
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAYS_FR.map((wd, i) => (
              <span key={i} className="text-[10px] uppercase" style={{ color: mutedColor }}>
                {wd}
              </span>
            ))}
            {grid.map((d, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-0.5 py-1">
                {d === null ? null : d === targetDay ? (
                  <>
                    <span className="font-serif text-sm font-semibold" style={{ color: activeBg }}>
                      {d}
                    </span>
                    {/* petit coeur sous la date, comme sur le faire-part de référence —
                        plus fidèle qu'un simple pastille pleine */}
                    <span className="text-[9px] leading-none" style={{ color: activeBg }}>
                      ♥
                    </span>
                  </>
                ) : (
                  <span className="font-serif text-sm" style={{ color: dayColor }}>
                    {d}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* compte à rebours */}
        <div className="mt-10 grid grid-cols-4 gap-3 text-center">
          {countdownUnits.map((u) => (
            <div key={u.label}>
              <div
                className="font-serif text-2xl font-semibold"
                style={{ color: dayColor }}
              >
                {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>
                {u.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}