import { ArmHero } from "@/components/home/ArmHero";
import { AboutSection } from "@/components/home/AboutSection";
import { WordSlideshow } from "@/components/home/WordSlideshow";
import { IdeaCallout } from "@/components/home/IdeaCallout";
import { CountdownStrip } from "@/components/home/CountdownStrip";
import { RosmasterTrack } from "@/components/home/RosmasterTrack";
import { EventsTeaser } from "@/components/home/EventsTeaser";
import { ConvocatoriaBand } from "@/components/home/ConvocatoriaBand";
import { SeamRobot } from "@/components/home/SeamRobot";
import { SectionEdge } from "@/components/shared/SectionEdge";
import { SponsorStrip } from "@/components/layout/SponsorStrip";
import { getFeaturedCountdownEvent } from "@/lib/events";

// ISR, igual que /eventos y /talks: la landing se pre-renderiza como página estática y se revalida cada 60s.
// Sin esto quedaba fija al último deploy, y como "Próximas actividades" se decide al renderizar, una talk que ya
// pasó seguía apareciendo como próxima hasta el siguiente merge. Los cambios desde /admin/talks la revalidan al
// instante con revalidatePath("/").
export const revalidate = 60;

export default async function HomePage() {
  const featuredEvent = await getFeaturedCountdownEvent();

  return (
    <>
      {/* El hero usa las letras A/R como logo decorativo, no como texto real:
          este h1 le da a lectores de pantalla y buscadores el titulo real de la pagina. */}
      <h1 className="sr-only">AIR Club UdeSA — Artificial Intelligence &amp; Robotics Club</h1>
      <ArmHero />
      {/* El Rosmaster viaja por las uniones entre secciones (ver SeamRobot). */}
      <SeamRobot />
      <div id="contenido" className="scroll-mt-20">
        {/* Las uniones no llevan todas el mismo tratamiento: la curva solo abre y cierra el tramo oscuro (carrusel y
            salida del Rosmaster), la convocatoria usa el borde almenado de /talks y el resto son cambios de tono rectos. */}
        {/* Acto I, quiénes somos: el manifiesto en claro y el carrusel, que es el puente hacia lo oscuro. */}
        <AboutSection />
        <WordSlideshow />

        {/* Acto II, el desafío: un solo bloque oscuro continuo (cuenta regresiva y CAD del Rosmaster). */}
        {featuredEvent && <CountdownStrip event={featuredEvent} />}
        <RosmasterTrack />

        {/* Acto III, sumate: actividades, las dos formas de proponer algo y, al final, las alianzas. */}
        <SectionEdge color="var(--bg)" peak={[0.85, 0.35]} amp={[1, 0.65]} />
        <EventsTeaser />
        <IdeaCallout />
        <ConvocatoriaBand />
        <SponsorStrip />
      </div>
    </>
  );
}
