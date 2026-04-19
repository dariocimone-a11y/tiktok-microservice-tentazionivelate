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
    timeout: 120000
  });

  // Upload del video
  const input = await page.waitForSelector("input[type='file']");
  await input.setInputFiles(videoPath);

  // Attendi caricamento
  await page.waitForSelector("[data-e2e='caption']", { timeout: 120000 });

  // Inserisci descrizione
  await page.fill("[data-e2e='caption']", description);

  // Pubblica
  await page.click("[data-e2e='post-button']");

  // Attendi conferma
  await page.waitForSelector("[data-e2e='post-success']", {
    timeout: 120000
  });

  await browser.close();

  return "published";
}
