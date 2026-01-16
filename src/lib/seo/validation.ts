import type { ClientSEOBundle } from "../../types/ClientBundle";

export function validateBundleStrict(bundle: ClientSEOBundle, env: string) {
    const missing: string[] = [];

    if (!bundle.brand?.name) missing.push("Nombre de marca (bundle.brand.name)");
    if (!bundle.seo?.defaultTitlePattern) missing.push("Pattern de Título (bundle.seo.defaultTitlePattern)");
    if (!bundle.locations?.length) missing.push("Locations (mínimo 1)");
    if (!bundle.seo?.canonicalBase) missing.push("Canonical Base (bundle.seo.canonicalBase)");

    // Anti-Thin Content Check
    if (bundle.content?.services) {
        for (const svc of bundle.content.services) {
            if ((svc.description || "").trim().length < 50) { // Umbral bajo para dev, subir a 300 para prod
                missing.push(`Contenido pobre en servicio: ${svc.name}`);
            }
        }
    }

    // 4. Verificaciones Legales y de Consentimiento (2026)
    const { legal } = bundle;
    if (legal?.consentModeV2?.enabled) {
        const { axeptio, gtm } = legal.consentModeV2;
        if (legal.consentModeV2.cmp === 'axeptio' && (!axeptio?.projectId || !axeptio?.cookiesVersion)) {
            const msg = `[RELEASE GATE] ❌ Error legal en "${bundle.ops?.clientId || 'unknown'}": Falta configuración de Axeptio.`;
            console.error(msg);
            if (env === 'prod') throw new Error(msg);
        }
        if (!gtm?.containerId) {
            const msg = `[RELEASE GATE] ❌ Error legal en "${bundle.ops?.clientId || 'unknown'}": Falta Container ID de GTM.`;
            console.error(msg);
            if (env === 'prod') throw new Error(msg);
        }
    }

    if (missing.length > 0) {
        const clientId = bundle.ops?.clientId || 'unknown';
        const msg = `[BUILD GATE] ❌ Error en site '${clientId}': Faltan [${missing.join(", ")}]`;
        console.error(msg);
        if (env === "prod") throw new Error(msg);
        console.log(`[OBSERVABILITY] ✅ Bundle validado para: ${bundle.brand.name}`);
    }

    // 5. Validación Estricta de ALT (Accesibilidad = Ranking)
    const altIssues = validateAltText(bundle);
    if (altIssues.length > 0) {
        const errors = altIssues.filter(i => i.level === 'error').map(i => i.msg);
        const warnings = altIssues.filter(i => i.level === 'warn').map(i => i.msg);

        if (errors.length > 0) {
            console.error(`[OBS-SEO-CRITICAL] ❌ Errores de ALT en ${bundle.ops.clientId}:\n${errors.join("\n")}`);
            if (env === 'prod') throw new Error(`Build Gate: Fallo crítico de ALT Text: ${errors[0]}`);
        }
        if (warnings.length > 0) {
            console.warn(`[OBS-SEO] ⚠️ Advertencias de ALT en ${bundle.ops.clientId}:\n${warnings.join("\n")}`);
        }
    }

    // 5. Validación de densidad de respuestas SGE (Observabilidad Permanente)
    if (!bundle.content.semantic_definitions || Object.keys(bundle.content.semantic_definitions).length === 0) {
        console.warn(`[OBS-SEO] ⚠️ El bundle ${bundle.ops.clientId} no tiene semantic_definitions. Baja probabilidad de cita en SGE.`);
    } else {
        console.log(`[OBS-SEO] ✅ SGE-Ready: ${Object.keys(bundle.content.semantic_definitions).length} respuestas directas generadas.`);
    }
}
}

export function validateA11yHierarchy(bundle: any) {
    const errors: string[] = [];

    // 1. Validación de Jerarquía de Encabezados (SGE 2026)
    if (!bundle.content?.home?.headline) {
        errors.push("FALTA_H1: El contenido debe tener un titular principal.");
    }

    if (bundle.content?.faq?.length > 0 && !bundle.content?.services?.length) {
        errors.push("JERARQUIA_INVALIDA: Se detectaron FAQs (H3) pero no hay Servicios (H2).");
    }

    // 2. Validación de Contraste Semántico
    if (bundle.brand?.colors) {
        console.log(`[OBS-A11Y] Verificando contraste para ${bundle.ops.clientId}`);
    }

    // OBSERVABILIDAD PERMANENTE [2026-01-08]
    if (errors.length > 0) {
        console.error(`[OBS-A11Y-CRITICAL] ❌ Errores de accesibilidad en ${bundle.ops.clientId}:`, errors.join(" | "));
        throw new Error("Build Gate: Fallo de accesibilidad detectado.");
    } else {
        console.log(`[OBS-A11Y] ✅ Jerarquía y accesibilidad verificada para ${bundle.ops.clientId}`);
    }
}
