import type { Metadata } from "next";
import { ArrowUpRight, AtSign, Camera, MessageCircle, type LucideIcon } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { getContactChannels, getContactReasons, type ContactChannel } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contacto, AIR Club UdeSA",
  description: "Sumate al AIR Club UdeSA: mail, Instagram, comunidad y WhatsApp.",
  path: "/contacto",
});

const CHANNEL_ICONS: Record<ContactChannel["key"], LucideIcon> = {
  email: AtSign,
  instagram: Camera,
  whatsapp: MessageCircle,
};

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

export default async function ContactoPage() {
  const [channels, reasons] = await Promise.all([getContactChannels(), getContactReasons()]);
  const email = channels.find((c) => c.key === "email");
  const social = channels.filter((c) => c.key !== "email");

  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pb-8 pt-32 sm:px-8 md:px-12 md:pb-10 md:pt-36">
        <h1 className="border-b border-border/80 pb-6 font-display text-[clamp(1.5rem,7.2vw,3rem)] font-black uppercase leading-[0.92] tracking-tight text-text sm:text-[clamp(3rem,8vw,6.5rem)]">
          <span className="text-crimson">Contacto</span>
        </h1>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 md:px-12 md:pb-28 md:pt-10">
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
              <p className="max-w-[40ch] text-[1rem] leading-[1.75] text-text2">
                ¿Querés sumarte, proponer una idea o simplemente saber más del club? Elegí el motivo y te llevamos al
                canal indicado, o escribinos directo.
              </p>

              {email && (
                <a
                  href={email.href}
                  className="mt-10 block break-words font-display text-[clamp(1.1rem,2.05vw,1.6rem)] font-extrabold leading-[1.1] tracking-tight text-text transition-colors hover:text-crimson-text"
                >
                  {email.value}
                </a>
              )}
              {email && <p className="mt-2 font-mono text-[.72rem] text-text3">{email.note}</p>}

              <ul className="mt-10 flex flex-col divide-y divide-border/60 border-y border-border/60">
                {social.map((c) => {
                  const Icon = CHANNEL_ICONS[c.key];
                  return (
                    <li key={c.key}>
                      <a
                        href={c.href}
                        target={c.external ? "_blank" : undefined}
                        rel={c.external ? "noopener noreferrer" : undefined}
                        className="group flex min-h-11 items-start gap-4 py-4"
                      >
                        <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-crimson-text" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-mono text-[.68rem] font-semibold uppercase tracking-[.18em] text-mauve">
                            {c.label}
                          </span>
                          <span className="mt-1 block font-display text-[1rem] font-bold text-text transition-colors group-hover:text-crimson-text">
                            {c.value}
                          </span>
                          <span className="mt-1 block text-[.84rem] leading-[1.55] text-text3">{c.note}</span>
                        </span>
                        {c.external && (
                          <>
                            <ArrowUpRight size={16} className="mt-1 shrink-0 text-text3" aria-hidden="true" />
                            {NEW_TAB_HINT}
                          </>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-7 lg:border-l lg:border-border/60 lg:pl-14">
              <h2 className="border-b border-border/80 pb-4 font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-crimson-text">
                Escribinos por
              </h2>
              <ul className="flex flex-col divide-y divide-border/60">
                {reasons.map((r, i) => (
                  <li key={r.key}>
                    <a
                      href={r.href}
                      target={r.external ? "_blank" : undefined}
                      rel={r.external ? "noopener noreferrer" : undefined}
                      className="group flex min-h-11 items-start gap-4 py-6 sm:gap-6"
                    >
                      <span className="shrink-0 pt-1 font-mono text-[.74rem] font-bold text-crimson-text">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[1.15rem] font-bold leading-snug text-text transition-colors group-hover:text-crimson-text sm:text-[1.3rem]">
                          {r.title}
                        </span>
                        <span className="mt-1.5 block max-w-[52ch] text-[.92rem] leading-[1.65] text-text2">
                          {r.desc}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[.72rem] font-semibold uppercase tracking-[.14em] text-crimson-text">
                          {r.action}
                          <ArrowUpRight
                            size={13}
                            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                          {r.external && NEW_TAB_HINT}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
