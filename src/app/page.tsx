import { ArmHero } from "@/components/home/ArmHero";
import { CountdownStrip } from "@/components/home/CountdownStrip";
import { AboutSection } from "@/components/home/AboutSection";
import { EventsTeaser } from "@/components/home/EventsTeaser";
import { getFeaturedCountdownEvent } from "@/lib/events";

export default async function HomePage() {
  const featuredEvent = await getFeaturedCountdownEvent();

  return (
    <>
      {/* El hero usa las letras A/R como logo decorativo, no como texto real:
          este h1 le da a lectores de pantalla y buscadores el titulo real de la pagina. */}
      <h1 className="sr-only">AIR Club UdeSA — Artificial Intelligence & Robotics Club</h1>
      <ArmHero />
      {featuredEvent && <CountdownStrip event={featuredEvent} />}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <AboutSection />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <EventsTeaser />
    </>
  );
}
