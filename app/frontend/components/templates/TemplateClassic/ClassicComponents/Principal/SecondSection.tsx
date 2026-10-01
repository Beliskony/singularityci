// ============ TemplateClassic/components/SecondSection.tsx ============
import { useInView } from "../../hooks/useInView";

interface SecondSectionProps {
  eventDate: Date;
  welcomeMessage?: string;
}

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Calcule le nombre de jours du mois et le décalage du 1er jour, à partir de eventDate
function getCalendarInfo(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = dimanche
  const firstDayOffset = (firstDayOfMonth + 6) % 7; // conversion pour démarrer la semaine un lundi
  const monthLabel = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return { daysInMonth, firstDayOffset, monthLabel, weddingDay: date.getDate() };
}

const SecondSection = ({ eventDate, welcomeMessage }: SecondSectionProps) => {
  const { ref, inView } = useInView<HTMLElement>(0.3);
  const { daysInMonth, firstDayOffset, monthLabel, weddingDay } = getCalendarInfo(eventDate);

  return (
    <section
      ref={ref}
      className={`relative isolate flex flex-col bg-primary items-center justify-center w-full bg-brand-sage py-16 px-4 overflow-hidden ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="ss-item flex flex-col items-center justify-center w-full max-w-2xl text-center">
        <p className="text-lg sm:text-xl lg:text-2xl text-ivoire font-medium leading-relaxed">
          {welcomeMessage ||
            "Nous vous invitons à partager ce moment unique de notre vie, et à célébrer avec nous le début de notre éternité."}
        </p>
      </div>

      <div className="ss-item relative w-[75%] h-64 max-w-xs flex justify-center items-center aspect-square mt-10 lg:max-w-65">
        <img
          src="/templates/classic/illustration1.png"
          alt=""
          className="w-[70%] h-full object-cover rounded-full"
        />
      </div>

      <div className="ss-item flex flex-col items-center justify-center w-full max-w-sm text-center">
        <h3 className="text-4xl sm:text-5xl text-ivoire mb-8 font-script capitalize">{monthLabel}</h3>

        <div className="ss-calendar-card w-full">
          <div className="grid grid-cols-7 text-ivoire/80 text-[11px] sm:text-xs font-medium tracking-wide uppercase mb-4">
            {weekDays.map((d) => (
              <span key={d} className="ss-header-item flex items-center justify-center h-6">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-3">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <span key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isWeddingDay = day === weddingDay;

              return (
                <div key={day} className="ss-day-item relative flex items-center justify-center h-9">
                  <span
                    className={`relative z-10 text-sm sm:text-base ${
                      isWeddingDay ? "text-ivoire font-semibold" : "text-ivoire/90"
                    }`}
                  >
                    {day}
                  </span>
                  {isWeddingDay && (
                    <svg
                      viewBox="0 0 64 58"
                      className="absolute w-11 h-12 sm:w-10 sm:h-10 ss-heart-path"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M32 52C14 38 4 26 4 15 4 6 11 1 19 1c6 0 11 4 13 9 2-5 7-9 13-9 8 0 15 5 15 14 0 11-10 23-28 37Z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecondSection;