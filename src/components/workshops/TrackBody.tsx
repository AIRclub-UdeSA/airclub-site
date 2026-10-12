import type { WorkshopTrack } from "@/lib/workshops";
import { totalHoursLabel, trackHref } from "@/lib/workshops";
import { GuideRoute } from "./GuideRoute";
import { PastWorkshopList } from "./PastWorkshops";

/**
 * Lo que hay adentro de un workshop, en su página: su recorrido de guías asincrónicas, si tiene (ROS 2), y sus talleres
 * presenciales que ya pasaron (Linux). El título y el resumen los pone la página.
 */
export function TrackBody({ track }: { track: WorkshopTrack }) {
  const both = track.guides.length > 0 && track.past.length > 0;

  return (
    <>
      {track.guides.length > 0 && (
        <GuideRoute guides={track.guides} totalHours={totalHoursLabel(track.guides)} back={trackHref(track.key)} />
      )}

      {track.past.length > 0 && (
        <div className={both ? "mt-16" : ""}>
          {/* Rótulo solo si el workshop mezcla guías y presenciales: si no, cada tarjeta ya dice "Taller presencial". */}
          {both && (
            <h2 className="mb-6 font-mono text-[.78rem] font-semibold uppercase tracking-[.16em] text-text3">
              Talleres presenciales
            </h2>
          )}
          <PastWorkshopList workshops={track.past} />
        </div>
      )}
    </>
  );
}
