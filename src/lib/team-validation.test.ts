import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTeam, TEAM_NAME_MAX_LENGTH, type TeamInput } from "./team-validation";

const base: TeamInput = {
  name: "Los Robots",
  captainEmail: "Cap@udesa.edu.ar",
  memberEmails: ["ana@udesa.edu.ar", "Luis@UDESA.edu.ar"],
  minSize: 2,
  maxSize: 4,
};
const with_ = (patch: Partial<TeamInput>): TeamInput => ({ ...base, ...patch });
const errorsOf = (input: TeamInput) => {
  const r = validateTeam(input);
  assert.equal(r.ok, false);
  return r.ok ? [] : r.errors;
};

test("un equipo válido devuelve el capitán primero y los emails en minúsculas", () => {
  assert.deepEqual(validateTeam(base), {
    ok: true,
    name: "Los Robots",
    emails: ["cap@udesa.edu.ar", "ana@udesa.edu.ar", "luis@udesa.edu.ar"],
  });
});

test("las filas vacías no cuentan y el nombre se limpia", () => {
  const r = validateTeam(with_({ name: "  Los   Robots ", memberEmails: ["ana@udesa.edu.ar", "", "  "] }));
  assert.deepEqual(r, { ok: true, name: "Los Robots", emails: ["cap@udesa.edu.ar", "ana@udesa.edu.ar"] });
});

test("el nombre es obligatorio y tiene un largo máximo", () => {
  assert.match(errorsOf(with_({ name: "   " }))[0], /nombre/);
  assert.match(errorsOf(with_({ name: "x".repeat(TEAM_NAME_MAX_LENGTH + 1) }))[0], /hasta 60/);
});

test("todos los integrantes tienen que ser @udesa.edu.ar", () => {
  const errors = errorsOf(with_({ memberEmails: ["ana@gmail.com", "luis@alumnos.udesa.edu.ar", "udesa.edu.ar"] }));
  assert.equal(errors.length, 3);
  assert.match(errors[0], /ana@gmail\.com no es un email @udesa\.edu\.ar/);
  assert.match(errors[1], /luis@alumnos\.udesa\.edu\.ar no es un email @udesa/);
  assert.match(errors[2], /no es un email válido/);
});

test("un email repetido se avisa una sola vez, aunque el repetido sea el capitán", () => {
  const dup = errorsOf(with_({ memberEmails: ["ana@udesa.edu.ar", "ANA@udesa.edu.ar", "ana@udesa.edu.ar"] }));
  assert.equal(dup.filter((e) => /repetido/.test(e)).length, 1);
  const self = errorsOf(with_({ memberEmails: ["cap@udesa.edu.ar"] }));
  assert.match(self[0], /sos vos/);
});

test("la cantidad cuenta al capitán y respeta el mínimo y el máximo", () => {
  assert.match(errorsOf(with_({ memberEmails: [] }))[0], /entre 2 y 4 integrantes.*ahora son 1/);
  assert.equal(validateTeam(with_({ memberEmails: ["a@udesa.edu.ar"] })).ok, true);
  assert.equal(validateTeam(with_({ memberEmails: ["a@udesa.edu.ar", "b@udesa.edu.ar", "c@udesa.edu.ar"] })).ok, true);
  const tooMany = errorsOf(with_({ memberEmails: ["a", "b", "c", "d"].map((x) => `${x}@udesa.edu.ar`) }));
  assert.match(tooMany[0], /ahora son 5/);
  assert.match(errorsOf(with_({ minSize: 3, maxSize: 3, memberEmails: ["a@udesa.edu.ar"] }))[0], /tiene que tener 3 integrantes/);
});

test("los errores vienen todos juntos", () => {
  assert.equal(errorsOf(with_({ name: "", memberEmails: ["x@gmail.com", "x@gmail.com"] })).length, 4);
});
