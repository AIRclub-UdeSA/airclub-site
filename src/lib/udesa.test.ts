import { test } from "node:test";
import assert from "node:assert/strict";
import { canRegisterTo, isUdesaEmail, parseAudience } from "./udesa";

test("isUdesaEmail: solo el dominio @udesa.edu.ar, sin importar mayúsculas", () => {
  assert.equal(isUdesaEmail("persona@udesa.edu.ar"), true);
  assert.equal(isUdesaEmail("Persona@UdeSA.edu.AR"), true);
});

test("isUdesaEmail: rechaza otros dominios, subdominios y trucos de sufijo", () => {
  for (const email of [
    "persona@gmail.com",
    "persona@alumnos.udesa.edu.ar",
    "persona@udesa.edu.ar.evil.com",
    "persona@notudesa.edu.ar",
    "persona@udesa.edu.ar ",
    "udesa.edu.ar",
    "",
  ]) {
    assert.equal(isUdesaEmail(email), false, email);
  }
  assert.equal(isUdesaEmail(null), false);
  assert.equal(isUdesaEmail(undefined), false);
});

test("canRegisterTo: ALL deja pasar a cualquiera; UDESA, solo a la comunidad", () => {
  assert.equal(canRegisterTo("ALL", "persona@gmail.com"), true);
  assert.equal(canRegisterTo("ALL", "persona@udesa.edu.ar"), true);
  assert.equal(canRegisterTo("UDESA", "persona@udesa.edu.ar"), true);
  assert.equal(canRegisterTo("UDESA", "persona@gmail.com"), false);
});

test("parseAudience: solo los dos valores del enum; sin elegir da null", () => {
  assert.equal(parseAudience("UDESA"), "UDESA");
  assert.equal(parseAudience("ALL"), "ALL");
  for (const v of ["", "udesa", "TODOS", null, undefined, 1]) assert.equal(parseAudience(v), null, String(v));
});
