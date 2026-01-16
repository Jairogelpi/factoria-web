import { chromium } from "playwright";

const urls = (process.env.URLS || "").split(",").filter(Boolean);
if (!urls.length) {
    console.warn("Define URLS=... environment variable to run synthetic checks. Example: URLS=https://example.com,https://example.com/page");
    process.exit(0); // Exit gracefully if not configured
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const url of urls) {
    console.log(`[OBSERVABILITY] 🤖 Verificando salud sintética: ${url}`);
    try {
        const r = await page.goto(url, { waitUntil: "domcontentloaded" });

        const status = r?.status() ?? 0;
        if (status >= 400) throw new Error(`[OBSERVABILITY] 🚨 HTTP ${status} en ${url}`);

        const h1 = await page.locator("h1").first().textContent();
        if (!h1 || h1.trim().length < 2) throw new Error(`[OBSERVABILITY] 🚨 Falta H1 en ${url}`);

        const hasJsonLd = await page.locator('script[type="application/ld+json"]').count();
        if (!hasJsonLd) throw new Error(`[OBSERVABILITY] 🚨 Falta JSON-LD (SEO) en ${url}`);

        console.log(`[OBSERVABILITY] ✅ ${url} está online y saludable.`);
    } catch (e) {
        console.error(e.message);
        process.exit(1); // Fail the job
    }
}

await browser.close();
console.log("✅ Synthetic Check Finalizado");
