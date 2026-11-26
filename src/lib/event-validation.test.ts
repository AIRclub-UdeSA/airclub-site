import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeRegistration, validateEventData, type EventFormData } from "./event-validation";

const base: EventFormData = {
  slug: "jar-ai-fest",
  title: "Challenge JAR en el AI FEST",
  description: "Un desafío de robótica.",
  startsAt: new Date("2026-12-12T09:00:00-03:00"),
  endsAt: new Date("2026-12-12T18:00:00-03:00"),
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

test("el equipo pide mínimo y máximo de integrantes coherentes", () => {
  const team = with_({ registrationType: "TEAM", audience: "UDESA" });
  assert.match(validateEventData(team)!, /mínimo y el máximo/);
  assert.match(validateEventData({ ...team, teamMinSize: 2 })!, /mínimo y el máximo/);
  assert.match(validateEventData({ ...team, teamMinSize: 0, teamMaxSize: 4 })!, /mínimo y el máximo/);
  assert.match(validateEventData({ ...team, teamMinSize: 4, teamMaxSize: 2 })!, /máximo/);
  assert.equal(validateEventData({ ...team, teamMinSize: 2, teamMaxSize: 4 }), null);
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
  const individual = normalizeRegistration({ ...dirty, registrationType: "INDIVIDUAL" });
  assert.equal(individual.audience, "UDESA");
  assert.equal(individual.capacity, 10);
  assert.equal(individual.teamMinSize, null);
  assert.equal(normalizeRegistration({ ...dirty, registrationType: "TEAM" }).teamMaxSize, 4);
  assert.equal(normalizeRegistration({ ...dirty, registrationType: "EXTERNAL_LINK" }).externalUrl, "https://x.test");
});
