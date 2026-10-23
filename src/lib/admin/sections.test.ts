import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditSection, canViewSection, sectionAssignLabel, sectionLabel } from "./sections";

const admin = { role: "ADMIN" as const, sections: [] };
const editor = (...sections: string[]) => ({ role: "EDITOR" as const, sections });

test("ADMIN ve y edita todas las secciones, incluidas las que no son asignables", () => {
  for (const section of ["talks", "equipo", "comunidad", "permisos"]) {
    assert.equal(canViewSection(admin, section), true, section);
    assert.equal(canEditSection(admin, section), true, section);
  }
});

test("un Editor con una sección de edición la ve y la edita", () => {
  assert.equal(canViewSection(editor("talks"), "talks"), true);
  assert.equal(canEditSection(editor("talks"), "talks"), true);
});

test("un Editor con workshops la ve y la edita", () => {
  assert.equal(canViewSection(editor("workshops"), "workshops"), true);
  assert.equal(canEditSection(editor("workshops"), "workshops"), true);
});

test("un Editor con comunidad la ve pero no la edita", () => {
  assert.equal(canViewSection(editor("comunidad"), "comunidad"), true);
  assert.equal(canEditSection(editor("comunidad"), "comunidad"), false);
});

test("un Editor sin la sección asignada no la ve ni la edita", () => {
  assert.equal(canViewSection(editor("talks"), "comunidad"), false);
  assert.equal(canEditSection(editor("talks"), "comunidad"), false);
  assert.equal(canViewSection(editor("comunidad"), "talks"), false);
});

test("una sección desconocida asignada a mano no da permiso de edición", () => {
  assert.equal(canEditSection(editor("permisos"), "permisos"), false);
});

test("las etiquetas aclaran las secciones de solo ver", () => {
  assert.equal(sectionAssignLabel("comunidad"), "Comunidad (solo ver)");
  assert.equal(sectionAssignLabel("talks"), "Charlas");
  assert.equal(sectionLabel("comunidad"), "Comunidad");
  assert.equal(sectionAssignLabel("otra"), "otra");
});
