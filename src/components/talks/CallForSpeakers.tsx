import { ArrowUpRight } from "lucide-react";
import { TalksBattlement } from "./TalksBattlement";

const TRACKS = [
  {
    title: "Tesistas e investigadores",
    desc: "Presentá tu tesis de grado o maestría, papers en desarrollo y avances del LINAR ante la comunidad técnica.",
  },
  {
    title: "Alumnos con proyectos",
    desc: "Contá lo que estás construyendo en el taller: robots móviles, visión artificial, gemelos digitales o hardware.",
  },
  {
    title: "Empresas e industria",
    desc: "Vení a mostrar cómo aplican la automatización, la robótica o la IA en problemas reales de producción.",
  },
];

const MAILTO =
  "mailto:airclub@udesa.edu.ar?subject=Propuesta de AIR Talk&body=Hola AIR Club, me gustaría proponer una charla sobre:%0D%0A- Tema:%0D%0A- Breve abstract o link a borrador de slides:%0D%0A- Nombre y afiliación:";

// Cierre de la página: banda oscura a todo el ancho (como la cuenta regresiva de la portada), igual en modo claro y oscuro.
export function CallForSpeakers() {
  return (
    <section id="convocatoria" className="relative scroll-mt-24 bg-[#0e0407] text-[#f5e8ec]">
      <TalksBattlement className="text-[#0e0407]" />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-8 md:px-12 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex flex-col justify-between gap-10">
          <h2 className="font-logo text-[clamp(3.2rem,7.4vw,7rem)] uppercase leading-[0.92] tracking-tight">
            ¿Querés dar una <span className="text-[#f0357f]">charla</span>?
          </h2>
          <div>
            <p className="max-w-[46ch] text-[1.02rem] leading-[1.7] text-[#f5e8ec]/75">
              Las AIR Talks son un espacio abierto y horizontal. Buscamos divulgar ciencia y tecnología sin rodeos:
              código real, arquitectura de sistemas, fallas superadas y modelos en producción.
            </p>
            <a
              href={MAILTO}
              className="mt-7 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
            >
              <span>Proponer una charla</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <p className="mt-4 font-mono text-[.76rem] text-[#f5e8ec]/55">
              Escribinos con tema y 2 líneas de abstract.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-white/15 self-end border-y border-white/15">
          {TRACKS.map((track) => (
            <li key={track.title} className="py-6">
              <h3 className="font-display text-[1.3rem] font-bold leading-tight">{track.title}</h3>
              <p className="mt-2 max-w-[44ch] text-[.95rem] leading-[1.65] text-[#f5e8ec]/70">{track.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
