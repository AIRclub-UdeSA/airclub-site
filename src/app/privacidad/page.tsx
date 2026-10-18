import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacidad, AIR Club UdeSA",
  description: "Qué datos te pedimos en el sitio del AIR Club UdeSA, para qué los usamos y cómo pedir verlos o borrarlos.",
  path: "/privacidad",
});

// Texto corto e informal, sin revisión legal (decisión del dueño). No prometer nada que el sitio no haga.
const SECTIONS: { title: string; accent: string; body: React.ReactNode }[] = [
  {
    title: "Qué datos",
    accent: "pedimos",
    body: (
      <>
        <p>
          Entrás con tu cuenta de Google, así que vemos tu mail y tu nombre, pero solo guardamos el mail. Después te pedimos un perfil cortito: tu rol (estudiante,
          docente u otro), y si sos estudiante, tu carrera, el año en que empezaste y si seguís cursando o ya te graduaste.
        </p>
        <p>Guardamos también a qué charlas te inscribiste.</p>
      </>
    ),
  },
  {
    title: "Para qué",
    accent: "los usamos",
    body: (
      <p>
        Es como una encuesta para conocer quién se interesa en el club, y para armar las listas de inscriptos a las charlas. No
        mandamos tus datos a otras empresas ni los usamos para publicidad.
      </p>
    ),
  },
  {
    title: "Quién",
    accent: "los ve",
    body: <p>El equipo del club, desde el panel de administración del sitio. Nadie más ve tu perfil.</p>,
  },
  {
    title: "Cómo verlos, corregirlos",
    accent: "o borrarlos",
    body: (
      <>
        <p>
          Podés corregir tu perfil cuando quieras desde <Link href="/perfil">tu perfil</Link>. Y si querés borrar todo, en el mismo lugar está
          “Borrar mi cuenta”: se borran tu perfil y tus inscripciones.
        </p>
        <p>
          Para pedir una copia de lo que tenemos de vos, o cualquier otra cosa, escribinos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    title: "Solo para",
    accent: "mayores de 18",
    body: <p>El sitio es para mayores de 18 años. No te preguntamos la edad: si entrás, damos por hecho que lo sos.</p>,
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <header className="pb-10 pt-24 md:pb-14">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/6.4))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/7.4))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/8.6))]">
          Privacidad
        </h1>
      </header>

      {SECTIONS.map((s, i) => (
        <section key={s.title} className={i % 2 === 0 ? "py-14 md:py-20" : "bg-bg2 py-14 md:py-20"}>
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 sm:px-8 md:px-12 lg:grid-cols-12 lg:gap-12">
            <h2 className="font-logo text-[clamp(2.5rem,5vw,4.5rem)] uppercase leading-[0.95] tracking-tight text-text lg:col-span-5">
              {s.title} <span className="text-crimson-text">{s.accent}</span>
            </h2>
            <div className="flex max-w-[62ch] flex-col gap-4 font-body text-[1.02rem] leading-[1.75] text-text2 lg:col-span-7 [&_a]:text-crimson-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:[overflow-wrap:anywhere]">
              {s.body}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
