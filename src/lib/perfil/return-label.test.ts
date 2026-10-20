import { test } from "node:test";
import assert from "node:assert/strict";
import { returnPhrase } from "./return-label";

test("returnPhrase: las páginas públicas dicen a dónde se vuelve", () => {
  assert.equal(returnPhrase("/contacto"), "a Contacto");
  assert.equal(returnPhrase("/equipo#sumarte"), "a Equipo");
  assert.equal(returnPhrase("/talks"), "a AIR Talks");
  assert.equal(returnPhrase("/workshops/ros2/semana-01"), "a Workshops");
  assert.equal(returnPhrase("/"), "al inicio");
});

test("returnPhrase: con ?inscribir= vuelve a la inscripción", () => {
  assert.equal(returnPhrase("/talks?inscribir=tercer-air-talk"), "a tu inscripción");
});

test("returnPhrase: el perfil y lo desconocido no dicen nada", () => {
  assert.equal(returnPhrase("/perfil?guardado=1"), null);
  assert.equal(returnPhrase("/otra-cosa"), null);
  assert.equal(returnPhrase("/contactos"), null);
});
