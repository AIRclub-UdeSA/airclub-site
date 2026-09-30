import type { Metadata } from "next";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { IntentSection } from "@/components/contacto/IntentSection";
import { ReasonPanel } from "@/components/contacto/ReasonPanels";
import { ChannelsBand } from "@/components/contacto/ChannelsBand";
import { getContactChannels, getContactReasons, type ContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contacto, AIR Club UdeSA",
  description: "Sumate al AIR Club UdeSA: mail, Instagram, comunidad y WhatsApp.",
  path: "/contacto",
});

export default async function ContactoPage() {
  const [channels, reasons] = await Promise.all([getContactChannels(), getContactReasons()]);
  const reason = (key: ContactReason["key"]) => reasons.find((r) => r.key === key);
  const comunidad = reason("comunidad");
  const equipo = reason("equipo");
  const charla = reason("charla");
  const workshop = reason("workshop");
  const sponsors = reason("sponsors");
  const consultas = reason("consultas");

  return (
    <>
      {/* Mismo título que /talks y /equipo: una sola línea, centrado. */}
      <header className="pb-10 pt-24 md:pb-14">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
          Contacto
        </h1>
      </header>

      <IntentSection tone="crimson" lead="Quiero" accent="sumarme">
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
            {comunidad && <ReasonPanel reason={comunidad} featured className="lg:col-span-7" />}
            {equipo && <ReasonPanel reason={equipo} outline className="lg:col-span-5" />}
          </div>
        </RevealOnScroll>
      </IntentSection>

      <IntentSection tone="rose" lead="Quiero" accent="aportar" alt>
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
            {charla && <ReasonPanel reason={charla} className="lg:col-span-5" />}
            {workshop && <ReasonPanel reason={workshop} className="lg:col-span-7" />}
            {sponsors && <ReasonPanel reason={sponsors} strip className="lg:col-span-12" />}
          </div>
        </RevealOnScroll>
      </IntentSection>

      <IntentSection tone="mauve" lead="Tengo una" accent="duda">
        <RevealOnScroll>
          <div className="mt-10 grid grid-cols-1">{consultas && <ReasonPanel reason={consultas} strip />}</div>
        </RevealOnScroll>
      </IntentSection>

      <section className="bg-bg2 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <RevealOnScroll>
            <h2 className="font-logo text-[clamp(3rem,7.4vw,7rem)] uppercase leading-[0.92] tracking-tight text-text">
              O escribinos <span className="text-crimson-text">directo</span>
            </h2>
            <div className="mt-10">
              <ChannelsBand channels={channels} />
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
