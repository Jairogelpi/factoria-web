import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Accesibilidad: Cumplimiento de mínimos legales (UE)", async ({ page }) => {
    const targetUrl = "http://localhost:4321/";

    // Observabilidad: Inicio del escaneo
    console.log(`[OBSERVABILITY] 🔍 Iniciando auditoría A11y en: ${targetUrl}`);

    await page.goto(targetUrl);

    // Ejecución del motor axe-core
    const results = await new AxeBuilder({ page }).analyze();

    // Filtrado de violaciones según el estándar 2026 (Serious & Critical)
    const seriousViolations = results.violations.filter(v =>
        ["serious", "critical"].includes(v.impact ?? "")
    );

    // Observabilidad: Reporte de resultados
    if (seriousViolations.length > 0) {
        console.error(`[OBSERVABILITY] ❌ FALLO DE GATE: Se han encontrado ${seriousViolations.length} violaciones críticas de accesibilidad.`);
        seriousViolations.forEach(v => {
            console.error(`[OBSERVABILITY] 🚨 Detalle: ${v.id} - ${v.help} (Impacto: ${v.impact})`);
        });
    } else {
        console.log(`[OBSERVABILITY] ✅ ACCESIBILIDAD OK: La página cumple con los estándares legales de la UE.`);
    }

    // Bloqueo de despliegue: Si este expect falla, el CI/CD se detiene
    expect(seriousViolations, "Existen fallos de accesibilidad críticos que bloquean el despliegue").toEqual([]);
});
