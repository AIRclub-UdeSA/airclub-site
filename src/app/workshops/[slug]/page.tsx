import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getWorkshopDetail, getWorkshopSlugs, JAR_SITE_URL, workshopHref, type AsyncWorkshop, type WorkshopDetail } from "@/lib/workshops";
import { talkDateText } from "@/lib/talk-format";
import { buildMetadata } from "@/lib/seo";
import { WorkshopProgressProvider } from "@/components/workshops/WorkshopProgress";
import { CompletionPanel } from "@/components/workshops/CompletionPanel";
import { SetupBlock } from "@/components/workshops/GuideRoute";
import { LEVEL_LABEL, LevelNode } from "@/components/workshops/level";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;
const CONTAINER = "mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12";
const KICKER = "font-mono text-[.78rem] font-semibold uppercase tracking-[.16em] text-mauve";
const LABEL = "font-mono text-[.7rem] uppercase tracking-[.16em] text-text3";

// Se pre-renderizan todas al compilar y se revalidan cada hora (un taller pasa a "pasado" por su fecha). El progreso de
// la persona se pide desde el cliente, así que la página sigue siendo estática.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getWorkshopSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getWorkshopDetail(slug);
  if (!detail) return buildMetadata({ title: "Workshop no encontrado", description: "", path: workshopHref(slug) });

  const { title, summary } = detail.kind === "guide" ? detail.guide : detail.workshop;
  return buildMetadata({ title: `${title}, Workshops AIR Club UdeSA`, description: summary, path: workshopHref(slug) });
}

/**
 * La página de un workshop: solo ese workshop, con todo lo que hace falta para hacerlo y el panel para marcarlo como
 * hecho. "Volver" lleva a su tarjeta en /workshops (y el botón atrás del navegador hace lo mismo).
 */
export default async function WorkshopPage({ params }: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;
  const detail = await getWorkshopDetail(slug);
  if (!detail) notFound();

  return (
    <WorkshopProgressProvider>
      <article className="pb-16 pt-28 md:pb-24 md:pt-32">
        <div className={CONTAINER}>
          <Link
            href={backHref(detail)}
            className="inline-flex items-center gap-2 font-mono text-[.74rem] uppercase tracking-[.14em] text-text2 transition-colors hover:text-crimson-text"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Todos los workshops
          </Link>
        </div>

        {detail.kind === "guide" ? <GuideDetail detail={detail} /> : <PastDetail detail={detail} />}
      </article>
    </WorkshopProgressProvider>
  );
}

function backHref(detail: WorkshopDetail) {
  if (detail.kind === "guide") return `/workshops#semana-${detail.guide.week}`;
  return detail.track ? `/workshops#linea-${detail.track.key}` : "/workshops#archivo";
}

/* ---------- Guía asincrónica ---------- */

function GuideDetail({ detail }: { detail: Extract<WorkshopDetail, { kind: "guide" }> }) {
  const { guide: w, track, requires, prev, next } = detail;

  return (
    <>
      <header className={`${CONTAINER} mt-10 md:mt-14`}>
        <p className={KICKER}>
          {track.title} · Semana {w.week}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <span className="font-logo text-[clamp(6rem,16vw,14rem)] leading-[0.8] text-crimson-text" aria-hidden="true">
            {w.week}
          </span>
          <h1 className="min-w-0 pb-2 font-display text-[clamp(1.6rem,5.4vw,4.4rem)] font-black uppercase leading-[0.98] tracking-tight text-text [overflow-wrap:anywhere]">
            <span className="sr-only">Semana {w.week}: </span>
            {w.title}
          </h1>
        </div>
        <p className="mt-8 max-w-[62ch] text-[1.15rem] leading-[1.7] text-text2">{w.summary}</p>
      </header>

      <div className={`${CONTAINER} mt-12 grid grid-cols-1 gap-12 md:mt-16 lg:grid-cols-12 lg:gap-4`}>
        <div className="min-w-0 lg:col-span-7">
          <h2 className={LABEL}>Al terminar</h2>
          <p className="mt-3 max-w-[40ch] text-balance font-display text-[clamp(1.35rem,2.4vw,2rem)] font-bold leading-[1.2] tracking-tight text-text">
            {w.outcome}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
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
          </div>
          <p className="mt-4 max-w-[56ch] text-[.92rem] leading-[1.65] text-text3">
            La guía paso a paso está en el sitio del Challenge JAR; el código, en el repositorio jar_workshops.
          </p>

          <SetupBlock
            ros2Package={w.ros2Package}
            caption={w.week === "01" ? "Antes de empezar" : `Compilar la semana ${w.week}`}
            clone={w.week === "01"}
            className="mt-10 block"
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-10 lg:col-span-4 lg:col-start-9">
          <CompletionPanel
            slug={w.slug}
            href={workshopHref(w.slug)}
            next={next && { href: workshopHref(next.slug), label: `${next.week} · ${next.title}` }}
          />

          <dl className="grid grid-cols-1 border-t border-text">
            <Fact label="Duración">{w.durationLabel}</Fact>
            <Fact label="Nivel">
              <span className="inline-flex items-center gap-2">
                <LevelNode level={w.level} />
                {LEVEL_LABEL[w.level]}
              </span>
            </Fact>
            <Fact label="Paquete">
              <code className="font-mono text-[.9rem] [overflow-wrap:anywhere]">{w.ros2Package}</code>
            </Fact>
            <Fact label="Necesitás">
              <ul className="flex flex-col gap-1">
                <li>
                  <a
                    href={`${JAR_SITE_URL}/setup/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-text/30 underline-offset-4 transition-colors hover:text-crimson-text"
                  >
                    El setup del simulador
                    {NEW_TAB_HINT}
                  </a>
                </li>
                {requires.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={workshopHref(r.slug)}
                      className="underline decoration-text/30 underline-offset-4 transition-colors hover:text-crimson-text"
                    >
                      {r.week} · {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Fact>
          </dl>
        </aside>
      </div>

      {(prev || next) && (
        <nav aria-label="Otros workshops de la línea" className={`${CONTAINER} mt-16 md:mt-24`}>
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
      href={workshopHref(guide.slug)}
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

function PastDetail({ detail }: { detail: Extract<WorkshopDetail, { kind: "past" }> }) {
  const { workshop: w, track } = detail;

  return (
    <>
      <header className={`${CONTAINER} mt-10 md:mt-14`}>
        <p className={KICKER}>{track ? `${track.title} · Taller presencial` : "Taller presencial"}</p>
        <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(1.8rem,6vw,5rem)] font-black uppercase leading-[0.98] tracking-tight text-text [overflow-wrap:anywhere]">
          {w.title}
        </h1>
      </header>

      <div className={`${CONTAINER} mt-12 grid grid-cols-1 gap-12 md:mt-16 lg:grid-cols-12 lg:gap-4`}>
        <div className="min-w-0 lg:col-span-7">
          <figure className="relative aspect-[16/10] overflow-hidden border border-text bg-bg2">
            {w.imageUrl ? (
              <Image
                src={w.imageUrl}
                alt={`Registro del taller ${w.title}`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            ) : (
              <div className="talk-hatch absolute inset-0 text-text" aria-hidden="true" />
            )}
          </figure>
          <p className="mt-8 max-w-[62ch] text-[1.1rem] leading-[1.7] text-text2">{w.summary}</p>
          {w.url && (
            <a
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-text px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson hover:bg-crimson hover:text-white"
            >
              <span>{w.urlLabel ?? "Material del taller"}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
              {NEW_TAB_HINT}
            </a>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-10 lg:col-span-4 lg:col-start-9">
          <CompletionPanel slug={w.slug} href={workshopHref(w.slug)} question="¿Viniste?" />

          {(w.startsAt || w.location || w.instructor) && (
            <dl className="grid grid-cols-1 border-t border-text">
              {w.startsAt && <Fact label="Fecha">{talkDateText(w.startsAt, w.dateLabel)}</Fact>}
              {w.location && <Fact label="Lugar">{w.location}</Fact>}
              {w.instructor && <Fact label="A cargo de">{w.instructor}</Fact>}
            </dl>
          )}
        </aside>
      </div>
    </>
  );
}
