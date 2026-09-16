import type { Metadata } from "next";
import Image from "next/image";
import { getTeamMembers } from "@/lib/team";
import { PageHero } from "@/components/shared/PageHero";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { TiltCard } from "@/components/shared/TiltCard";
import { Button } from "@/components/shared/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Equipo, AIR Club UdeSA",
  description: "El equipo del AIR Club UdeSA: colaboradores, fundadores y cómo sumarte a la comunidad.",
  path: "/equipo",
});

export default async function EquipoPage() {
  const team = await getTeamMembers();

  return (
    <>
      <PageHero
        label="Las personas"
        title="Equipo"
        description="El club lo hacemos entre todos: un equipo principal que lleva adelante los proyectos y una comunidad abierta que crece con cada charla, curso y competencia."
      />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
        <RevealOnScroll>
          <h2 className="mb-8 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold tracking-tight text-text">
            Colaboradores y fundadores
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="grid grid-cols-2 items-start gap-12 max-lg:grid-cols-1">
            <TiltCard max={5} scale={1.02} lift={0} className="overflow-hidden rounded-lg border-[1.5px] border-border bg-white dark:bg-[#1a0810]">
              <div className="relative aspect-[4/3] w-full">
                <Image src="/equipo.jpg" alt="Equipo principal de AIR Club UdeSA con sus robots" fill className="object-cover" />
              </div>
              <p className="border-t border-border px-4 py-3 font-mono text-[.65rem] uppercase tracking-[.08em] text-text3">
                El equipo del AIR Club UdeSA
              </p>
            </TiltCard>
            <div>
              <p className="mb-5.5 max-w-[440px] text-[.87rem] leading-[1.7] text-text2">
                Un grupo chico que sostiene todo lo que hace el club: desde armar el JAR 2026 hasta programar cada
                robot que ves acá.
              </p>
              <ul className="columns-2 max-md:columns-1">
                {team.map((member) => (
                  <li
                    key={member.name}
                    className="break-inside-avoid border-b border-dashed border-border py-3.5 font-display text-[1.2rem] font-bold tracking-tight text-text transition-[color,padding-left] hover:pl-1.5 hover:text-crimson-text"
                  >
                    {member.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
        <RevealOnScroll>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold tracking-tight text-text">
            Cómo sumarte
          </h2>
          <p className="mb-9 max-w-[600px] text-[.95rem] leading-[1.75] text-text2">
            Hay dos formas de ser parte del AIR Club. La puerta de entrada, para todos, es la misma: la comunidad.
          </p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="grid grid-cols-[1.2fr_1fr] gap-5 max-lg:grid-cols-1">
            <div className="relative overflow-hidden rounded-lg border-[1.5px] border-crimson/30 bg-white p-8.5 shadow-[0_14px_44px_rgba(164,12,76,0.08)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-crimson before:to-dusty dark:bg-[#1a0810]">
              <h3 className="mb-3 font-display text-[1.15rem] font-extrabold text-text">Comunidad AIR</h3>
              <p className="mb-3.5 text-[.88rem] leading-[1.7] text-text2">
                Abierta a cualquier estudiante con ganas, sin requisitos ni experiencia previa. Completás el
                formulario, entrás a nuestra base y pasás a formar parte de la comunidad del club:
              </p>
              <ul className="mb-5 flex flex-col gap-2.5">
                {[
                  "Te llegan las novedades y todo lo nuevo del club",
                  "Acceso a charlas, cursos y workshops",
                  "Invitaciones a eventos y competencias",
                  "Canal directo para hablar con nosotros y proponer ideas",
                ].map((item) => (
                  <li key={item} className="relative pl-4.5 text-[.86rem] leading-[1.55] text-text2 before:absolute before:left-0 before:text-crimson-text before:content-['›']">
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                href="https://docs.google.com/forms/d/e/1FAIpQLSeJj7cS6SaCPaBr4a6dfJzeFF9W6BRWYxfLe0BEcGepSIvJBw/viewform"
                external
                variant="primary"
              >
                Sumarme a la comunidad
              </Button>
            </div>
            <div className="rounded-lg border-[1.5px] border-border bg-white p-8.5 dark:bg-[#1a0810]">
              <h3 className="mb-3 font-display text-[1.15rem] font-extrabold text-text">Equipo principal</h3>
              <p className="mb-3.5 text-[.88rem] leading-[1.7] text-text2">
                Es el grupo que desarrolla los proyectos y organiza los eventos del club. El ingreso es más
                acotado: charlamos antes, hay entrevistas y depende de las necesidades de cada proyecto.
              </p>
              <p className="text-[.88rem] leading-[1.7] text-text2">
                El primer paso es siempre el mismo: sumate a la comunidad y contanos qué te gustaría hacer. De ahí
                seguimos la conversación.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
