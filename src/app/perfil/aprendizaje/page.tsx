import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { requireUserProfile } from "@/lib/perfil/require-profile";
import { completionsOf } from "@/lib/workshop-completions";
import { getWorkshopTracks, trackHref, workshopHref, type WorkshopTrack } from "@/lib/workshops";
import { routeStates } from "@/lib/workshop-progress";
import { PerfilTabs } from "@/components/perfil/PerfilTabs";

export const metadata: Metadata = {
  title: "Mi aprendizaje, AIR Club UdeSA",
  robots: { index: false, follow: false },
};

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const LABEL = "font-mono text-[.7rem] uppercase tracking-[.16em] text-text3";

const formatDay = (d: Date) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" }).format(d);

type DoneItem = { slug: string; href: string; code?: string; title: string; completedAt: Date };

/**
 * Pestaña Aprendizaje del perfil: solo los workshops donde la persona ya hizo algo, cada uno como una tarjeta plegada
 * (título y cuánto lleva). Al desplegarla, los talleres que hizo (con la fecha en que los marcó) y por dónde seguir; el
 * resto de los talleres no se lista acá, se ve entrando al workshop. "El siguiente" sale de routeStates, igual que en la
 * ruta de /workshops, así las dos pantallas cuentan igual.
 */
export default async function AprendizajePage() {
  const profile = await requireUserProfile();
  // Lo marcado a mano más los presenciales terminados a los que se inscribió (#70).
  const [completedAt, tracks] = await Promise.all([completionsOf(profile.email), getWorkshopTracks()]);
  const completed = new Set(completedAt.keys());

  // Solo los workshops donde hizo algo, en el orden de las cajas de /workshops.
  const groups = tracks.filter((t) => doneItems(t, completedAt).length > 0);
  const total = groups.length;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-crimson-text">{profile.email}</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.2rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
          Mi perfil
        </h1>
      </div>
      <PerfilTabs active="/perfil/aprendizaje" />

      {total === 0 && (
        <section className="relative isolate overflow-hidden border border-text p-6 sm:p-8">
          <div
            className="talk-hatch absolute inset-0 -z-10 text-text [mask-image:linear-gradient(to_left,black,transparent_70%)]"
            aria-hidden="true"
          />
          <h2 className="font-display text-[1.6rem] font-bold leading-[1.15] tracking-tight text-text">Todavía no marcaste ningún workshop</h2>
          <p className="mt-3 max-w-[50ch] text-[.98rem] leading-[1.65] text-text2">
            Cuando termines uno, marcalo como hecho en su página y va a aparecer acá, con el siguiente que te toca.
          </p>
          <Link
            href="/workshops"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
          >
            <span>Ver los workshops</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      )}

      {groups.length > 0 && (
        <section>
          <h2 className={LABEL}>{groups.length === 1 ? "Workshop en el que avanzaste" : "Workshops en los que avanzaste"}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {groups.map((t) => (
              <li key={t.key}>
                <TrackProgress track={t} completed={completed} completedAt={completedAt} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function doneItems(track: WorkshopTrack, completedAt: Map<string, Date>): DoneItem[] {
  const items: DoneItem[] = [
    ...track.guides.map((g) => ({ slug: g.slug, href: workshopHref(g), code: g.week, title: g.title })),
    ...track.past.map((w) => ({ slug: w.slug, href: workshopHref(w), title: w.title })),
  ].flatMap((i) => {
    const at = completedAt.get(i.slug);
    return at ? [{ ...i, completedAt: at }] : [];
  });
  return items.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}

function TrackProgress({
  track,
  completed,
  completedAt,
}: {
  track: WorkshopTrack;
  completed: ReadonlySet<string>;
  completedAt: Map<string, Date>;
}) {
  const { title, guides, past } = track;
  const states = routeStates(
    guides.map((g) => g.slug),
    completed,
  );
  const next = guides.find((g) => states.get(g.slug) === "next");
  const done = doneItems(track, completedAt);
  const count = guides.length + past.length;
  const complete = done.length === count;

  // Plegada por defecto (<details> nativo, sin JS): a la vista solo el título y cuánto lleva.
  return (
    <details className="group border border-text open:border-crimson-text">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-5 transition-colors hover:text-crimson-text sm:p-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-display text-[clamp(1.15rem,4vw,1.6rem)] font-black uppercase leading-[1] tracking-tight [overflow-wrap:anywhere]">
            {title}
          </span>
          <span className="mt-2 block font-mono text-[.7rem] uppercase tracking-[.16em] text-text3">
            {complete ? "Completo" : `${done.length === 1 ? "1 taller hecho" : `${done.length} talleres hechos`}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-4">
          <span className="font-logo text-[2.4rem] leading-[0.8] text-crimson-text">
            {String(done.length).padStart(2, "0")}
            <span className="text-text3">/{String(count).padStart(2, "0")}</span>
          </span>
          <ChevronDown size={20} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </summary>

      <div className="border-t border-text/15 px-5 pb-5 sm:px-6 sm:pb-6">
        <ul>
          {done.map((d) => (
            <li key={d.slug} className="border-b border-text/15">
              <Link href={d.href} className="group/item flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
                <span className="text-[1rem] text-text transition-colors group-hover/item:text-crimson-text">
                  {d.code && <span className="mr-3 font-mono text-[.82rem] text-text3">{d.code}</span>}
                  {d.title}
                </span>
                <span className="font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">{formatDay(d.completedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          {next && (
            <Link
              href={workshopHref(next)}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.74rem] font-semibold uppercase leading-tight tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
            >
              <span>
                Seguí con la {next.week} · {next.title}
              </span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
          <Link
            href={trackHref(track.key)}
            className="font-mono text-[.74rem] uppercase tracking-[.12em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text"
          >
            Ver el workshop
          </Link>
        </div>
      </div>
    </details>
  );
}
