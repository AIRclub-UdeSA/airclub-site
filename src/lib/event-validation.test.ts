import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEventDates, normalizeRegistration, validateEventData, type EventFormData } from "./event-validation";

const base: EventFormData = {
  slug: "jar-ai-fest",
  title: "Challenge JAR en el AI FEST",
  description: "Un desafío de robótica.",
  startsAt: new Date("2026-12-12T09:00:00-03:00"),
  endsAt: new Date("2026-12-12T18:00:00-03:00"),
  allDay: false,
  hasStartTime: true,
  registrationType: "NONE",
  externalUrl: null,
  registrationDeadline: null,
  audience: null,
  capacity: null,
  teamMinSize: null,
  teamMaxSize: null,
};
const with_ = (patch: Partial<EventFormData>): EventFormData => ({ ...base, ...patch });

test("un evento sin inscripción solo pide los datos básicos", () => {
  assert.equal(validateEventData(base), null);
  assert.match(validateEventData(with_({ slug: "" }))!, /slug/);
  assert.match(validateEventData(with_({ slug: "Jar 2026" }))!, /slug/);
  assert.match(validateEventData(with_({ title: "" }))!, /título/);
  assert.match(validateEventData(with_({ startsAt: null }))!, /inicio/);
  assert.match(validateEventData(with_({ endsAt: new Date("2026-12-11T10:00:00-03:00") }))!, /fin/);
  assert.match(validateEventData(with_({ registrationType: null }))!, /inscribe/);
});

test("el link externo pide una URL http(s)", () => {
  assert.match(validateEventData(with_({ registrationType: "EXTERNAL_LINK" }))!, /URL/);
  assert.match(validateEventData(with_({ registrationType: "EXTERNAL_LINK", externalUrl: "javascript:alert(1)" }))!, /URL/);
  assert.equal(validateEventData(with_({ registrationType: "EXTERNAL_LINK", externalUrl: "https://forms.gle/x" })), null);
});

test("la inscripción individual exige elegir quién puede inscribirse y un cupo válido", () => {
  assert.match(validateEventData(with_({ registrationType: "INDIVIDUAL" }))!, /quién/);
  assert.equal(validateEventData(with_({ registrationType: "INDIVIDUAL", audience: "UDESA" })), null);
  for (const capacity of [0, -3, 2.5, Number.NaN]) {
    assert.match(validateEventData(with_({ registrationType: "INDIVIDUAL", audience: "ALL", capacity }))!, /cupo/, String(capacity));
  }
  assert.equal(validateEventData(with_({ registrationType: "INDIVIDUAL", audience: "ALL", capacity: 40 })), null);
});

test("el cierre de la inscripción no puede ser después del evento", () => {
  const late = new Date("2026-12-13T09:00:00-03:00");
  assert.match(validateEventData(with_({ registrationType: "INDIVIDUAL", audience: "ALL", registrationDeadline: late }))!, /cerrar/);
  const ok = new Date("2026-12-10T23:59:00-03:00");
  assert.equal(validateEventData(with_({ registrationType: "INDIVIDUAL", audience: "ALL", registrationDeadline: ok })), null);
});

test("el equipo acepta mínimo y máximo vacíos (sin límite) y pide que los que haya sean coherentes", () => {
  const team = with_({ registrationType: "TEAM", audience: "UDESA" });
  assert.equal(validateEventData(team), null);
  assert.equal(validateEventData({ ...team, teamMinSize: 2 }), null);
  assert.equal(validateEventData({ ...team, teamMaxSize: 20 }), null);
  assert.equal(validateEventData({ ...team, teamMinSize: 2, teamMaxSize: 4 }), null);
  assert.equal(validateEventData({ ...team, teamMinSize: 3, teamMaxSize: 3 }), null);
  for (const patch of [{ teamMinSize: 0 }, { teamMaxSize: 0 }, { teamMinSize: 1.5 }, { teamMaxSize: Number.NaN }, { teamMinSize: -2, teamMaxSize: 4 }]) {
    assert.match(validateEventData({ ...team, ...patch })!, /enteros desde 1/, JSON.stringify(patch));
  }
  assert.match(validateEventData({ ...team, teamMinSize: 4, teamMaxSize: 2 })!, /máximo/);
});

test("un evento que no es de todo el día necesita la hora de inicio", () => {
  assert.match(validateEventData(with_({ hasStartTime: false }))!, /hora de inicio/);
  assert.equal(validateEventData(with_({ hasStartTime: false, allDay: true })), null);
});

test("el equipo es solo para la comunidad UdeSA", () => {
  const team = with_({ registrationType: "TEAM", teamMinSize: 2, teamMaxSize: 4 });
  assert.match(validateEventData({ ...team, audience: "ALL" })!, /solo para la comunidad UdeSA/);
  assert.equal(validateEventData({ ...team, audience: "UDESA" }), null);
});

test("al guardar solo queda lo que usa el tipo elegido", () => {
  const dirty = with_({
    registrationType: "NONE",
    externalUrl: "https://x.test",
    audience: "UDESA",
    capacity: 10,
    teamMinSize: 2,
    teamMaxSize: 4,
    registrationDeadline: new Date(),
  });
  assert.deepEqual(normalizeRegistration(dirty), {
    externalUrl: null,
    registrationDeadline: null,
    audience: "ALL",
    capacity: null,
    teamMinSize: null,
    teamMaxSize: null,
  });
  // Sin límite: el equipo guarda null en el lado que quedó vacío.
  const open = normalizeRegistration({ ...dirty, registrationType: "TEAM", teamMinSize: null });
  assert.equal(open.teamMinSize, null);
  assert.equal(open.teamMaxSize, 4);
  const individual = normalizeRegistration({ ...dirty, registrationType: "INDIVIDUAL" });
  assert.equal(individual.audience, "UDESA");
  assert.equal(individual.capacity, 10);
  assert.equal(individual.teamMinSize, null);
  assert.equal(normalizeRegistration({ ...dirty, registrationType: "TEAM" }).teamMaxSize, 4);
  assert.equal(normalizeRegistration({ ...dirty, registrationType: "EXTERNAL_LINK" }).externalUrl, "https://x.test");
});

test("un evento de todo el día va de 00:00 a 23:59 (hora de Argentina) del último día", () => {
  const input = { date: "2026-12-12", startTime: "", endTime: "", endDate: "", allDay: true };
  const one = buildEventDates(input);
  assert.equal(one.startsAt?.toISOString(), "2026-12-12T03:00:00.000Z");
  assert.equal(one.endsAt?.toISOString(), "2026-12-13T02:59:00.000Z");
  // Las horas que quedaron cargadas no pesan si está marcado "todo el día".
  assert.deepEqual(buildEventDates({ ...input, startTime: "09:00", endTime: "18:00" }), one);
  assert.equal(buildEventDates({ ...input, endDate: "2026-12-14" }).endsAt?.toISOString(), "2026-12-15T02:59:00.000Z");
});

test("con horario, el fin es la hora de fin del mismo día, o la del día de fin", () => {
  const input = { date: "2026-12-12", startTime: "09:00", endTime: "", endDate: "", allDay: false };
  assert.equal(buildEventDates(input).startsAt?.toISOString(), "2026-12-12T12:00:00.000Z");
  assert.equal(buildEventDates(input).endsAt, null);
  assert.equal(buildEventDates({ ...input, endTime: "18:00" }).endsAt?.toISOString(), "2026-12-12T21:00:00.000Z");
  assert.equal(buildEventDates({ ...input, endDate: "2026-12-13", endTime: "13:00" }).endsAt?.toISOString(), "2026-12-13T16:00:00.000Z");
  assert.equal(buildEventDates({ ...input, endDate: "2026-12-13" }).endsAt?.toISOString(), "2026-12-14T02:59:00.000Z");
  assert.deepEqual(buildEventDates({ ...input, date: "" }), { startsAt: null, endsAt: null });
});
