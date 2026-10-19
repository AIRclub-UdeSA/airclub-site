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
          <p className="max-w-[72ch] font-body text-[1.05rem] leading-[1.8] text-text2 [&_a]:text-crimson-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:[overflow-wrap:anywhere]">
            Este sitio es operado por el AIR Club UdeSA, club estudiantil de la Universidad de San Andrés. Al iniciar sesión con Google
            accedemos únicamente a tu nombre y a tu dirección de correo electrónico, y los usamos para identificarte, crear tu perfil de
            miembro e inscribirte en las actividades del club. Junto con los datos de tu perfil (rol, carrera y año de ingreso), los
            almacenamos en nuestra base de datos, donde solo los ve el equipo del club desde su panel de administración. No vendemos
            ni cedemos estos datos a terceros ni los usamos con fines publicitarios. Podés corregirlos o eliminar tu cuenta cuando
            quieras desde <Link href="/perfil">tu perfil</Link>, o solicitar el acceso, la rectificación o la supresión de tus datos
            escribiendo a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. El sitio está dirigido a personas mayores de 18 años.
          </p>
        </div>
      </section>
    </>
  );
}
