import { chromium } from "playwright";
import fs from "fs";

export async function publishToTikTok(videoPath, description) {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();

  // Carica cookie TikTok
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();

  // Piccola pausa per permettere ai cookie di attivarsi
  await page.waitForTimeout(5000);

  // Carica la pagina upload (TikTok è lento → 90 secondi)
  await page.goto("https://www.tiktok.com/upload?lang=en", {
    waitUntil: "networkidle",
    timeout: 90000
  });

  // Upload video
  const input = await page.waitForSelector("input[type='file']");
  await input.setInputFiles(videoPath);

  // Aspetta caricamento
  await page.waitForSelector("[data-e2e='caption']", { timeout: 120000 });

  // Inserisci descrizione
  await page.fill("[data-e2e='caption']", description);

  // Pubblica
  await page.click("[data-e2e='post-button']");

  // Attendi conferma
  await page.waitForSelector("[data-e2e='post-success']", { timeout: 120000 });

  await browser.close();

  return "published";
}
