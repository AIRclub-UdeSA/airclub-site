"use client";

import { ArrowRight, Mail } from "lucide-react";

const TRACKS = [
  {
    num: "01",
    title: "Tesistas & Investigadores",
    desc: "Presentá tu tesis de grado o maestría, papers en desarrollo y avances del LINAR ante la comunidad técnica.",
  },
  {
    num: "02",
    title: "Alumnos con Proyectos",
    desc: "Contá lo que estás construyendo en el taller: robots móviles, visión artificial, gemelos digitales o hardware.",
  },
  {
    num: "03",
    title: "Empresas & Industria",
    desc: "Vení a mostrar cómo aplican la automatización, la robótica o la IA en problemas reales de producción.",
  },
];

export function CallForSpeakers() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-12 pb-24 sm:px-8 md:px-12 md:pt-16 md:pb-28">
      <div className="border-t border-border/80 pt-12 md:pt-16">
        {/* Encabezado Manifiesto Editorial Calibrado */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          <div className="lg:col-span-6">
            <div className="font-mono text-[.74rem] uppercase tracking-[.2em] text-crimson-text font-semibold">
              Convocatoria Abierta
            </div>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.3rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
              ¿Querés dar una <span className="text-crimson">charla</span> en AIR Club?
            </h2>
            <p className="mt-4 text-[.95rem] sm:text-[1rem] leading-[1.7] text-text2 max-w-[50ch]">
              Las AIR Talks son un espacio abierto y horizontal. Buscamos divulgar ciencia y tecnología sin rodeos:
              código real, arquitectura de sistemas, fallas superadas y modelos en producción.
            </p>

            {/* Acción de contacto directo */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="mailto:airclub@udesa.edu.ar?subject=Propuesta de AIR Talk&body=Hola AIR Club, me gustaría proponer una charla sobre:%0D%0A- Tema:%0D%0A- Breve abstract o link a borrador de slides:%0D%0A- Nombre y afiliación:"
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                <Mail size={14} />
                <span>Proponer una charla</span>
                <ArrowRight size={13} />
              </a>
              <span className="font-mono text-[.72rem] text-text3">
                Escribinos con tema y 2 líneas de abstract.
              </span>
            </div>
          </div>

          {/* Tres pistas técnicas organizadas como lista indexada y proporcionada */}
          <div className="lg:col-span-6 flex flex-col divide-y divide-border/60">
            {TRACKS.map((track) => (
              <div key={track.num} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <span className="font-mono text-[.74rem] font-bold text-crimson-text pt-0.5 shrink-0">
                  {track.num}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[1rem] font-bold text-text leading-snug">
                    {track.title}
                  </h3>
                  <p className="mt-1 text-[.84rem] leading-[1.6] text-text2">
                    {track.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
