import { chromium } from "playwright";
import fs from "fs";

export async function publishToTikTok(videoPath, description) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });

  // Carica cookie
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();

  // Attendi che TikTok riconosca la sessione
  await page.waitForTimeout(5000);

  // Vai alla pagina upload
  await page.goto("https://www.tiktok.com/upload?lang=en", {
    waitUntil: "networkidle",
    timeout: 180000
  });

  // Attendi che la pagina abbia finito di caricare script e XHR
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);

  // Aspetta che l'input file esista nel DOM (anche se nascosto)
  await page.waitForFunction(() => {
    return document.querySelector("input[type='file']") !== null;
  }, { timeout: 180000 });

  // Prendi l'input file
  const input = await page.$("input[type='file']");

  // Carica il video
  await input.setInputFiles(videoPath);

  // Attendi che appaia la caption
  await page.waitForSelector("[data-e2e='caption']", { timeout: 180000 });

  // Inserisci descrizione
  await page.fill("[data-e2e='caption']", description);

  // Pubblica
  await page.click("[data-e2e='post-button']");

  // Attendi conferma
  await page.waitForSelector("[data-e2e='post-success']", {
    timeout: 180000
  });

  await browser.close();

  return "published";
}
