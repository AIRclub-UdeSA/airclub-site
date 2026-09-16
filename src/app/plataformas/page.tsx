import type { Metadata } from "next";
import { getRobots } from "@/lib/robots";
import { PageHero } from "@/components/shared/PageHero";
import { RobotCard } from "@/components/shared/RobotCard";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Robots, AIR Club UdeSA",
  description: "Las plataformas robóticas que desarrolla y mantiene el AIR Club UdeSA.",
  path: "/plataformas",
});

export default async function PlataformasPage() {
  const robots = await getRobots();

  return (
    <>
      <PageHero
        label="Plataformas"
        title="Robots"
        description="Las plataformas robóticas que desarrolla y mantiene el club. Este catálogo va a crecer con cada proyecto nuevo."
      />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          {robots.map((robot) => (
            <RevealOnScroll key={robot.slug}>
              <RobotCard robot={robot} />
            </RevealOnScroll>
          ))}
        </div>
        <RevealOnScroll className="mt-6.5">
          <div className="rounded-lg border-[1.5px] border-dashed border-border-h p-11 text-center">
            <h4 className="mb-1.5 font-display text-[1rem] font-bold text-text2">Próximo robot</h4>
            <p className="mx-auto max-w-[420px] text-[.84rem] text-text3">
              Este espacio está reservado para la próxima plataforma del club. ¿Ideas? Sumate a la comunidad y
              contanos.
            </p>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
