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

    if (missing.length > 0) {
        const clientId = bundle.ops?.clientId || 'unknown';
        const msg = `[BUILD GATE] ❌ Error en site '${clientId}': Faltan [${missing.join(", ")}]`;
        console.error(msg);
        if (env === "prod") throw new Error(msg);
    } else {
        console.log(`[OBSERVABILITY] ✅ Bundle validado para: ${bundle.brand.name}`);
    }
}
