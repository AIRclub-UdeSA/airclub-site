import {
  channels as seedChannels,
  reasons as seedReasons,
  CONTACT_EMAIL,
  type SeedContactChannel,
  type SeedContactReason,
} from "../../prisma/seed-data/contact";

export type ContactChannel = SeedContactChannel;
export type ContactReason = Omit<SeedContactReason, "url" | "subject" | "body"> & {
  /** Destino ya resuelto: el formulario o un mailto con asunto y plantilla. */
  href: string;
  external: boolean;
};

export { CONTACT_EMAIL };

/** Arma un mailto al correo del club con asunto y, si hay, plantilla de cuerpo. */
export function buildMailto(subject: string, body?: string[]): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body?.length) params.push(`body=${encodeURIComponent(body.join("\r\n"))}`);
  return `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}

function toReason({ url, subject, body, ...rest }: SeedContactReason): ContactReason {
  return {
    ...rest,
    href: url ?? buildMailto(subject ?? "Consulta", body),
    external: Boolean(url),
  };
}

// Fase 1: lee de los arrays tipados en prisma/seed-data. Cuando se conecte Postgres estas funciones pasan a consultar
// Prisma, pero la firma no cambia.
export async function getContactChannels(): Promise<ContactChannel[]> {
  return [...seedChannels];
}

export async function getContactReasons(): Promise<ContactReason[]> {
  return seedReasons.map(toReason);
}

export async function getContactReason(key: ContactReason["key"]): Promise<ContactReason> {
  const reason = seedReasons.find((r) => r.key === key);
  if (!reason) throw new Error(`Motivo de contacto inexistente: ${key}`);
  return toReason(reason);
}
