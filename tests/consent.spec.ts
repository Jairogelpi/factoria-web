import { test, expect } from '@playwright/test';

test('Consent Mode v2 implementation', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Default Denied State (via dataLayer)
    const dataLayer = await page.evaluate(() => window.dataLayer);
    const consentDefault = dataLayer.find((e) => e[0] === 'consent' && e[1] === 'default');

    // Nota: Si no hay bundle con consent enabled, este test fallará o debe ser condicional.
    // Asumimos que el entorno de test tiene un bundle con consent enabled o mockeado.
    // Si es condicional, podríamos verificar la ausencia de dataLayer si no hay consent.

    if (consentDefault) {
        expect(consentDefault[2]).toMatchObject({
            ad_storage: 'denied',
            analytics_storage: 'denied'
        });
    } else {
        // Si no hay comando de consent, verificar que NO se cargó el SDK de CMP
        const cmpScript = page.locator('script[src*="axept.io"]');
        await expect(cmpScript).toHaveCount(0);
    }
});
