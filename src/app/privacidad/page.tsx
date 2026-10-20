import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacidad, AIR Club UdeSA",
  description: "Qué datos te pedimos en el sitio del AIR Club UdeSA, para qué los usamos y cómo pedir verlos o borrarlos.",
  path: "/privacidad",
});

export default function PrivacidadPage() {
  return (
    <>
      <header className="pb-10 pt-24 md:pb-14">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/6.4))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/7.4))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/8.6))]">
          Privacidad
        </h1>
      </header>

      {/* Texto formal y breve, sin revisión legal (decisión del dueño). No prometer nada que el sitio no haga. */}
      <section className="bg-bg2 py-14 md:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <div className="flex max-w-[72ch] flex-col gap-5 font-body text-[1.05rem] leading-[1.8] text-text2 [&_a]:text-crimson-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:[overflow-wrap:anywhere]">
            <p>
              Este sitio es operado por el AIR Club UdeSA, club estudiantil de la Universidad de San Andrés. Al iniciar sesión con
              Google, la cuenta le informa al sitio tu nombre, tu dirección de correo electrónico y tu foto de perfil; de ellos
              guardamos únicamente el correo, que identifica tu cuenta. El nombre solo se te sugiere al completar tu perfil y la foto
              se muestra mientras tenés la sesión abierta, sin guardarse.
            </p>
            <p>
              Lo demás lo cargás vos: tu nombre y apellido, de dónde sos (UdeSA, otra universidad, trabajo o independiente, con el
              nombre de la institución cuando corresponde), tu rol, tu carrera y año de inicio si sos estudiante, y la fecha en que
              aceptaste este aviso y la de tu alta en la comunidad. También guardamos tus inscripciones a charlas y talleres y los
              talleres que marcás como hechos. Usamos estos datos para identificarte, para anotarte en las actividades del club y para
              saber quiénes participan; los almacenamos en nuestra base de datos, donde solo los ve el equipo del club desde su panel
              de administración. No vendemos ni cedemos estos datos a terceros ni los usamos con fines publicitarios. Podés corregirlos
              o eliminar tu cuenta cuando quieras desde <Link href="/perfil">tu perfil</Link>, o solicitar el acceso, la rectificación
              o la supresión de tus datos escribiendo a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. El sitio está
              dirigido a personas mayores de 18 años.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
