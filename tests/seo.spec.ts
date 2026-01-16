import { test, expect } from "@playwright/test";

// Usamos la URL local de Astro durante el build o preview
const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

test("SEO: Validar etiquetas críticas (h1/title/canonical/robots)", async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. Validar H1 único (Esencial para SEO)
    expect(await page.locator("h1").count()).toBe(1);

    // 2. Validar Título (Factory de Títulos de SEO.astro)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);

    // 3. Validar Canonical absoluto (Evita contenido duplicado)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical?.startsWith('http')).toBe(true);

    // 4. Validar Robots (Indexación controlada)
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/index|noindex/);
});
