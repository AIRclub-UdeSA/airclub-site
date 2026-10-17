import { CONTACT_EMAIL, GITHUB_ORG_URL, YOUTUBE_CHANNEL_URL, getContactChannels } from "@/lib/contact";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { isUpcoming } from "@/lib/dates";
import type { EventItem } from "@/lib/events";
import type { TalkItem } from "@/lib/talks";

// Datos estructurados (JSON-LD, vocabulario de schema.org) para buscadores: no se ven en la página.
// Se validan con la Prueba de resultados enriquecidos de Google (https://search.google.com/test/rich-results).
// Ver #65.

export const ORG_LEGAL_NAME = "Club de Robótica e Inteligencia Artificial de la Universidad de San Andrés";

/** Los nombres con los que nos pueden buscar. Google los usa para asociar esas búsquedas con el club. */
const ALTERNATE_NAMES = [
  "AIR Club",
  "AIRclub",
  "AIR Club UdeSA",
  "Artificial Intelligence & Robotics Club",
  ORG_LEGAL_NAME,
  "Club de Robótica UdeSA",
  "Club de Robótica e IA de UdeSA",
];

const ORG_ID = new URL("/#organizacion", SITE_URL).toString();
const SITE_ID = new URL("/#sitio", SITE_URL).toString();

const UDESA = {
  "@type": "CollegeOrUniversity",
  name: "Universidad de San Andrés",
  url: "https://udesa.edu.ar",
};

const UDESA_VICTORIA = {
  "@type": "PostalAddress",
  streetAddress: "Vito Dumas 284",
  addressLocality: "Victoria",
  addressRegion: "Buenos Aires",
  addressCountry: "AR",
};

/** Referencia corta al club para el campo `organizer` de los eventos. */
const ORGANIZER = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: SITE_URL };

type JsonLd = Record<string, unknown>;

/** `Organization` + `WebSite` de la portada: qué es el club, su logo, sus perfiles y el nombre del sitio. */
export async function homeJsonLd(): Promise<JsonLd> {
  const channels = await getContactChannels();
  const profiles = channels.filter((c) => c.key === "instagram" || c.key === "linkedin").map((c) => c.href);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        legalName: ORG_LEGAL_NAME,
        alternateName: ALTERNATE_NAMES,
        url: SITE_URL,
        logo: new URL("/logo.png", SITE_URL).toString(),
        email: CONTACT_EMAIL,
        description:
          "Comunidad de estudiantes de la Universidad de San Andrés que aprende y crea con inteligencia artificial y robótica.",
        parentOrganization: UDESA,
        sameAs: [...profiles, YOUTUBE_CHANNEL_URL, GITHUB_ORG_URL],
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ALTERNATE_NAMES.slice(0, 3),
        inLanguage: "es",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** Lugar del evento. En el campus de Victoria usa la dirección completa, que es lo que Google pide en `address`. */
function placeOf(location: string | undefined, fallback?: string): JsonLd | undefined {
  const name = location ?? fallback;
  if (!name) return undefined;
  const atUdesa = /udesa|san andr[eé]s|victoria/i.test(name);
  return { "@type": "Place", name, address: atUdesa ? UDESA_VICTORIA : name };
}

function eventBase({
  name,
  description,
  startsAt,
  endsAt,
  url,
  location,
  registrationUrl,
}: {
  name: string;
  description: string;
  startsAt: Date;
  endsAt?: Date;
  url: string;
  location?: JsonLd;
  registrationUrl?: string;
}): JsonLd {
  return {
    "@type": "Event",
    name,
    description,
    startDate: startsAt.toISOString(),
    ...(endsAt ? { endDate: endsAt.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(location ? { location } : {}),
    url,
    image: [new URL("/opengraph-image", SITE_URL).toString()],
    organizer: ORGANIZER,
    // Las actividades del club son gratis; la oferta solo va mientras se puede anotar.
    ...(registrationUrl && isUpcoming(startsAt, endsAt)
      ? {
          offers: {
            "@type": "Offer",
            url: registrationUrl,
            price: 0,
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

/** `Event` de una página `/eventos/<slug>`. */
export function eventJsonLd(event: EventItem): JsonLd {
  return {
    "@context": "https://schema.org",
    ...eventBase({
      name: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      url: new URL(`/eventos/${event.slug}`, SITE_URL).toString(),
      location: placeOf(event.location),
      registrationUrl: event.externalUrl,
    }),
  };
}

/** Un `Event` por charla confirmada con fecha, para `/talks`. Las "a confirmar" no van: título y orador son provisorios. */
export function talksJsonLd(talks: TalkItem[]): JsonLd | undefined {
  const talksUrl = new URL("/talks", SITE_URL).toString();
  const events = talks
    .filter((t): t is TalkItem & { startsAt: Date } => t.confirmed && !t.draft && !!t.startsAt)
    .map((t) => ({
      ...eventBase({
        name: t.title,
        description: t.abstract || t.subtitle,
        startsAt: t.startsAt,
        endsAt: t.endsAt,
        url: talksUrl,
        location: placeOf(t.location, "Campus Victoria, UdeSA"),
        registrationUrl: t.cta?.url ?? (t.registrationOpen ? talksUrl : undefined),
      }),
      ...(t.speakers?.length ? { performer: t.speakers.map((s) => ({ "@type": "Person", name: s.name })) } : {}),
    }));
  if (!events.length) return undefined;
  return { "@context": "https://schema.org", "@graph": events };
}
