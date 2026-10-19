import { test } from "node:test";
import assert from "node:assert/strict";
import { adminAccessFor, canSignIn } from "./auth-access";

const row = (overrides: Partial<{ role: "ADMIN" | "EDITOR"; sections: string[]; active: boolean }> = {}) => ({
  id: "adm1",
  role: "EDITOR" as const,
  sections: ["talks"],
  active: true,
  ...overrides,
});

test("canSignIn: cualquier cuenta de Google con el mail verificado entra, sea o no de UdeSA", () => {
  assert.equal(canSignIn({ email: "ana@gmail.com", email_verified: true }), true);
  assert.equal(canSignIn({ email: "ana@udesa.edu.ar", email_verified: true }), true);
});

test("canSignIn: sin mail verificado no se entra", () => {
  assert.equal(canSignIn({ email: "ana@gmail.com", email_verified: false }), false);
  assert.equal(canSignIn({ email: "ana@gmail.com", email_verified: null }), false);
  assert.equal(canSignIn({ email: "ana@gmail.com" }), false);
  assert.equal(canSignIn({ email_verified: true }), false);
  assert.equal(canSignIn(undefined), false);
});

test("adminAccessFor: un mail @udesa.edu.ar activo en AdminUser obtiene su rol y sus secciones", () => {
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar", row()), { adminId: "adm1", role: "EDITOR", sections: ["talks"] });
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar", row({ role: "ADMIN", sections: [] })), {
    adminId: "adm1",
    role: "ADMIN",
    sections: [],
  });
});

test("adminAccessFor: un mail externo no obtiene rol aunque exista una fila activa en AdminUser", () => {
  const none = { adminId: null, role: null, sections: [] };
  assert.deepEqual(adminAccessFor("ana@gmail.com", row({ role: "ADMIN" })), none);
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar.evil.com", row()), none);
  assert.deepEqual(adminAccessFor("ana@alumnos.udesa.edu.ar", row()), none);
});

test("adminAccessFor: sin fila o con la fila desactivada no hay rol, ni siquiera siendo @udesa", () => {
  const none = { adminId: null, role: null, sections: [] };
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar", null), none);
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar", undefined), none);
  assert.deepEqual(adminAccessFor("ana@udesa.edu.ar", row({ active: false })), none);
});
