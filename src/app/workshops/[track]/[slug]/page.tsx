import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  getWorkshopDetail,
  getWorkshopItems,
  trackEntryHref,
  trackHref,
  workshopHref,
  type AsyncWorkshop,
  type WorkshopDetail,
} from "@/lib/workshops";
import { talkDateText } from "@/lib/talk-format";
import { buildMetadata } from "@/lib/seo";
import { WorkshopProgressProvider } from "@/components/workshops/WorkshopProgress";
import { CompletionPanel } from "@/components/workshops/CompletionPanel";
import { SetupBlock } from "@/components/workshops/GuideRoute";
import { LEVEL_LABEL, LevelNode } from "@/components/workshops/level";
import { SessionMaterial } from "@/components/workshops/SessionMaterial";
import { DetailHero } from "@/components/workshops/DetailHero";
import { GuideContent } from "@/components/workshops/GuideContent";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;
const CONTAINER = "mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12";
const LABEL = "font-mono text-[.7rem] uppercase tracking-[.16em] text-text3";

// Se pre-renderizan todas al compilar y se revalidan cada hora (un taller pasa a "pasado" por su fecha). El progreso de
// la persona se pide desde el cliente, así que la página sigue siendo estática.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getWorkshopItems()).map(({ track, slug }) => ({ track, slug }));
}

export async function generateMetadata({ params }: PageProps<"/workshops/[track]/[slug]">): Promise<Metadata> {
  const { track, slug } = await params;
  const detail = await getWorkshopDetail(track, slug);
  if (!detail) return buildMetadata({ title: "Taller no encontrado", description: "", path: `/workshops/${track}/${slug}` });

  const item = detail.kind === "guide" ? detail.guide : detail.workshop;
  return buildMetadata({
    title: `${item.title}, ${detail.track.title}, AIR Club UdeSA`,
    description: item.summary,
    path: workshopHref(item),
  });
}

/**
 * La página de un taller: solo ese taller, con todo lo que hace falta para hacerlo y el panel para marcarlo como hecho.
 * Vive adentro de su workshop (/workshops/<workshop>/<taller>): "volver" lleva a su caja en la página del workshop (y el
 * botón atrás del navegador hace lo mismo).
 */
export default async function WorkshopPage({ params }: PageProps<"/workshops/[track]/[slug]">) {
  const { track: trackKey, slug } = await params;
  const detail = await getWorkshopDetail(trackKey, slug);
  if (!detail) notFound();

  return (
    <WorkshopProgressProvider>
      <article>
        {detail.kind === "guide" ? <GuideDetail detail={detail} /> : <PastDetail detail={detail} />}
      </article>
    </WorkshopProgressProvider>
  );
}

// Si el workshop tiene un solo taller, su caja lleva directo acá (trackEntryHref): "volver" va a esa caja y no a la página
// intermedia del workshop, que se salteó al entrar.
const skipsTrackPage = (detail: WorkshopDetail) => trackEntryHref(detail.track) !== trackHref(detail.track.key);

function backLink(detail: WorkshopDetail) {
  return { href: backHref(detail), label: skipsTrackPage(detail) ? "Todos los workshops" : detail.track.title };
}

function backHref(detail: WorkshopDetail) {
  if (skipsTrackPage(detail)) return `/workshops#workshop-${detail.track.key}`;
  const anchor = detail.kind === "guide" ? `semana-${detail.guide.week}` : `taller-${detail.workshop.slug}`;
  return `${trackHref(detail.track.key)}#${anchor}`;
}

/* ---------- Guía asincrónica ---------- */

function GuideDetail({ detail }: { detail: Extract<WorkshopDetail, { kind: "guide" }> }) {
  const { guide: w, track, requires, prev, next } = detail;

  return (
    <>
      <DetailHero
        number={w.week}
        srLabel={`Semana ${w.week}: `}
        title={w.title}
        text={w.summary}
        back={backLink(detail)}
        tone="dark"
        kicker={`Guía ${w.week} de ${String(track.guides.length).padStart(2, "0")}`}
      />

      <div className={`${CONTAINER} grid grid-cols-1 gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-4`}>
        <div className="min-w-0 lg:col-span-7">
          <h2 className={LABEL}>Al terminar</h2>
          <p className="mt-3 max-w-[40ch] text-balance font-display text-[clamp(1.35rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-tight text-text">
            {w.outcome}
          </p>

          {(w.guideUrl || w.codeUrl) && (
            <>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {w.guideUrl && (
                  <a
                    href={w.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
                  >
                    <span>Abrir la guía</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                    {NEW_TAB_HINT}
                  </a>
                )}
                {w.codeUrl && (
                  <a
                    href={w.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-text px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson hover:bg-crimson hover:text-white"
                  >
                    <span>Ver el código</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                    {NEW_TAB_HINT}
                  </a>
                )}
              </div>
              <p className="mt-4 max-w-[56ch] text-[.92rem] leading-[1.65] text-text3">
                {w.guideUrl && w.codeUrl
                  ? "La guía paso a paso y el código se abren en otra pestaña."
                  : w.guideUrl
                    ? "La guía paso a paso se abre en otra pestaña."
                    : "El código se abre en otra pestaña."}
              </p>
            </>
          )}

          {w.ros2Package && (
            <SetupBlock
              ros2Package={w.ros2Package}
              caption={prev ? `Compilar la semana ${w.week}` : "Antes de empezar"}
              repoUrl={prev ? undefined : track.repoUrl}
              className="mt-10 block"
            />
          )}

          {/* Contenido propio (#69): la guía entera, acá adentro. */}
          {w.content.length > 0 && (
            <div className="mt-14 border-t border-text pt-10">
              <GuideContent blocks={w.content} />
            </div>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-10 lg:sticky lg:top-28 lg:col-span-4 lg:col-start-9 lg:self-start">
          <CompletionPanel
            slug={w.slug}
            href={workshopHref(w)}
            next={next && { href: workshopHref(next), label: `${next.week} · ${next.title}` }}
          />

          <dl className="grid grid-cols-1 border-t border-text">
            <Fact label="Duración">{w.durationLabel}</Fact>
            <Fact label="Nivel">
              <span className="inline-flex items-center gap-2">
                <LevelNode level={w.level} />
                {LEVEL_LABEL[w.level]}
              </span>
            </Fact>
            {w.ros2Package && (
              <Fact label="Paquete">
                <code className="font-mono text-[.9rem] [overflow-wrap:anywhere]">{w.ros2Package}</code>
              </Fact>
            )}
            {(track.setupUrl || requires.length > 0) && (
              <Fact label="Necesitás">
                <ul className="flex flex-col gap-1">
                  {track.setupUrl && (
                    <li>
                      <a
                        href={track.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-text/30 underline-offset-4 transition-colors hover:text-crimson-text"
                      >
                        El setup del simulador
                        {NEW_TAB_HINT}
                      </a>
                    </li>
                  )}
                  {requires.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={workshopHref(r)}
                        className="underline decoration-text/30 underline-offset-4 transition-colors hover:text-crimson-text"
                      >
                        {r.week} · {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Fact>
            )}
          </dl>
        </aside>
      </div>

      {(prev || next) && (
        <nav aria-label="Otros talleres del workshop" className={`${CONTAINER} pb-16 md:pb-24`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prev ? <Neighbor guide={prev} dir="prev" /> : <span className="hidden sm:block" />}
            {next && <Neighbor guide={next} dir="next" />}
          </div>
        </nav>
      )}
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b border-text/20 py-4">
      <dt className={`${LABEL} pt-0.5`}>{label}</dt>
      <dd className="text-[.98rem] leading-snug text-text">{children}</dd>
    </div>
  );
}

function Neighbor({ guide, dir }: { guide: AsyncWorkshop; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  return (
    <Link
      href={workshopHref(guide)}
      className={`group flex min-h-[10rem] flex-col justify-between gap-6 border border-text p-6 transition-colors hover:border-crimson-text sm:p-8 ${
        isNext ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className={`inline-flex items-center gap-2 ${LABEL} transition-colors group-hover:text-crimson-text`}>
        {!isNext && <ArrowLeft size={14} aria-hidden="true" />}
        {isNext ? "Siguiente" : "Anterior"}
        {isNext && <ArrowRight size={14} aria-hidden="true" />}
      </span>
      <span className={`flex items-end gap-4 ${isNext ? "sm:flex-row-reverse" : ""}`}>
        <span className="font-logo text-[3.4rem] leading-[0.8] text-text" aria-hidden="true">
          {guide.week}
        </span>
        <span className="pb-1 font-display text-[1.3rem] font-bold leading-[1.15] tracking-tight text-text transition-colors group-hover:text-crimson-text">
          {guide.title}
        </span>
      </span>
    </Link>
  );
}

/* ---------- Taller presencial que ya pasó ---------- */

/**
 * Con el formato de una charla de /talks: arriba el número del taller en Anton (como el número de semana en una guía) y
 * debajo el material (fotos, Resumen / Diapositivas / Video). Al costado, marcarlo como hecho y los datos, con la fecha.
 */
function PastDetail({ detail }: { detail: Extract<WorkshopDetail, { kind: "past" }> }) {
  const { workshop: w, track } = detail;
  // Por orden cronológico dentro del workshop: el primero que se hizo es el 01, así el número no cambia al sumar talleres.
  // Los que todavía no tienen fecha van al final.
  const time = (p: { startsAt?: string }) => (p.startsAt ? Date.parse(p.startsAt) : Infinity);
  const number = String([...track.past].sort((a, b) => time(a) - time(b)).findIndex((p) => p.slug === w.slug) + 1).padStart(2, "0");

  return (
    <>
      <DetailHero
        number={number}
        srLabel={`Taller ${number}: `}
        title={w.title}
        back={backLink(detail)}
        tone="dark"
        kicker={`Taller ${number} de ${String(track.past.length).padStart(2, "0")}`}
      />

      <div className={`${CONTAINER} grid grid-cols-1 gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-4`}>
        <div className="min-w-0 lg:col-span-7">
          <SessionMaterial workshop={w} />
        </div>

        <aside className="flex min-w-0 flex-col gap-10 lg:sticky lg:top-28 lg:col-span-4 lg:col-start-9 lg:self-start">
          <CompletionPanel slug={w.slug} href={workshopHref(w)} question="¿Viniste?" />

          <dl className="grid grid-cols-1 border-t border-text">
            <Fact label="Fecha">{w.startsAt ? talkDateText(w.startsAt, w.dateLabel) : (w.dateLabel ?? "Taller presencial")}</Fact>
            {w.location && <Fact label="Aula">{w.location}</Fact>}
            {w.instructor && <Fact label="A cargo de">{w.instructor}</Fact>}
          </dl>
        </aside>
      </div>
    </>
  );
}
