import { ArrowRight } from "lucide-react";
import { getContactReason } from "@/lib/contact";
import { TalksBattlement } from "@/components/talks/TalksBattlement";

/** Banda oscura de marca a todo el ancho: invita a proponer una charla o un workshop. Cierra la landing junto con "Tengo una idea". */
export async function ConvocatoriaBand() {
  const [talk, workshop] = await Promise.all([getContactReason("charla"), getContactReason("workshop")]);

  // Las dos formas de proponer una actividad salen del mismo correo del club, con plantilla para completar.
  const PROPOSALS = [
    { title: "Charla", desc: "Tesis, proyectos en desarrollo o casos de la industria.", href: talk.href },
    { title: "Workshop", desc: "Contanos qué te gustaría aprender.", href: workshop.href },
  ];

  // Esquinas rectas y el mismo borde fino que el carrusel (WordSlideshow), sin resplandores. Fondo oscuro de marca
  // #0e0407 y rosa #f0357f: los mismos de la cuenta regresiva y de la convocatoria de /talks. El contenido se alinea con
  // la grilla del resto de la landing (max-w-7xl + mismos paddings).
  return (
  <div data-seam="battlement" className="relative w-full bg-[#0e0407]">
    <TalksBattlement className="text-[#0e0407]" />
    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:px-8 sm:py-16 md:px-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <div className="font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-[#f0357f]">
          Convocatoria abierta
        </div>
        <h2 className="mt-3 font-display text-[clamp(1.7rem,3.1vw,2.7rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
          Proponé una charla o un workshop
        </h2>
        <p className="mt-5 max-w-[40ch] font-body text-[1.02rem] leading-relaxed text-white/75">
          Escribinos con el tema y 2 líneas de qué trata.
        </p>
      </div>

      <div className="lg:col-span-6 flex flex-col divide-y divide-white/15 border-y border-white/15">
        {PROPOSALS.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="group flex min-h-[88px] items-center gap-5 py-5 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 sm:px-2"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[1.25rem] font-bold leading-tight text-white">{item.title}</h3>
              <p className="mt-1 text-[.9rem] leading-relaxed text-white/65">{item.desc}</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors group-hover:border-[#f0357f] group-hover:bg-[#f0357f]">
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
      </div>
    </div>
  </div>
  );
}
