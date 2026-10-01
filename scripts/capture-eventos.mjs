import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 3892;
const URL = `http://127.0.0.1:${PORT}/eventos`;
const OUTPUT_DIR = path.resolve(process.cwd(), "public/eventos/capturas");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) return true;
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout waiting for server at ${url}`);
}

async function main() {
  console.log("Iniciando servidor Next.js para captura...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT) },
  });

  try {
    await waitForServer(URL);
    console.log("Servidor listo. Lanzando navegador Chromium...");

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // 1. Captura completa Desktop (1440x900)
    console.log("Capturando página completa desktop (1440px)...");
    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await desktopPage.goto(URL, { waitUntil: "networkidle" });
    await desktopPage.evaluate(() => document.fonts.ready);
    await desktopPage.waitForTimeout(600);

    const fullPath = path.join(OUTPUT_DIR, "eventos-completa-claro.png");
    await desktopPage.screenshot({ path: fullPath, fullPage: true });
    console.log(`Guardada: ${fullPath}`);

    // Primer viewport Desktop
    const viewportPath = path.join(OUTPUT_DIR, "eventos-primer-viewport.png");
    await desktopPage.screenshot({ path: viewportPath, fullPage: false });
    console.log(`Guardada: ${viewportPath}`);

    // Captura de Octubre con Segundo AIR Talk multi-día (Semana del 12 al 16)
    console.log("Capturando vista de Octubre con multi-día...");
    const octMultidiaPath = path.join(OUTPUT_DIR, "eventos-multidia-octubre.png");
    await desktopPage.screenshot({ path: octMultidiaPath, fullPage: false });
    console.log(`Guardada: ${octMultidiaPath}`);

    // Navegar a Noviembre para ver Challenge JAR 2026 (3 al 6 de Noviembre)
    console.log("Navegando a Noviembre para verificar Challenge JAR 2026 multi-día...");
    await desktopPage.click('button[aria-label="Mes siguiente"]');
    await desktopPage.waitForTimeout(500);

    // Hover sobre el bloque de Challenge JAR 2026 para activar la expansión y popover
    const jarBlock = desktopPage.locator('button:has-text("Challenge JAR 2026")').first();
    if (await jarBlock.count() > 0) {
      await jarBlock.hover();
      await desktopPage.waitForTimeout(400);
      const hoverPath = path.join(OUTPUT_DIR, "eventos-hover-multidia-jar.png");
      await desktopPage.screenshot({ path: hoverPath, fullPage: false });
      console.log(`Guardada con hover multi-día: ${hoverPath}`);
    }

    // Captura de Vista Agenda (Timeline List) con tickets multi-día
    console.log("Capturando vista agenda cronológica...");
    await desktopPage.click('button[aria-label="Ver agenda cronológica"]');
    await desktopPage.waitForTimeout(500);
    const agendaPath = path.join(OUTPUT_DIR, "eventos-agenda-timeline.png");
    await desktopPage.screenshot({ path: agendaPath, fullPage: false });
    console.log(`Guardada: ${agendaPath}`);

    // Volver a modo grilla
    await desktopPage.click('button[aria-label="Ver calendario mensual"]');
    await desktopPage.waitForTimeout(300);

    // 2. Modo Oscuro
    console.log("Capturando modo oscuro...");
    await desktopPage.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await desktopPage.waitForTimeout(400);

    const darkFullPath = path.join(OUTPUT_DIR, "eventos-completa-oscuro.png");
    await desktopPage.screenshot({ path: darkFullPath, fullPage: true });
    console.log(`Guardada: ${darkFullPath}`);

    // Captura del Modal de Detalle para un Talk (primer-encuentro-air-club con Tadeo y slides)
    console.log("Capturando modal de Talk (Tadeo Casiraghi)...");
    await desktopPage.setViewportSize({ width: 1440, height: 1200 });
    await desktopPage.goto(`${URL}?evento=primer-encuentro-air-club`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(600);
    const talkModalPath = path.join(OUTPUT_DIR, "eventos-modal-talk.png");
    await desktopPage.screenshot({ path: talkModalPath, fullPage: false });
    console.log(`Guardada: ${talkModalPath}`);

    // Captura del Modal de Detalle para Competencia (Challenge JAR 2026)
    console.log("Capturando modal de Competencia (Challenge JAR 2026)...");
    await desktopPage.goto(`${URL}?evento=jar-2026`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(600);
    const jarModalPath = path.join(OUTPUT_DIR, "eventos-modal-jar.png");
    await desktopPage.screenshot({ path: jarModalPath, fullPage: false });
    console.log(`Guardada: ${jarModalPath}`);

    // 3. Captura Mobile (390x844)
    console.log("Capturando mobile (390px)...");
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    await mobilePage.goto(URL, { waitUntil: "networkidle" });
    await mobilePage.evaluate(() => document.fonts.ready);
    await mobilePage.waitForTimeout(600);

    const mobilePath = path.join(OUTPUT_DIR, "eventos-mobile.png");
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    console.log(`Guardada: ${mobilePath}`);

    await browser.close();
    console.log("¡Todas las capturas se generaron con éxito!");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Error en capturas:", err);
  process.exit(1);
});
