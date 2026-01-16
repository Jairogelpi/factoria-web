import type { ClientSEOBundle } from "../../types/ClientBundle";

export function validateBundleStrict(bundle: ClientSEOBundle, env: "prod" | "staging") {
    const errors: string[] = [];

    // 1) Firewall de Canónicos
    if (!bundle.seo.canonicalBase.startsWith("https://")) {
        errors.push("CRITICAL: seo.canonicalBase debe ser absoluto (https).");
    }

    // 2) Seguridad de Entorno
    if (env === "staging" && bundle.seo.robots !== "noindex, nofollow") {
        errors.push("SECURITY: staging debe ser noindex para evitar canibalización.");
    }

    // 3) Anti-Thin Content (Calidad 2026)
    if (bundle.content.services) {
        for (const svc of bundle.content.services) {
            if ((svc.description || "").trim().length < 300) {
                errors.push(`QUALITY: El servicio '${svc.name}' tiene contenido pobre (<300 chars).`);
            }
        }
    }

    // 4) GBP Place ID (Autoridad Local)
    if (bundle.locations) {
        for (const loc of bundle.locations) {
            if (!loc.gbp?.placeId) {
                errors.push(`LOCAL SEO: Falta placeId en sede '${loc.name}'.`);
            }
        }
    }

    if (errors.length) {
        throw new Error(`[BUILD GATE FAILED]:\n- ${errors.join("\n- ")}`);
    }
}
