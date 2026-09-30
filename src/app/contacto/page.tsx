import type { Metadata } from "next";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";
import { PrimaryReason, ReasonPanel } from "@/components/contacto/ReasonPanels";
import { ChannelsBand } from "@/components/contacto/ChannelsBand";
import { getContactChannels, getContactReasons } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contacto, AIR Club UdeSA",
  description: "Sumate al AIR Club UdeSA: mail, Instagram, comunidad y WhatsApp.",
  path: "/contacto",
});

export default async function ContactoPage() {
  const [channels, reasons] = await Promise.all([getContactChannels(), getContactReasons()]);
  const [primary, ...others] = reasons;
  // Después de la acción principal: dos filas asimétricas (7+5 y 5+7) y el último motivo como franja.
  const [equipo, charla, workshop, sponsors, ...strip] = others;

  return (
    <>
      {/* Mismo título que /talks y /equipo: una sola línea, centrado. */}
      <header className="pb-10 pt-24 md:pb-14">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
          Contacto
        </h1>
      </header>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <RevealOnScroll>
            <CountHeading n={reasons.length} title="Escribinos por" />
            <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-[1.75] text-text2">
              ¿Querés sumarte, proponer una idea o simplemente saber más del club? Elegí el motivo y te llevamos al canal
              indicado, o escribinos directo.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
              {primary && (
                <div className="lg:col-span-12">
                  <PrimaryReason reason={primary} />
                </div>
              )}
              {equipo && <ReasonPanel reason={equipo} className="lg:col-span-7" />}
              {charla && <ReasonPanel reason={charla} className="lg:col-span-5" />}
              {workshop && <ReasonPanel reason={workshop} className="lg:col-span-5" />}
              {sponsors && <ReasonPanel reason={sponsors} className="lg:col-span-7" />}
              {strip.map((r) => (
                <ReasonPanel key={r.key} reason={r} strip className="lg:col-span-12" />
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-bg2 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <RevealOnScroll>
            <CountHeading n={channels.length} title="Canales directos" />
            <div className="mt-8">
              <ChannelsBand channels={channels} />
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
