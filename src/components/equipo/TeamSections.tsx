import Image from "next/image";
import type { ReactNode } from "react";
import type { GroupPhoto, TeamMemberItem } from "@/lib/team";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";
import { JoinPanel, TeamTile } from "./TeamTile";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:gap-x-4";

/**
 * El cuerpo de /equipo: título, Fundadores (con su foto grupal) y Colaboradores. Lo usan /equipo y
 * /admin/equipo, así el panel se ve exactamente igual que el sitio. El panel pasa `edit` para cambiar
 * cada ficha por su versión editable y sumar los controles de la foto grupal y el "Agregar".
 */
export function TeamSections<T extends TeamMemberItem>({
  founders,
  collaborators,
  foundersPhoto,
  edit,
}: {
  founders: T[];
  collaborators: T[];
  foundersPhoto: GroupPhoto;
  edit?: {
    renderTile: (member: T) => ReactNode;
    foundersPhotoControls: ReactNode;
    addFounder: ReactNode;
    addCollaborator: ReactNode;
  };
}) {
  const tile = (member: T) => (edit ? edit.renderTile(member) : <TeamTile key={member.name} member={member} />);

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
                  src={foundersPhoto.photo}
                  alt="Fundadores del AIR Club UdeSA con sus robots"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
                <figcaption className="absolute bottom-4 left-4 -rotate-3 border border-text bg-bg px-3 py-2 font-mono text-[.7rem] font-semibold uppercase tracking-[.16em] text-text">
                  {foundersPhoto.caption}
                </figcaption>
                {edit?.foundersPhotoControls}
              </figure>

              <ul className={`${GRID} content-start lg:col-span-8`}>
                {founders.map(tile)}
                {edit?.addFounder}
              </ul>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* La foto grupal de colaboradores se suma acá cuando esté. En el panel la sección se ve aunque esté vacía, para poder agregar. */}
      {(collaborators.length > 0 || edit) && (
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
                  {collaborators.map(tile)}
                  {edit?.addCollaborator}
                </ul>
                <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
                  <JoinPanel />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}
    </>
  );
}
