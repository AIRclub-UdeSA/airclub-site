import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIp, hashIp, isRateLimited, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./spam";

test("el hash de la IP es estable, depende del secreto y no contiene la IP", () => {
  const a = hashIp("200.1.2.3", "secreto");
  assert.equal(a, hashIp("200.1.2.3", "secreto"));
  assert.notEqual(a, hashIp("200.1.2.3", "otro"));
  assert.notEqual(a, hashIp("200.1.2.4", "secreto"));
  assert.ok(!a.includes("200.1.2.3"));
});

test("toma la primera IP de x-forwarded-for", () => {
  assert.equal(clientIp("200.1.2.3, 10.0.0.1", null), "200.1.2.3");
  assert.equal(clientIp(null, " 200.1.2.3 "), "200.1.2.3");
  assert.equal(clientIp(null, null), "unknown");
});

test(`deja pasar hasta ${RATE_LIMIT_MAX - 1} envíos previos y frena desde ${RATE_LIMIT_MAX}`, async () => {
  for (let previous = 0; previous < RATE_LIMIT_MAX; previous++) {
    assert.equal(await isRateLimited("h", async () => previous), false, String(previous));
  }
  assert.equal(await isRateLimited("h", async () => RATE_LIMIT_MAX), true);
});

test("cuenta solo la última ventana, para ese ipHash", async () => {
  const now = new Date("2026-10-23T15:00:00Z");
  let asked: { ipHash: string; since: Date } | null = null;
  await isRateLimited(
    "abc",
    async (ipHash, since) => {
      asked = { ipHash, since };
      return 0;
    },
    now,
  );
  assert.deepEqual(asked, { ipHash: "abc", since: new Date(now.getTime() - RATE_LIMIT_WINDOW_MS) });
});
