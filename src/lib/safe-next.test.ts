import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "./safe-next";

test("rechaza destinos que el navegador manda a otro host", () => {
  for (const next of ["/\\evil.com", "/\\/evil.com", "/\t/evil.com", "/\n/evil.com", "//evil.com", "https://evil.com"]) {
    assert.equal(safeNext(next), "/", next);
  }
});

test("deja pasar rutas propias con query y hash", () => {
  assert.equal(safeNext("/talks?inscribir=x"), "/talks?inscribir=x");
  assert.equal(safeNext("/perfil#datos"), "/perfil#datos");
});

test("usa el fallback si no hay destino", () => {
  assert.equal(safeNext(undefined, "/talks"), "/talks");
  assert.equal(safeNext("", "/talks"), "/talks");
});
