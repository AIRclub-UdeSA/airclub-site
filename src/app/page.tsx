import { ArmHero } from "@/components/home/ArmHero";
import { AboutSection } from "@/components/home/AboutSection";
import { WordSlideshow } from "@/components/home/WordSlideshow";
import { IdeaCallout } from "@/components/home/IdeaCallout";
import { CountdownStrip } from "@/components/home/CountdownStrip";
import { RosmasterTrack } from "@/components/home/RosmasterTrack";
import { EventsTeaser } from "@/components/home/EventsTeaser";
import { SponsorStrip } from "@/components/layout/SponsorStrip";
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
        {/* 01. Manifiesto del Club */}
        <AboutSection />

        {/* 02. Slideshow Horizontal con Palabras Monumentales & Fondo Dinámico */}
        <WordSlideshow />

        {/* 03. "Tengo una idea, pero no sé por dónde empezar" */}
        <IdeaCallout />

        {/* 04. Hito Nacional + Cronómetro sobre ShaderGradient */}
        {featuredEvent && <CountdownStrip event={featuredEvent} />}

        {/* 05. Plataforma Oficial JAR 2026: ROSMASTER X3 CAD en pista minimalista (fondo blanco + grilla rosa) */}
        <RosmasterTrack />

        {/* 06. Próximas Actividades */}
        <EventsTeaser />

        {/* 07. Alianzas y Empresas (solo en landing) */}
        <SponsorStrip />
      </div>
    </>
  );
}
