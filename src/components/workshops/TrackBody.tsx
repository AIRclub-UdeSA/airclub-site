import type { WorkshopTrack } from "@/lib/workshops";
import { totalHoursLabel, trackHref } from "@/lib/workshops";
import { GuideRoute } from "./GuideRoute";
import { PastWorkshopList } from "./PastWorkshops";
import { SectionLayout } from "./SectionLayout";
import { UpcomingWorkshops } from "./UpcomingWorkshops";

const CONTAINER = "mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12";

/** A qué sección baja el botón del encabezado: la primera que el workshop tiene. */
export function firstSectionId(track: WorkshopTrack): string {
  return track.upcoming.length > 0 ? "proximos" : track.guides.length > 0 ? "guias" : "presenciales";
}

/**
 * El molde de la página de CUALQUIER workshop. Después del encabezado (que pone la página), cada cosa que el workshop
 * tiene va en su propia banda a todo el ancho, en este orden y con el mismo formato: próximos talleres (lo que tiene
 * fecha, bien a la vista), guías a tu ritmo (la ruta) y talleres presenciales que ya pasaron. Las bandas alternan
 * `bg2` / `bg` y solo aparecen las que el workshop tiene, así que sirve igual con guías, con presenciales o con las dos.
 */
export function TrackBody({ track }: { track: WorkshopTrack }) {
  const sections: { key: string; own?: boolean; node: React.ReactNode }[] = [];

  if (track.upcoming.length > 0) {
    // UpcomingWorkshops trae su propio título, contenedor y margen de abajo.
    sections.push({ key: "proximos", own: true, node: <UpcomingWorkshops workshops={track.upcoming} /> });
  }
  if (track.guides.length > 0) {
    sections.push({
      key: "guias",
      node: (
        <>
          <GuideRoute
            guides={track.guides}
            totalHours={totalHoursLabel(track.guides)}
            back={trackHref(track.key)}
            setupUrl={track.setupUrl}
            repoUrl={track.repoUrl}
          />
        </>
      ),
    });
  }
  if (track.past.length > 0) {
    sections.push({
      key: "presenciales",
      node: (
        <SectionLayout title="Talleres presenciales" intro="Los que ya pasaron, con sus fotos, diapositivas y lo que se vio.">
          <PastWorkshopList workshops={track.past} />
        </SectionLayout>
      ),
    });
  }

  return (
    <>
      {sections.map((s, i) => (
        <section key={s.key} id={s.key === "proximos" ? undefined : s.key} className={`scroll-mt-16 ${i % 2 === 0 ? "bg-bg2" : "bg-bg"}`}>
          {s.own ? (
            <div className="pt-16 md:pt-24">{s.node}</div>
          ) : (
            <div className={`${CONTAINER} py-16 md:py-24`}>{s.node}</div>
          )}
        </section>
      ))}
    </>
  );
}
