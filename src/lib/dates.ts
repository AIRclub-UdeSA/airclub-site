const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function formatEventDate(startsAt: Date, endsAt?: Date | null) {
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

  if (endsAt && endsAt.toDateString() !== startsAt.toDateString()) {
    const endDate = capitalize(dateFmt.format(endsAt));
    return `${date} – ${endDate}`;
  }

  return `${date} · ${time}hs`;
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
