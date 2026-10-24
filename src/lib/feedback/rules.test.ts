import { test } from "node:test";
import assert from "node:assert/strict";
import { FEEDBACK_MAX_LENGTH, normalizePath, validateFeedback } from "./rules";

const base = { type: "BUG", message: "El botón no anda", path: "/eventos" };

test("acepta un feedback mínimo y deja lo opcional en null", () => {
  const result = validateFeedback(base);
  assert.deepEqual(result, {
    ok: true,
    data: { type: "BUG", message: "El botón no anda", path: "/eventos", viewport: null, theme: null, email: null },
  });
});

test("rechaza un tipo que no existe", () => {
  assert.equal(validateFeedback({ ...base, type: "SPAM" }).ok, false);
  assert.equal(validateFeedback({ ...base, type: "" }).ok, false);
});

test("rechaza el texto vacío y el que pasa del máximo", () => {
  assert.equal(validateFeedback({ ...base, message: "   " }).ok, false);
  assert.equal(validateFeedback({ ...base, message: "a".repeat(FEEDBACK_MAX_LENGTH + 1) }).ok, false);
  assert.equal(validateFeedback({ ...base, message: "a".repeat(FEEDBACK_MAX_LENGTH) }).ok, true);
});

test("valida el formato del email y lo guarda en minúsculas", () => {
  assert.equal(validateFeedback({ ...base, email: "no-es-un-mail" }).ok, false);
  assert.equal(validateFeedback({ ...base, email: "a@b" }).ok, false);
  const result = validateFeedback({ ...base, email: " Ana@Mail.com " });
  assert.ok(result.ok);
  assert.equal(result.data.email, "ana@mail.com");
});

test("la ruta se guarda sin query string ni hash", () => {
  assert.equal(normalizePath("/ingresar?next=/perfil&token=abc"), "/ingresar");
  assert.equal(normalizePath("/talks#proximas"), "/talks");
  assert.equal(normalizePath("/"), "/");
});

test("rechaza rutas que no son internas", () => {
  for (const path of ["https://evil.com", "//evil.com", "/\\evil.com", "/\t/evil.com", "eventos", ""]) {
    assert.equal(normalizePath(path), null, path);
    assert.equal(validateFeedback({ ...base, path }).ok, false, path);
  }
});

test("descarta viewport y tema con formato raro en vez de rechazar el envío", () => {
  const result = validateFeedback({ ...base, viewport: "<script>", theme: "rosa" });
  assert.ok(result.ok);
  assert.equal(result.data.viewport, null);
  assert.equal(result.data.theme, null);

  const good = validateFeedback({ ...base, viewport: "390x844", theme: "dark" });
  assert.ok(good.ok);
  assert.equal(good.data.viewport, "390x844");
  assert.equal(good.data.theme, "dark");
});
