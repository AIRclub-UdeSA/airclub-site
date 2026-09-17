import { ArmHero } from "@/components/home/ArmHero";
import { AboutSection } from "@/components/home/AboutSection";
import { CountdownStrip } from "@/components/home/CountdownStrip";
import { EventsTeaser } from "@/components/home/EventsTeaser";
import { getFeaturedCountdownEvent } from "@/lib/events";

export default async function HomePage() {
  const featuredEvent = await getFeaturedCountdownEvent();

  return (
    <>
      {/* El hero usa las letras A/R como logo decorativo, no como texto real:
          este h1 le da a lectores de pantalla y buscadores el titulo real de la pagina. */}
      <h1 className="sr-only">AIR Club UdeSA — Artificial Intelligence &amp; Robotics Club</h1>
      <ArmHero />
      <div id="contenido" className="scroll-mt-20">
        {/* Presentación del Club */}
        <AboutSection />

        {/* El Hito más cercano + Contador */}
        {featuredEvent && <CountdownStrip event={featuredEvent} />}

        {/* Próximas Actividades */}
        <EventsTeaser />
      </div>
    </>
  );
}
