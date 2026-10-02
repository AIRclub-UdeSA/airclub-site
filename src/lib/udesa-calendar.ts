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
