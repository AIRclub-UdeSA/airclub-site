import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 3893;
const BASE_URL = `http://127.0.0.1:${PORT}`;
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
  console.log("Iniciando servidor Next.js en puerto " + PORT + "...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT) },
  });

  try {
    await waitForServer(`${BASE_URL}/talks`);
    console.log("Servidor listo. Lanzando navegador Chromium...");

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    // 1. /talks page overview
    console.log("Capturando /talks...");
    await page.goto(`${BASE_URL}/talks`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const talksPath = path.join(OUTPUT_DIR, "talks-overview.png");
    await page.screenshot({ path: talksPath, fullPage: false });
    console.log(`Guardada: ${talksPath}`);

    // 2. Click on Guillermo Marzik talk
    console.log("Abriendo modal Guillermo Marzik...");
    const marzikBtn = page.locator("button:has-text('Desbloqueando la planificación')").first();
    if (await marzikBtn.count() > 0) {
      await marzikBtn.click();
      await page.waitForTimeout(600);
      const marzikModalPath = path.join(OUTPUT_DIR, "talk-marzik-modal.png");
      await page.screenshot({ path: marzikModalPath, fullPage: false });
      console.log(`Guardada: ${marzikModalPath}`);

      // Scroll to speaker avatar section
      await page.locator(".talk-modal-panel div.overflow-y-auto").evaluate(el => el.scrollTop = 420);
      await page.waitForTimeout(300);
      const marzikAvatarPath = path.join(OUTPUT_DIR, "marzik-avatar-scrolled.png");
      await page.screenshot({ path: marzikAvatarPath, fullPage: false });
      console.log(`Guardada: ${marzikAvatarPath}`);

      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    // 3. Click on Gabriel Torre talk
    console.log("Abriendo modal Gabriel Torre...");
    const torreBtn = page.locator("button:has-text('¿Puede una red neuronal')").first();
    if (await torreBtn.count() > 0) {
      await torreBtn.click();
      await page.waitForTimeout(600);
      const torreModalPath = path.join(OUTPUT_DIR, "talk-torre-modal.png");
      await page.screenshot({ path: torreModalPath, fullPage: false });
      console.log(`Guardada: ${torreModalPath}`);

      // Scroll to speaker avatar section
      await page.locator(".talk-modal-panel div.overflow-y-auto").evaluate(el => el.scrollTop = 420);
      await page.waitForTimeout(300);
      const torreAvatarPath = path.join(OUTPUT_DIR, "torre-avatar-scrolled.png");
      await page.screenshot({ path: torreAvatarPath, fullPage: false });
      console.log(`Guardada: ${torreAvatarPath}`);

      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    // 4. Capturar /eventos para ver Octubre 2026
    console.log("Capturando /eventos en Octubre...");
    await page.goto(`${BASE_URL}/eventos`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const eventosOctPath = path.join(OUTPUT_DIR, "eventos-octubre-talks.png");
    await page.screenshot({ path: eventosOctPath, fullPage: false });
    console.log(`Guardada: ${eventosOctPath}`);

    // 5. Click on Charla 1 from /eventos
    console.log("Abriendo modal Charla 1 desde /eventos...");
    const evMarzik = page.locator("button:has-text('Desbloqueando la')").first();
    if (await evMarzik.count() > 0) {
      await evMarzik.click();
      await page.waitForTimeout(600);
      const evMarzikPath = path.join(OUTPUT_DIR, "eventos-marzik-modal.png");
      await page.screenshot({ path: evMarzikPath, fullPage: false });
      console.log(`Guardada: ${evMarzikPath}`);
    }

    await browser.close();
    console.log("¡Capturas de Bio & Bits finalizadas con éxito!");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Error en capturas:", err);
  process.exit(1);
});
