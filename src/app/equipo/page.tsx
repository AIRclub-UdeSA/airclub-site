import type { Metadata } from "next";
import Image from "next/image";
import { getCollaborators, getFounders } from "@/lib/team";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { MembersList } from "@/components/equipo/MembersList";
import { JoinSection } from "@/components/equipo/JoinSection";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Equipo, AIR Club UdeSA",
  description: "El equipo del AIR Club UdeSA: sus fundadores y cómo sumarte a la comunidad.",
  path: "/equipo",
});

const sectionTitle =
  "border-b border-border/80 pb-6 font-display text-[clamp(1.1rem,5.3vw,3rem)] sm:text-[clamp(1.9rem,3.6vw,3rem)] font-black uppercase leading-[0.98] tracking-tight text-text";

export default async function EquipoPage() {
  const [founders, collaborators] = await Promise.all([getFounders(), getCollaborators()]);

  return (
    <>
      <header className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-8 pt-32 sm:px-8 md:px-12 md:pb-10 md:pt-36">
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 opacity-15 dark:opacity-20 md:block"
          style={{
            backgroundImage: "radial-gradient(circle, var(--rose) 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative">
          <h1 className="border-b border-border/80 pb-6 font-display text-[clamp(2.4rem,12vw,3rem)] sm:text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
            <span className="text-crimson">Equipo</span>
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:px-12 md:py-20">
        <RevealOnScroll>
          <h2 className={sectionTitle}>
            <span className="text-crimson">Fundadores</span>
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-2 items-start gap-12 max-lg:grid-cols-1">
            <div className="relative overflow-hidden rounded-card border-[1.5px] border-crimson bg-card shadow-[0_24px_60px_rgba(13,4,7,0.1)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
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
            <div>
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
          <p className="mt-6 font-mono text-[.78rem] font-semibold uppercase tracking-[.18em] text-mauve">
            Segundo semestre 2026
          </p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="mt-4">
            <MembersList team={collaborators} columns />
          </div>
        </RevealOnScroll>
      </section>

      <JoinSection />
    </>
  );
}
