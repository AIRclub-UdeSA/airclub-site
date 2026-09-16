import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRobotBySlug } from "@/lib/robots";
import { RobotSpecTable } from "@/components/shared/RobotSpecTable";
import { Button } from "@/components/shared/Button";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/plataformas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const robot = await getRobotBySlug(slug);
  if (!robot) return buildMetadata({ title: "Robot no encontrado", description: "", path: `/plataformas/${slug}` });

  return buildMetadata({
    title: `${robot.name}, AIR Club UdeSA`,
    description: robot.description,
    path: `/plataformas/${robot.slug}`,
  });
}

export default async function RobotDetailPage({ params }: PageProps<"/plataformas/[slug]">) {
  const { slug } = await params;
  const robot = await getRobotBySlug(slug);
  if (!robot) notFound();

  const hardware = robot.specs.filter((s) => s.group === "HARDWARE");
  const software = robot.specs.filter((s) => s.group === "SOFTWARE");

  return (
    <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
      <RevealOnScroll>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-9 max-lg:grid-cols-1">
          <figure className="sticky top-25 overflow-hidden rounded-lg border-[1.5px] border-border bg-white max-lg:static dark:bg-[#1a0810]">
            <div className="relative aspect-[3/4] w-full">
              <Image src={robot.imageUrl} alt={robot.imageAlt} fill className="object-cover" />
            </div>
            <figcaption className="border-t border-border px-4 py-3 font-mono text-[.65rem] uppercase tracking-[.08em] text-text3">
              {robot.name} · Laboratorio UdeSA
            </figcaption>
          </figure>

          <div>
            <div className="mb-5.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(164,12,76,0.07)] px-3.5 py-1.5 font-mono text-[.64rem] uppercase tracking-[.08em] text-crimson-text">
                {robot.status}
              </span>
              {robot.category && (
                <span className="rounded-full border border-border-h px-3.5 py-1.5 font-mono text-[.64rem] uppercase tracking-[.08em] text-mauve">
                  {robot.category}
                </span>
              )}
              {robot.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border-h px-3.5 py-1.5 font-mono text-[.64rem] uppercase tracking-[.08em] text-mauve">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-3 font-display text-[1.6rem] font-extrabold tracking-tight text-text">{robot.name}</h1>
            <p className="mb-6.5 max-w-[560px] text-[.92rem] leading-[1.75] text-text2">{robot.description}</p>

            {hardware.length > 0 && <RobotSpecTable title="Hardware" specs={hardware} />}
            {software.length > 0 && <RobotSpecTable title="Software" specs={software} />}

            {robot.links.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-3">
                {robot.links.map((link, i) => (
                  <Button key={link.url} href={link.url} external variant={i === 0 ? "primary" : "default"} className="px-4.5 py-2.5 text-[.8rem]">
                    {link.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
