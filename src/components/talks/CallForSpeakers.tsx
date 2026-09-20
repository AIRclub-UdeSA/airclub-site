"use client";

import { Mic, Send, CheckCircle2 } from "lucide-react";

const PERFILES = [
  {
    titulo: "Tesistas & Investigadores",
    desc: "Presentá avances de tu tesis de grado o posgrado en robótica, aprendizaje automático, control o visión por computadora ante la comunidad.",
  },
  {
    titulo: "Estudiantes con Proyectos",
    desc: "¿Estás construyendo un robot, un gemelo digital, un modelo de visión o compitiendo en robótica? Contanos el detrás de escena y los desafíos técnicos.",
  },
  {
    titulo: "Empresas & Startups",
    desc: "Vení a contar cómo tu equipo aplica la inteligencia artificial, la automatización o la robótica en la industria real y qué perfiles buscan.",
  },
];

export function CallForSpeakers() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
      <div className="border-trail-hover relative overflow-hidden rounded-[28px] border-[1.5px] border-border bg-card p-8 sm:p-12 md:p-16">
        {/* Marca de fondo sutil */}
        <div className="pointer-events-none absolute -right-16 -top-16 select-none opacity-[0.03] text-text font-display text-[16rem] font-black leading-none">
          AIR
        </div>

        <div className="relative z-10">
          {/* Encabezado afiche */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div className="flex items-center gap-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-crimson-text">
              <Mic size={16} />
              <span>Convocatoria Continua · Call for Speakers</span>
            </div>
            <span className="font-mono text-[.72rem] uppercase tracking-wider text-text3">
              Abierta a toda la comunidad académica
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Columna izquierda: Manifiesto de la convocatoria (7 cols) */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-black uppercase leading-[0.98] tracking-tight text-text">
                ¿Querés dar una <span className="text-crimson">charla</span> en AIR Club?
              </h2>
              <p className="mt-6 max-w-[62ch] text-[1.02rem] leading-[1.8] text-text2">
                Las AIR Talks son un espacio abierto y horizontal. Buscamos divulgar ciencia y tecnología sin rodeos:
                código real, desafíos mecánicos, fallas superadas y modelos en producción.
              </p>

              {/* Tres perfiles en tarjetas afiche */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {PERFILES.map((p) => (
                  <div
                    key={p.titulo}
                    className="flex flex-col justify-between rounded-xl border border-border bg-bg2/40 p-4 transition-colors hover:border-border-h"
                  >
                    <div>
                      <h3 className="font-display text-[.92rem] font-bold text-text">
                        {p.titulo}
                      </h3>
                      <p className="mt-2 text-[.78rem] leading-[1.6] text-text2">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha: Requisitos y Postulación (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border bg-bg2/60 p-6 sm:p-8">
              <div>
                <span className="font-mono text-[.7rem] font-semibold uppercase tracking-[.18em] text-text3">
                  Cómo funciona
                </span>
                <ul className="mt-4 flex flex-col gap-3">
                  <li className="flex items-start gap-2.5 text-[.85rem] text-text2 leading-[1.6]">
                    <CheckCircle2 size={16} className="text-crimson shrink-0 mt-0.5" />
                    <span>Exposiciones de 25 a 45 minutos + debate con la audiencia.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[.85rem] text-text2 leading-[1.6]">
                    <CheckCircle2 size={16} className="text-crimson shrink-0 mt-0.5" />
                    <span>Auditorio equipado en el campus Victoria con proyección y audio.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[.85rem] text-text2 leading-[1.6]">
                    <CheckCircle2 size={16} className="text-crimson shrink-0 mt-0.5" />
                    <span>Grabación, archivo fotográfico y difusión en nuestros canales.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-border/80 pt-6">
                <a
                  href="mailto:airclub@udesa.edu.ar?subject=Propuesta de AIR Talk&body=Hola AIR Club, me gustaría proponer una charla sobre:%0D%0A- Tema:%0D%0A- Breve abstract o link a borrador de slides:%0D%0A- Nombre y afiliación:"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover shadow-sm"
                >
                  <Send size={14} />
                  <span>Proponer una Talk</span>
                </a>
                <p className="mt-3 text-center font-mono text-[.68rem] text-text3">
                  Escribinos con un tema y un abstract de 2 líneas o link a tus slides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
