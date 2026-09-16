import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contacto, AIR Club UdeSA",
  description: "Sumate al AIR Club UdeSA: mail, Instagram, comunidad y WhatsApp.",
  path: "/contacto",
});

const CONTACTS = [
  {
    href: "mailto:airclub@udesa.edu.ar",
    icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />,
    title: "Mail",
    value: "airclub@udesa.edu.ar",
    note: "Para consultas generales, propuestas y sponsors.",
  },
  {
    href: "https://www.instagram.com/AIRClub_UdeSA",
    external: true,
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
    title: "Instagram",
    value: "@AIRClub_UdeSA",
    note: "Novedades del día a día, fotos y anuncios.",
  },
  {
    href: "https://docs.google.com/forms/d/e/1FAIpQLSeJj7cS6SaCPaBr4a6dfJzeFF9W6BRWYxfLe0BEcGepSIvJBw/viewform",
    external: true,
    icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    title: "Comunidad AIR",
    value: "Formulario de inscripción",
    note: "Sumate a la base del club: charlas, cursos y novedades directo a tu casilla.",
  },
  {
    href: "https://chat.whatsapp.com/Dz7CNt3Zdt25u4hqPd2fLK?s=cl&p=i&mlu=4",
    external: true,
    icon: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    title: "WhatsApp",
    value: "Comunidad AIR Club",
    note: "Sumate al grupo para el día a día del club y coordinar rápido.",
  },
];

export default function ContactoPage() {
  return (
    <>
      <PageHero
        label="Hablemos"
        title="Contacto"
        description="¿Querés sumarte, proponer una idea o simplemente saber más del club? Por acá nos encontrás."
      />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
        <RevealOnScroll>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
            {CONTACTS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="block rounded-lg border-[1.5px] border-border bg-white p-8 transition-all duration-400 ease-club hover:-translate-y-1 hover:border-crimson/30 hover:shadow-[0_16px_40px_rgba(164,12,76,0.08)] dark:bg-[#1a0810]"
              >
                <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[rgba(164,12,76,0.08)] text-crimson-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
                    {c.icon}
                  </svg>
                </div>
                <h4 className="mb-1 mt-3.5 font-display text-[1rem] font-bold text-text">{c.title}</h4>
                <p className="font-mono text-[.75rem] text-crimson-text">{c.value}</p>
                <small className="mt-2 block text-[.8rem] leading-[1.55] text-text3">{c.note}</small>
              </a>
            ))}
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
