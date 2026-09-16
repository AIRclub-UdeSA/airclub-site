import type { Metadata } from "next";
import { Anton, Syne, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/layout/SkipLink";
import { Nav } from "@/components/layout/Nav";
import { SponsorStrip } from "@/components/layout/SponsorStrip";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ScrollTopButton } from "@/components/layout/ScrollTopButton";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import { buildMetadata, SITE_URL } from "@/lib/seo";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", weight: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", weight: ["300", "400", "500", "600", "700"], subsets: ["latin"] });
const jbMono = JetBrains_Mono({ variable: "--font-jbmono", weight: ["300", "400", "500"], subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: "AIR Club UdeSA, Artificial Intelligence & Robotics Club",
    description:
      "AIR Club UdeSA: comunidad de estudiantes de la Universidad de San Andrés que aprende y crea con inteligencia artificial y robótica. Organizamos el Challenge JAR 2026 en Rosario.",
  }),
  icons: { icon: "/favicon.png" },
};

// Lee el tema guardado antes de que React hidrate, para evitar un flash del tema incorrecto.
const THEME_SCRIPT = `
try {
  var saved = localStorage.getItem('airTheme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      // El script de tema modifica esta clase antes de que React hidrate (para evitar
      // un flash del tema incorrecto), asi que un mismatch de className acá es esperado.
      suppressHydrationWarning
      className={`${anton.variable} ${syne.variable} ${outfit.variable} ${jbMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="overflow-x-hidden bg-bg font-body text-text antialiased">
        <SkipLink />
        <ParticlesBackground />
        <Nav />
        <main id="main-content">{children}</main>
        <SponsorStrip />
        <Footer />
        <ThemeToggle />
        <ScrollTopButton />
      </body>
    </html>
  );
}
