// Verifica que la foto fija y el canvas vivo coincidan: para cada tamaño de pantalla congela el cambio
// foto -> animación y captura (transparente, mismo recorte) SOLO el canvas vivo y SOLO la foto, para que
// compare.py las compare píxel a píxel. Ver README.md de esta carpeta.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "out");
mkdirSync(out, { recursive: true });
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const log = (m) => console.log(new Date().toTimeString().slice(0, 8), m);
const configs = [
  { name: "1366x650@1", w: 1366, h: 650, dsf: 1 },
  { name: "1920x1080@1", w: 1920, h: 1080, dsf: 1 },
  { name: "390x844@1", w: 390, h: 844, dsf: 1 },
  { name: "1366x650@2", w: 1366, h: 650, dsf: 2 },
];

try {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  for (const c of configs) {
    log(`[${c.name}] inicio`);
    const page = await browser.newPage({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.dsf });
    await page.addInitScript(() => {
      const st = window.setTimeout;
      window.setTimeout = (fn, ms, ...a) => st(fn, ms === 500 ? 1e9 : ms, ...a);
    });
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".arm-gate-screen canvas", { timeout: 30000 });
    await page.waitForTimeout(2500);
    // recorte = el rect exacto de la foto (así se compara la misma región en los dos casos)
    const img = await page.evaluate(() => {
      const i = document.querySelector(".arm-gate-screen > div[aria-hidden] img").getBoundingClientRect();
      return [i.x, i.y, i.width, i.height];
    });
    const clip = { x: img[0], y: img[1], width: img[2], height: img[3] };
    log(`[${c.name}] foto en ${JSON.stringify(img)}`);
    const setCss = (css) =>
      page.evaluate((css) => {
        let s = document.getElementById("__t");
        if (!s) {
          s = document.createElement("style");
          s.id = "__t";
          document.head.appendChild(s);
        }
        s.textContent = css;
      }, css);
    const base = `html,body,body *{background:transparent !important;visibility:hidden !important;transition:none !important}`;
    await setCss(base + `.arm-gate-screen canvas{visibility:visible !important}.arm-gate-screen > div.pointer-events-auto{opacity:1 !important}`);
    await page.screenshot({ path: join(out, `live-${c.name}.png`), clip, omitBackground: true, timeout: 120000 });
    log(`[${c.name}] canvas vivo ok`);
    await setCss(base + `.arm-gate-screen > div[aria-hidden]{visibility:visible !important}.arm-gate-screen > div[aria-hidden] img{visibility:visible !important}`);
    await page.screenshot({ path: join(out, `still-${c.name}.png`), clip, omitBackground: true, timeout: 120000 });
    log(`[${c.name}] foto ok`);
    await page.close();
  }
  await browser.close();
  log("TODO LISTO — ahora: python3 compare.py");
} catch (e) {
  console.error("ERROR", e.message);
  process.exit(1);
}
