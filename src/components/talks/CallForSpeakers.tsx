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
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 md:px-12 md:py-28">
      <div className="border-t border-border/80 pt-16 md:pt-20">
        {/* Encabezado Manifiesto Editorial */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-black uppercase leading-[0.96] tracking-tight text-text">
              ¿Querés dar una <span className="text-crimson">charla</span> en AIR Club?
            </h2>
            <p className="mt-6 text-[1.05rem] leading-[1.8] text-text2 max-w-[55ch]">
              Las AIR Talks son un espacio abierto y horizontal. Buscamos divulgar ciencia y tecnología sin rodeos:
              código real, arquitectura de sistemas, fallas superadas y modelos en producción.
            </p>

            {/* Acción de contacto directo */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="mailto:airclub@udesa.edu.ar?subject=Propuesta de AIR Talk&body=Hola AIR Club, me gustaría proponer una charla sobre:%0D%0A- Tema:%0D%0A- Breve abstract o link a borrador de slides:%0D%0A- Nombre y afiliación:"
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-7 py-4 font-mono text-[.82rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                <Mail size={15} />
                <span>Proponer una charla</span>
                <ArrowRight size={14} />
              </a>
              <span className="font-mono text-[.74rem] text-text3">
                Escribinos con un tema y 2 líneas de abstract.
              </span>
            </div>
          </div>

          {/* Tres pistas técnicas en columnas de texto puro */}
          <div className="lg:col-span-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {TRACKS.map((track) => (
              <div key={track.num} className="border-l border-border/80 pl-5">
                <div className="font-mono text-[.74rem] font-bold text-crimson-text">
                  {track.num}
                </div>
                <h3 className="mt-2 font-display text-[1.1rem] font-bold text-text leading-tight">
                  {track.title}
                </h3>
                <p className="mt-3 text-[.86rem] leading-[1.65] text-text2">
                  {track.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
