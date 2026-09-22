"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, Mail } from "lucide-react";

// Carga dinámica con SSR deshabilitado para el fondo 3D shadergradient, igual que en CountdownStrip.
const ShaderGradientBg = dynamic(
  () => import("@/components/home/ShaderGradientBg").then((mod) => mod.ShaderGradientBg),
  { ssr: false }
);

const COMMUNITY_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSeJj7cS6SaCPaBr4a6dfJzeFF9W6BRWYxfLe0BEcGepSIvJBw/viewform";

const COMMUNITY_BENEFITS = [
  "Te llegan las novedades y todo lo nuevo del club",
  "Acceso a charlas, cursos y workshops",
  "Invitaciones a eventos y competencias",
  "Canal directo para hablar con nosotros y proponer ideas",
];

export function JoinSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#0e0407] py-16 text-[#f5e8ec] sm:py-24">
      {/* Fondo inmersivo 3D ShaderGradient en paleta carmesí/vino, igual que la cuenta regresiva del Challenge JAR 2026. */}
      <ShaderGradientBg />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="font-display text-[clamp(1.9rem,4.6vw,3rem)] font-black uppercase leading-[1.02] tracking-tight text-[#f5e8ec]">
              Cómo <span className="text-[#f0357f]">sumarte</span>
            </h2>
            <p className="mt-5 max-w-[52ch] text-[1rem] leading-[1.8] text-[#f5e8ec]/80">
              Sin requisitos ni experiencia previa, completás el formulario y pasás a formar parte de la comunidad:
            </p>

            <ul className="mt-8 flex flex-col divide-y divide-white/10">
              {COMMUNITY_BENEFITS.map((item, i) => (
                <li key={item} className="flex items-start gap-4 py-3.5 first:pt-0">
                  <span className="shrink-0 pt-0.5 font-mono text-[.74rem] font-bold text-[#f0357f]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[.95rem] leading-[1.6] text-[#f5e8ec]/80">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={COMMUNITY_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.75rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
            >
              Sumarme a la comunidad <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="border-t border-white/10 pt-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-14 lg:pt-0">
            <h3 className="font-display text-[1.3rem] font-black uppercase leading-[1.1] tracking-tight text-[#f5e8ec]">
              Equipo principal
            </h3>
            <p className="mt-4 text-[.95rem] leading-[1.75] text-[#f5e8ec]/80">
              Es el grupo que desarrolla los proyectos y organiza los eventos del club.
            </p>
            <p className="mt-4 text-[.95rem] leading-[1.75] text-[#f5e8ec]/80">
              Para ingresar tenés que ser parte de la comunidad primero y contarnos qué te gustaría hacer. Según las
              necesidades de cada proyecto, organizamos una entrevista.
            </p>

            <a
              href="mailto:airclub@udesa.edu.ar?subject=Quiero sumarme al equipo principal&body=Hola AIR Club, ya soy parte de la comunidad y me gustaría sumarme al equipo principal. Esto es lo que me gustaría hacer:"
              className="mt-7 inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#f5e8ec] px-6 py-3.5 font-mono text-[.75rem] font-semibold uppercase tracking-[.14em] text-[#f5e8ec] transition-all hover:bg-[#f5e8ec] hover:text-[#0e0407]"
            >
              <Mail size={14} />
              Escribinos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
