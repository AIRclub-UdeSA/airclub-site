import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { workshopHref, type PastWorkshop } from "@/lib/workshops";
import { talkDateText } from "@/lib/talk-format";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";
import { DoneBadge } from "./DoneBadge";

// Un único enlace por tarjeta la cubre entera (enlace estirado).
const STRETCH = "after:absolute after:inset-0 after:content-['']";

/**
 * Talleres presenciales que ya pasaron: el más reciente primero y más grande (tarjeta líder + módulos); si hay uno solo,
 * un panel horizontal. Cada tarjeta lleva a la página del taller. La foto va a color; sin foto, la trama diagonal de
 * "lugar reservado" (no se rellena con fotos de relleno).
 */
export function PastWorkshopList({ workshops }: { workshops: PastWorkshop[] }) {
  if (workshops.length === 1) return <PastTile workshop={workshops[0]} wide />;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      {workshops.map((w, i) => (
        <li key={w.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}>
          <PastTile workshop={w} lead={i === 0} />
        </li>
      ))}
    </ul>
  );
}

/** Talleres-evento pasados que no tienen línea (`track`). Solo aparece si hay alguno. */
export function UntrackedArchive({ workshops, className = "" }: { workshops: PastWorkshop[]; className?: string }) {
  if (workshops.length === 0) return null;

  return (
    <section id="archivo" className={`scroll-mt-24 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          <CountHeading n={workshops.length} title="Otros talleres" />
          <div className="mt-8">
            <PastWorkshopList workshops={workshops} />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function PastTile({ workshop: w, lead = false, wide = false }: { workshop: PastWorkshop; lead?: boolean; wide?: boolean }) {
  return (
    <article
      className={`group relative grid h-full min-w-0 grid-cols-1 border border-text bg-bg text-text transition-colors hover:border-crimson-text ${
        wide ? "lg:grid-cols-12" : "grid-rows-[auto_1fr]"
      }`}
    >
      <div
        className={`relative overflow-hidden border-text bg-bg2 ${
          wide
            ? "aspect-[16/9] border-b lg:col-span-5 lg:aspect-auto lg:min-h-[18rem] lg:border-b-0 lg:border-r"
            : `border-b ${lead ? "aspect-[4/3]" : "aspect-[16/9]"}`
        }`}
      >
        {w.imageUrl ? (
          <Image
            src={w.imageUrl}
            alt={`Registro del taller ${w.title}`}
            fill
            sizes={
              wide || lead
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover"
          />
        ) : (
          <div className="talk-hatch absolute inset-0 text-text" aria-hidden="true" />
        )}
        <DoneBadge slug={w.slug} className="absolute left-4 top-4" />
      </div>

      <div className={`flex min-w-0 flex-col gap-3 p-5 sm:p-7 ${wide ? "lg:col-span-7 lg:justify-center lg:p-10" : ""}`}>
        <p className="font-mono text-[.72rem] uppercase tracking-[.14em] text-text3">
          {w.startsAt ? talkDateText(w.startsAt, w.dateLabel) : "Taller presencial"}
        </p>
        <h3 className="font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-bold leading-[1.1] tracking-tight transition-colors group-hover:text-crimson-text">
          <Link href={workshopHref(w.slug)} className={`${STRETCH} focus-visible:outline-none`}>
            {w.title}
          </Link>
        </h3>
        <p className="max-w-[60ch] text-[.98rem] leading-[1.65] text-text2">{w.summary}</p>
        <span
          className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.14em] transition-colors group-hover:text-crimson-text"
          aria-hidden="true"
        >
          Ver taller
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}
