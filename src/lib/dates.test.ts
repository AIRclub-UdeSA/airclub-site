import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEventDate as format } from "./dates";

// Según la versión de ICU, el día de la semana sale con coma ("Sábado, 12") o sin ella: no es lo que se prueba acá.
const formatEventDate = (...args: Parameters<typeof format>) => format(...args).replaceAll(",", "");

// 00:00 a 23:59 de Buenos Aires: en UTC termina el día siguiente (02:59).
const dayStart = new Date("2026-12-12T00:00:00-03:00");
const dayEnd = new Date("2026-12-12T23:59:00-03:00");

test("un evento de todo el día muestra solo la fecha, sin horario ni salto al día siguiente", () => {
  assert.equal(formatEventDate(dayStart, dayEnd, true), "Sábado 12 de diciembre");
});

test("un evento con horario muestra la hora de inicio", () => {
  assert.equal(formatEventDate(new Date("2026-12-12T09:30:00-03:00"), new Date("2026-12-12T18:00:00-03:00")), "Sábado 12 de diciembre · 09:30hs");
  assert.equal(formatEventDate(new Date("2026-12-12T09:30:00-03:00")), "Sábado 12 de diciembre · 09:30hs");
});

test("un evento de 00:00 a 23:59 sin la marca de todo el día no salta al día siguiente (el servidor está en UTC)", () => {
  assert.equal(formatEventDate(dayStart, dayEnd), "Sábado 12 de diciembre · 00:00hs");
});

test("un evento de varios días muestra el primero y el último", () => {
  const end = new Date("2026-12-14T23:59:00-03:00");
  assert.equal(formatEventDate(dayStart, end, true), "Sábado 12 de diciembre – Lunes 14 de diciembre");
});
