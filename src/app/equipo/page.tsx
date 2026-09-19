import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getCollaborators, getFounders } from "@/lib/team";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { TiltCard } from "@/components/shared/TiltCard";
import { MembersList } from "@/components/equipo/MembersList";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Equipo, AIR Club UdeSA",
  description: "El equipo del AIR Club UdeSA: sus fundadores y cómo sumarte a la comunidad.",
  path: "/equipo",
});

const COMMUNITY_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSeJj7cS6SaCPaBr4a6dfJzeFF9W6BRWYxfLe0BEcGepSIvJBw/viewform";

const COMMUNITY_BENEFITS = [
  "Te llegan las novedades y todo lo nuevo del club",
  "Acceso a charlas, cursos y workshops",
  "Invitaciones a eventos y competencias",
  "Canal directo para hablar con nosotros y proponer ideas",
];

const sectionTitle =
  "border-b border-border/80 pb-6 font-display text-[clamp(1.1rem,5.3vw,3rem)] sm:text-[clamp(1.9rem,3.6vw,3rem)] font-black uppercase leading-[0.98] tracking-tight text-text";

export default async function EquipoPage() {
  const [founders, collaborators] = await Promise.all([getFounders(), getCollaborators()]);

  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pb-8 pt-32 sm:px-8 md:px-12 md:pb-10 md:pt-36">
        <h1 className="border-b border-border/80 pb-6 font-display text-[clamp(2.4rem,12vw,3rem)] sm:text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
          <span className="text-crimson">Equipo</span>
        </h1>
        <p className="mt-5 max-w-[78ch] text-[1.02rem] leading-[1.8] text-text2">
          El club lo hacemos entre todos: un equipo principal que lleva adelante los proyectos y una comunidad abierta
          que crece con cada charla, curso y competencia.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:px-12 md:py-20">
        <RevealOnScroll>
          <h2 className={sectionTitle}>
            <span className="text-crimson">Fundadores</span>
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-2 items-start gap-12 max-lg:grid-cols-1">
            <TiltCard max={5} scale={1.02} lift={0} className="rounded-card">
              <div className="border-trail-hover relative overflow-hidden rounded-card border-[1.5px] border-border bg-card">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/equipo.jpg"
                    alt="Fundadores del AIR Club UdeSA con sus robots"
                    fill
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="border-t border-border px-5 py-3.5 font-mono text-[.7rem] font-semibold uppercase tracking-[.16em] text-text3">
                  Los fundadores del AIR Club
                </p>
              </div>
            </TiltCard>
            <div>
              <p className="mb-6 max-w-[46ch] text-[.98rem] leading-[1.75] text-text2">
                Un grupo chico que sostiene todo lo que hace el club: desde armar el JAR 2026 hasta programar cada robot
                que ves acá.
              </p>
              <MembersList team={founders} />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* La foto grupal de colaboradores se suma acá cuando esté (mismo esquema que Fundadores). */}
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-2 sm:px-8 md:px-12 md:pb-20">
        <RevealOnScroll>
          <h2 className={sectionTitle}>
            <span className="text-crimson">Colaboradores</span>
          </h2>
          <p className="mt-6 font-mono text-[.78rem] font-semibold uppercase tracking-[.18em] text-text3">
            Segundo semestre 2026
          </p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="mt-4">
            <MembersList team={collaborators} columns />
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 md:px-12 md:pb-28">
        <RevealOnScroll>
          <h2 className={sectionTitle}>
            Cómo <span className="text-crimson">sumarte</span>
          </h2>
          <p className="mt-6 max-w-[62ch] text-[1.02rem] leading-[1.8] text-text2">
            Hay dos formas de ser parte del AIR Club. La puerta de entrada, para todos, es la misma: la comunidad.
          </p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-[1.2fr_1fr] gap-5 max-lg:grid-cols-1">
            <div className="rounded-card border-[1.5px] border-crimson bg-card p-6 sm:p-8 md:p-10">
              <h3 className="mb-4 font-display text-[clamp(1.05rem,5.2vw,1.35rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
                Comunidad AIR
              </h3>
              <p className="mb-5 text-[.95rem] leading-[1.75] text-text2">
                Abierta a cualquier estudiante con ganas, sin requisitos ni experiencia previa. Completás el formulario,
                entrás a nuestra base y pasás a formar parte de la comunidad del club:
              </p>
              <ul className="mb-7 flex flex-col gap-3">
                {COMMUNITY_BENEFITS.map((item) => (
                  <li
                    key={item}
                    className="relative pl-5 text-[.92rem] leading-[1.6] text-text2 before:absolute before:left-0 before:text-crimson-text before:content-['›']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={COMMUNITY_FORM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.72rem] font-semibold uppercase tracking-[.1em] sm:px-6 sm:text-[.78rem] sm:tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                Sumarme a la comunidad <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="rounded-card border-[1.5px] border-border bg-card p-6 sm:p-8 md:p-10">
              <h3 className="mb-4 font-display text-[clamp(1.05rem,5.2vw,1.35rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
                Equipo principal
              </h3>
              <p className="mb-4 text-[.95rem] leading-[1.75] text-text2">
                Es el grupo que desarrolla los proyectos y organiza los eventos del club. El ingreso es más acotado:
                charlamos antes, hay entrevistas y depende de las necesidades de cada proyecto.
              </p>
              <p className="text-[.95rem] leading-[1.75] text-text2">
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
