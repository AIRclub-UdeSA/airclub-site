const TIME_ZONE = "America/Argentina/Buenos_Aires";

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/**
 * "Sábado 12 de diciembre · 09:00hs", o sin horario si el evento dura todo el día (`allDay`). Con fin en otro día,
 * "Sábado 12 – Domingo 13". Los días se comparan en hora de Buenos Aires, no en la del servidor (en Vercel es UTC: un
 * evento de 00:00 a 23:59 de acá termina "al día siguiente" allá).
 */
export function formatEventDate(startsAt: Date, endsAt?: Date | null, allDay = false) {
  const dateFmt = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  });
  const timeFmt = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  });

  const date = capitalize(dateFmt.format(startsAt));
  const time = timeFmt.format(startsAt);

  if (endsAt && dayKey.format(endsAt) !== dayKey.format(startsAt)) {
    const endDate = capitalize(dateFmt.format(endsAt));
    return `${date} – ${endDate}`;
  }

  return allDay ? date : `${date} · ${time}hs`;
}

export function isUpcoming(startsAt: Date, endsAt?: Date | null) {
  const reference = endsAt ?? startsAt;
  return reference.getTime() >= Date.now();
}

/** Cuenta días de calendario, no horas exactas: "mañana" a las 23:59 sigue siendo "mañana". */
export function formatDaysUntil(startsAt: Date): string | null {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(startsAt);
  startOfTarget.setHours(0, 0, 0, 0);

  const days = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
  if (days < 0) return null;
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
