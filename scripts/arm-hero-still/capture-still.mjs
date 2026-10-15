// Captura la foto fija del hero: la pantalla completa con SOLO el canvas vivo del brazo (fondo
// transparente), con el cambio foto -> animación congelado. make-still.py la recorta y genera
// src/components/home/arm-hero-still.ts. Ver README.md de esta carpeta.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "out");
mkdirSync(out, { recursive: true });
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const log = (m) => console.log(new Date().toTimeString().slice(0, 8), m);

try {
  log("inicio");
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 650 }, deviceScaleFactor: 2 });
  // Congela el cambio foto -> animación (HANDOFF_DELAY_MS = 500 en ArmHero.tsx) sin tocar el código
  await page.addInitScript(() => {
    const st = window.setTimeout;
    window.setTimeout = (fn, ms, ...a) => st(fn, ms === 500 ? 1e9 : ms, ...a);
  });
  await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".arm-gate-screen canvas", { timeout: 30000 });
  log("canvas presente");
  await page.waitForTimeout(2500);
  // Solo el canvas del brazo, sobre fondo transparente, y con la capa del canvas visible (opacity 0 mientras convive con la foto)
  await page.addStyleTag({
    content: `html,body,body *{background:transparent !important;visibility:hidden !important;transition:none !important}
      .arm-gate-screen canvas{visibility:visible !important}
      .arm-gate-screen > div.pointer-events-auto{opacity:1 !important}`,
  });
  const info = await page.evaluate(() => {
    const c = document.querySelector(".arm-canvas-container").getBoundingClientRect();
    // (cx, cy) = centro REAL del canvas vivo (ya redondeado a px enteros por ArmHero); h = alto del espaciador
    const [vcx, vcy, vh] = document.querySelector(".arm-gate-screen > div[data-arm-view]").dataset.armView.split(",").map(Number);
    return { cx: vcx, cy: vcy, w: c.width, h: c.height, viewH: vh, canvases: document.querySelectorAll(".arm-gate-screen canvas").length };
  });
  log("info " + JSON.stringify(info));
  // Captura de pantalla COMPLETA (sin clip): el recorte lo hace make-still.py en píxeles enteros del
  // dispositivo, porque el clip de Playwright se redondea solo y dejaba la foto ~0.5px descentrada.
  await page.screenshot({ path: join(out, "full-still.png"), omitBackground: true, timeout: 120000 });
  writeFileSync(join(out, "full-still.json"), JSON.stringify({ ...info, dsf: 2 }));
  log("captura completa guardada en scripts/arm-hero-still/out/");
  await browser.close();
  log("fin");
} catch (e) {
  console.error("ERROR", e.message);
  process.exit(1);
}
