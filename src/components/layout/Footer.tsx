import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/plataformas", label: "Robots" },
  { href: "/equipo", label: "Equipo" },
  { href: "/contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg2 relative overflow-hidden px-6 sm:px-8 md:px-12 pt-16 pb-12">
      {/* Monumental poster watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none font-logo text-[clamp(3.5rem,12vw,10.5rem)] text-text/[0.04] leading-none tracking-tight uppercase whitespace-nowrap overflow-hidden mb-6"
      >
        AIR CLUB UDESA
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="AIR Club UdeSA"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full bg-white object-cover border border-border"
            />
            <div>
              <h3 className="font-display text-[1.1rem] font-bold text-text leading-tight">AIR Club</h3>
              <p className="font-mono text-[.66rem] uppercase tracking-[.12em] text-mauve">Universidad de San Andrés</p>
            </div>
          </div>
          <p className="font-body text-[.88rem] leading-[1.65] text-text2">
            Espacio estudiantil abierto dedicado al aprendizaje y desarrollo de robótica móvil, percepción autónoma y modelos de IA aplicados.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16">
          <div>
            <h4 className="mb-3 font-mono text-[.68rem] uppercase tracking-[.18em] text-mauve font-semibold">
              Navegación
            </h4>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-[.88rem] text-text2 transition-colors hover:text-crimson-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-[.68rem] uppercase tracking-[.18em] text-mauve font-semibold">
              Contacto
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="mailto:airclub@udesa.edu.ar"
                  className="font-body text-[.88rem] text-text2 hover:text-crimson-text transition-colors flex items-center gap-1"
                >
                  airclub@udesa.edu.ar
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/AIRClub_UdeSA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[.88rem] text-text2 hover:text-crimson-text transition-colors flex items-center gap-1"
                >
                  @AIRClub_UdeSA
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/Dz7CNt3Zdt25u4hqPd2fLK?s=cl&p=i&mlu=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[.88rem] text-text2 hover:text-crimson-text transition-colors flex items-center gap-1"
                >
                  Comunidad WhatsApp
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-text3 font-mono text-[.72rem] tracking-wide">
        <span>© {new Date().getFullYear()} AIR Club UdeSA</span>
        <span className="font-semibold text-text2 tracking-[.15em] uppercase">Think. Build. Compete.</span>
      </div>
    </footer>
  );
}
