import { test } from "node:test";
import assert from "node:assert/strict";
import { textParagraphs } from "./talk-format";

test("separa párrafos con saltos de línea \\n (seed) y \\r\\n (textarea del panel)", () => {
  assert.deepEqual(textParagraphs("uno\n\ndos"), ["uno", "dos"]);
  assert.deepEqual(textParagraphs("uno\r\n\r\ndos"), ["uno", "dos"]);
});

test("un renglón con espacios también separa, y los renglones en blanco de más no dejan párrafos vacíos", () => {
  assert.deepEqual(textParagraphs("uno\r\n  \r\ndos\n\n\n\ntres\n"), ["uno", "dos", "tres"]);
});

test("un salto de línea simple no corta el párrafo", () => {
  assert.deepEqual(textParagraphs("uno\r\nsigue"), ["uno\r\nsigue"]);
});
