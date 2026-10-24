import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDigest, DIGEST_SUBJECT, digestSummary, type DigestItem } from "./digest";

const item = (over: Partial<DigestItem> = {}): DigestItem => ({
  id: "f1",
  type: "BUG",
  path: "/eventos",
  message: "El calendario se corta",
  createdAt: new Date("2026-10-23T15:30:00Z"),
  ...over,
});

test("el asunto es siempre el mismo, para poder filtrarlo", () => {
  assert.equal(buildDigest([item()], "https://x.com").subject, DIGEST_SUBJECT);
  assert.equal(buildDigest([item(), item({ id: "f2", type: "IDEA" })], "https://x.com").subject, DIGEST_SUBJECT);
});

test("el resumen cuenta por tipo, en el orden de los tipos", () => {
  const items = [item({ type: "IDEA" }), item({ type: "BUG" }), item({ type: "BUG" })];
  assert.equal(digestSummary(items), "3 feedback: 2 Bug, 1 Idea");
});

test("cada feedback lleva su link al panel, sin barra doble", () => {
  const { text, html } = buildDigest([item()], "https://x.com/");
  assert.ok(text.includes("https://x.com/admin/feedback/f1"));
  assert.ok(html.includes('href="https://x.com/admin/feedback/f1"'));
  assert.ok(text.includes("23/10, 12:30"), "hora de Argentina");
});

test("escapa el texto del feedback en el HTML", () => {
  const { html } = buildDigest([item({ message: '<img src=x onerror="alert(1)">' })], "https://x.com");
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});

test("recorta los mensajes largos", () => {
  const { text } = buildDigest([item({ message: "a".repeat(1000) })], "https://x.com");
  assert.ok(text.includes("a".repeat(280) + "…"));
  assert.ok(!text.includes("a".repeat(281)));
});
