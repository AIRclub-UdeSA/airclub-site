import type { WorkshopTrack } from "@/lib/workshops";
import { totalHoursLabel } from "@/lib/workshops";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";
import { GuideRoute } from "./GuideRoute";
import { PastWorkshopList } from "./PastWorkshops";

/**
 * Una línea de workshops (ROS 2 y robótica, Linux…) en su propia banda a todo el ancho; las bandas alternan `bg`/`bg2`.
 * El conteo en Anton es la cantidad real de talleres de la línea. Adentro va su recorrido asincrónico, si tiene, y sus
 * talleres presenciales que ya pasaron.
 */
export function WorkshopTrackSection({ track, className = "" }: { track: WorkshopTrack; className?: string }) {
  const both = track.guides.length > 0 && track.past.length > 0;

  return (
    <section id={`linea-${track.key}`} className={`scroll-mt-24 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          <CountHeading
            n={track.guides.length + track.past.length}
            title={track.title}
            aside={
              track.label && (
                <p className="pb-1.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.18em] text-mauve lg:ml-auto">
                  {track.label}
                </p>
              )
            }
          />

          {track.summary && (
            <p className="mt-6 max-w-[60ch] text-[1.02rem] leading-[1.7] text-text2">{track.summary}</p>
          )}

          {track.guides.length > 0 && <GuideRoute guides={track.guides} totalHours={totalHoursLabel(track.guides)} />}

          {track.past.length > 0 && (
            <div className={both ? "mt-16" : "mt-8"}>
              {both && (
                <h3 className="mb-6 font-mono text-[.78rem] font-semibold uppercase tracking-[.16em] text-text3">
                  Talleres presenciales
                </h3>
              )}
              <PastWorkshopList workshops={track.past} />
            </div>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
