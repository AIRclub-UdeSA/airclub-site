import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUserProfile } from "@/lib/perfil/require-profile";
import { prisma } from "@/lib/prisma";
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
 * Pestaña Aprendizaje del perfil: por cada línea de workshops, cuánto lleva la persona y por dónde seguir, y la lista de
 * lo que marcó como hecho (con la fecha en que lo marcó). Lee lo mismo que la ruta de /workshops (routeStates), así las
 * dos pantallas cuentan igual.
 */
export default async function AprendizajePage() {
  const profile = await requireUserProfile();
  const [rows, tracks] = await Promise.all([
    prisma.workshopCompletion.findMany({ where: { email: profile.email }, orderBy: { completedAt: "desc" } }),
    getWorkshopTracks(),
  ]);
  const completedAt = new Map(rows.map((r) => [r.workshopSlug, r.completedAt]));
  const completed = new Set(completedAt.keys());

  // Los workshops con algo para marcar (guías o talleres que ya pasaron), en el orden de las cajas de /workshops.
  const groups = tracks.filter((t) => t.guides.length + t.past.length > 0);
  const total = groups.reduce((n, t) => n + doneItems(t, completedAt).length, 0);

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

      {groups.map((t) => (
        <TrackProgress key={t.key} track={t} completed={completed} completedAt={completedAt} />
      ))}
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

  return (
    <section className="border-t border-text pt-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="font-display text-[clamp(1.2rem,4.4vw,2rem)] font-black uppercase leading-[0.98] tracking-tight text-text">
          <Link href={trackHref(track.key)} className="transition-colors hover:text-crimson-text">
            {title}
          </Link>
        </h2>
        <p className="font-logo text-[2.8rem] leading-[0.8] text-crimson-text">
          {String(done.length).padStart(2, "0")}
          <span className="text-text3">/{String(count).padStart(2, "0")}</span>
        </p>
      </div>

      {guides.length > 0 && (
        <ol className="mt-5 flex flex-wrap gap-1.5" aria-label={`Progreso en ${title}`}>
          {guides.map((g) => {
            const state = states.get(g.slug);
            return (
              <li key={g.slug}>
                <Link
                  href={workshopHref(g)}
                  title={`${g.week} · ${g.title}`}
                  className={`block size-6 border transition-colors ${
                    state === "done"
                      ? "border-text/25 bg-text/20"
                      : state === "next"
                        ? "border-crimson bg-crimson"
                        : "border-text/40 hover:border-crimson-text"
                  }`}
                >
                  <span className="sr-only">
                    Semana {g.week}: {state === "done" ? "hecho" : state === "next" ? "siguiente" : "pendiente"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {next && (
        <Link
          href={workshopHref(next)}
          className="group mt-6 flex items-center justify-between gap-6 bg-crimson p-5 text-white transition-colors hover:bg-crimson-hover sm:p-6"
        >
          <span className="flex min-w-0 items-end gap-4">
            <span className="font-logo text-[3rem] leading-[0.8]" aria-hidden="true">
              {next.week}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[.7rem] uppercase tracking-[.16em] text-white/80">
                {done.length > 0 ? "Seguí con" : "Empezá con"}
              </span>
              <span className="block font-display text-[1.25rem] font-bold leading-[1.15] tracking-tight">{next.title}</span>
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
        </Link>
      )}

      {done.length > 0 && (
        <>
          <h3 className={`${LABEL} mt-8`}>Hechos</h3>
          <ul className="mt-2">
            {done.map((d) => (
              <li key={d.slug} className="border-b border-text/15">
                <Link
                  href={d.href}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                >
                  <span className="text-[1rem] text-text transition-colors group-hover:text-crimson-text">
                    {d.code && <span className="mr-3 font-mono text-[.82rem] text-text3">{d.code}</span>}
                    {d.title}
                  </span>
                  <span className="font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">{formatDay(d.completedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
