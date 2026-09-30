import type { Metadata } from "next";
import Image from "next/image";
import { getCollaborators, getFounders } from "@/lib/team";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";
import { JoinPanel, TeamTile } from "@/components/equipo/TeamTile";
import { JoinSection } from "@/components/equipo/JoinSection";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Equipo, AIR Club UdeSA",
  description: "El equipo del AIR Club UdeSA: sus fundadores y cómo sumarte a la comunidad.",
  path: "/equipo",
});

// Se renderiza en cada request (no estática): el contenido sale de la base y puede cambiar en
// cualquier momento, y ademas next build no tiene acceso a una base real (usa credenciales
// dummy en CI para no exponer secretos).
export const dynamic = "force-dynamic";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:gap-x-4";

export default async function EquipoPage() {
  const [founders, collaborators, community, team] = await Promise.all([
    getFounders(),
    getCollaborators(),
    getContactReason("comunidad"),
    getContactReason("equipo"),
  ]);

  return (
    <>
      {/* Mismo título que /talks (misma altura de letra), una sola línea y centrado. */}
      <header className="pb-10 pt-24 md:pb-14">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
          Equipo
        </h1>
      </header>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <RevealOnScroll>
            <CountHeading n={founders.length} title="Fundadores" />

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-4">
              <figure className="relative aspect-[3/4] overflow-hidden border border-text bg-bg2 lg:col-span-4 lg:aspect-auto lg:min-h-[28rem]">
                <Image
                  src="/equipo.jpg"
                  alt="Fundadores del AIR Club UdeSA con sus robots"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
                <figcaption className="absolute bottom-4 left-4 -rotate-3 border border-text bg-bg px-3 py-2 font-mono text-[.7rem] font-semibold uppercase tracking-[.16em] text-text">
                  Los fundadores del AIR Club
                </figcaption>
              </figure>

              <ul className={`${GRID} content-start lg:col-span-8`}>
                {founders.map((member) => (
                  <TeamTile key={member.name} member={member} />
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* La foto grupal de colaboradores se suma acá cuando esté. */}
      {collaborators.length > 0 && (
        <section className="bg-bg2 py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
            <RevealOnScroll>
              <CountHeading
                n={collaborators.length}
                title="Colaboradores"
                aside={
                  <p className="pb-1.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.18em] text-mauve lg:ml-auto">
                    Segundo semestre 2026
                  </p>
                }
              />

              <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-4">
                <ul className={`${GRID} content-start lg:col-span-8 lg:col-start-5 lg:row-start-1`}>
                  {collaborators.map((member) => (
                    <TeamTile key={member.name} member={member} />
                  ))}
                </ul>
                <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
                  <JoinPanel />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      <JoinSection community={community} team={team} />
    </>
  );
}
