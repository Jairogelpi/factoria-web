import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

test("Schema: JSON-LD Graph presente y parseable", async ({ page }) => {
    await page.goto(BASE_URL);

    // Localizar todos los bloques JSON-LD
    const jsonldBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();

    // Debe haber al menos un bloque (el de SEO.astro)
    expect(jsonldBlocks.length).toBeGreaterThan(0);

    // Validar que cada bloque sea un JSON válido
    for (const block of jsonldBlocks) {
        expect(() => JSON.parse(block)).not.toThrow();

        const data = JSON.parse(block);
        // Verificamos que sea nuestro Grafo de Autoridad
        if (data['@graph']) {
            expect(Array.isArray(data['@graph'])).toBe(true);
            expect(data['@graph'].length).toBeGreaterThan(0);
        }
    }
});
