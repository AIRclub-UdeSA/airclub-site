// Calendario académico de UdeSA, copiado a mano de los PDF oficiales publicados en
// https://www.udesa.edu.ar/calendarios (2026 y 2027). Las fechas son días calendario de Buenos Aires
// (YYYY-MM-DD), sin hora. Cuando UdeSA publique un año nuevo, agregarlo acá.

export interface UdesaHoliday {
  date: string;
  name: string;
}

export const UDESA_HOLIDAYS: UdesaHoliday[] = [
  // 2026
  { date: "2026-02-16", name: "Carnaval" },
  { date: "2026-02-17", name: "Carnaval" },
  { date: "2026-03-24", name: "Día Nacional de la Memoria por la Verdad y la Justicia" },
  { date: "2026-04-02", name: "Día del Veterano y de los Caídos en Malvinas" },
  { date: "2026-04-03", name: "Viernes Santo" },
  { date: "2026-05-01", name: "Día del Trabajador" },
  { date: "2026-05-25", name: "Día de la Revolución de Mayo" },
  { date: "2026-06-15", name: "Paso a la Inmortalidad de Güemes" },
  { date: "2026-06-20", name: "Paso a la Inmortalidad de Belgrano" },
  { date: "2026-07-09", name: "Día de la Independencia" },
  { date: "2026-08-17", name: "Paso a la Inmortalidad de San Martín" },
  { date: "2026-10-12", name: "Día del Respeto a la Diversidad Cultural" },
  { date: "2026-11-23", name: "Día de la Soberanía Nacional" },
  { date: "2026-12-08", name: "Inmaculada Concepción de María" },
  { date: "2026-12-25", name: "Navidad" },
  // 2027
  { date: "2027-03-24", name: "Día Nacional de la Memoria por la Verdad y la Justicia" },
  { date: "2027-03-25", name: "Jueves Santo" },
  { date: "2027-03-26", name: "Viernes Santo" },
  { date: "2027-04-02", name: "Día del Veterano y de los Caídos en Malvinas" },
  { date: "2027-05-01", name: "Día del Trabajador" },
  { date: "2027-05-25", name: "Día de la Revolución de Mayo" },
  { date: "2027-06-20", name: "Paso a la Inmortalidad de Belgrano" },
  { date: "2027-06-21", name: "Paso a la Inmortalidad de Güemes" },
  { date: "2027-07-09", name: "Día de la Independencia" },
  { date: "2027-08-16", name: "Paso a la Inmortalidad de San Martín" },
  { date: "2027-10-11", name: "Día del Respeto a la Diversidad Cultural" },
  { date: "2027-11-20", name: "Día de la Soberanía Nacional" },
  { date: "2027-12-08", name: "Inmaculada Concepción de María" },
  { date: "2027-12-25", name: "Navidad" },
];

const holidaysByDay = new Map(UDESA_HOLIDAYS.map((h) => [h.date, h]));

export function getUdesaHoliday(dayKey: string): UdesaHoliday | undefined {
  return holidaysByDay.get(dayKey);
}

// Fechas académicas: un tramo de varios días (parciales, finales...) o un hito de un solo día
// (inicio de semestre, plazos). `end` es inclusivo; en los hitos coincide con `start`.
export interface UdesaAcademicDate {
  start: string;
  end: string;
  label: string;
}

export const UDESA_ACADEMIC_DATES: UdesaAcademicDate[] = [
  // 2026
  { start: "2026-02-27", end: "2026-02-27", label: "Acto de apertura" },
  { start: "2026-03-02", end: "2026-03-02", label: "Inicio de semestre" },
  { start: "2026-03-20", end: "2026-03-20", label: "Cierre altas/bajas" },
  { start: "2026-04-24", end: "2026-04-24", label: "Último día de baja" },
  { start: "2026-04-25", end: "2026-05-09", label: "Parciales" },
  { start: "2026-06-27", end: "2026-07-11", label: "Finales" },
  { start: "2026-07-13", end: "2026-07-18", label: "Recuperatorios" },
  { start: "2026-07-20", end: "2026-08-01", label: "Vacaciones" },
  { start: "2026-08-03", end: "2026-08-03", label: "Inicio de semestre" },
  { start: "2026-08-21", end: "2026-08-21", label: "Cierre altas/bajas" },
  { start: "2026-09-25", end: "2026-09-25", label: "Último día de baja" },
  { start: "2026-09-26", end: "2026-10-10", label: "Parciales" },
  { start: "2026-11-28", end: "2026-12-12", label: "Finales" },
  { start: "2026-12-14", end: "2026-12-19", label: "Recuperatorios" },
  // 2027
  { start: "2027-02-26", end: "2027-02-26", label: "Acto de apertura" },
  { start: "2027-03-01", end: "2027-03-01", label: "Inicio de semestre" },
  { start: "2027-03-19", end: "2027-03-19", label: "Cierre altas/bajas" },
  { start: "2027-04-23", end: "2027-04-23", label: "Último día de baja" },
  { start: "2027-04-24", end: "2027-05-08", label: "Parciales" },
  { start: "2027-06-26", end: "2027-07-10", label: "Finales" },
  { start: "2027-07-12", end: "2027-07-17", label: "Recuperatorios" },
  { start: "2027-07-19", end: "2027-07-31", label: "Vacaciones" },
  { start: "2027-08-02", end: "2027-08-02", label: "Inicio de semestre" },
  { start: "2027-08-20", end: "2027-08-20", label: "Cierre altas/bajas" },
  { start: "2027-09-24", end: "2027-09-24", label: "Último día de baja" },
  { start: "2027-09-25", end: "2027-10-09", label: "Parciales" },
  { start: "2027-11-27", end: "2027-12-11", label: "Finales" },
  { start: "2027-12-13", end: "2027-12-18", label: "Recuperatorios" },
];

// Las claves YYYY-MM-DD se comparan bien como texto.
export function getUdesaAcademicDate(dayKey: string): UdesaAcademicDate | undefined {
  return UDESA_ACADEMIC_DATES.find((d) => d.start <= dayKey && dayKey <= d.end);
}
