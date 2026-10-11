import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { InPersonWorkshop } from "@/lib/workshops";
import { talkDateText } from "@/lib/talk-format";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Talleres presenciales que ya pasaron, el más reciente primero y más grande (tarjeta líder + módulos). Solo se muestra
 * cuando hay alguno: no se rellena con fotos de relleno. La foto es la `imageUrl` del evento y va a color; sin foto, la
 * trama diagonal.
 */
export function WorkshopArchive({ workshops }: { workshops: InPersonWorkshop[] }) {
  if (workshops.length === 0) return null;

  return (
    <section id="archivo" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          <CountHeading n={workshops.length} title="Archivo" />

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {workshops.map((w, i) => (
              <li key={w.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}>
                <ArchiveTile workshop={w} lead={i === 0} />
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function ArchiveTile({ workshop: w, lead }: { workshop: InPersonWorkshop; lead: boolean }) {
  return (
    <article className="flex h-full min-w-0 flex-col border border-text bg-bg text-text">
      <div className={`relative overflow-hidden border-b border-text bg-bg2 ${lead ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
        {w.imageUrl ? (
          <Image
            src={w.imageUrl}
            alt={`Registro del taller ${w.title}`}
            fill
            sizes={lead ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover"
          />
        ) : (
          <div className="talk-hatch absolute inset-0 text-text" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-7">
        <p className="font-mono text-[.72rem] uppercase tracking-[.14em] text-text3">
          {talkDateText(w.startsAt.toISOString(), w.dateLabel)}
        </p>
        <h3 className="font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-bold leading-[1.1] tracking-tight">{w.title}</h3>
        <p className="max-w-[60ch] text-[.98rem] leading-[1.65] text-text2">{w.description}</p>
        {w.externalUrl && (
          <a
            href={w.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 self-start pt-2 font-mono text-[.74rem] uppercase tracking-[.12em] underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
          >
            {w.ctaLabel ?? "Material del taller"}
            <ArrowUpRight size={13} aria-hidden="true" />
            {NEW_TAB_HINT}
          </a>
        )}
      </div>
    </article>
  );
}
