import type { ClientSEOBundle } from "../../types/ClientBundle";
import { supabase } from "./supabase";
import { validateBundleStrict, validateA11yHierarchy } from "../seo/validation";

export async function executeSafe<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        console.log(`[OBS] ${operation}: OK (${Date.now() - start}ms)`);
        return result;
    } catch (error) {
        console.error(`[OBS-CRITICAL] ${operation}: FAILED`, error);
        throw error; // El SSR debe fallar si los datos son corruptos
    }
}

export async function getClientBundle(slug: string): Promise<{ bundle: ClientSEOBundle; bundle_hash: string }> {
    return executeSafe(`FETCH_AND_VALIDATE_${slug}`, async () => {
        // 1. Fetch explícito de la columna 'seo_bundle' typada
        const { data, error } = await supabase
            .from("sites_factory")
            .select("seo_bundle, bundle_hash")
            .eq("business_slug", slug)
            .single();

        if (error || !data) throw new Error(`Bundle no encontrado para el slug: ${slug}`);

        // 2. Casting estricto con la interfaz ClientSEOBundle
        const bundle = data.seo_bundle as ClientSEOBundle;

        // 3. Validación de Fuente Única de Verdad (Single Source of Truth)
        // Usamos ops.clientId como la identidad real. Si difiere del slug de la URL, 
        // podría indicar un desajuste, pero respetamos la integridad del bundle.
        if (bundle.ops.clientId !== slug) {
            console.warn(`[OBS-INTEGRITY] ⚠️ Desalineación detectada: URL slug (${slug}) vs Bundle clientId (${bundle.ops.clientId}). Se prioriza el contenido del Bundle.`);
        }

        const env = import.meta.env.PROD ? "prod" : "staging";

        // --- EL BUILD GATE: EL FILTRO DE CALIDAD ---
        // Validamos que la estructura cumpla el contrato
        validateBundleStrict(bundle, env);
        validateA11yHierarchy(bundle); // Nueva Puerta de Accesibilidad

        // Validación de Integridad "SEO Divino" (Legacy check, kept for safety, but strict validation covers most)
        if (!bundle.locations?.[0]?.address?.locality) {
            throw new Error("Bundle corrupto: faltan datos críticos de ubicación.");
        }

        // Validación de activos críticos
        if (bundle.media?.hero?.url && !bundle.media?.hero?.alt) {
            console.warn(`[OBS-PERFORMANCE] ⚠️ Advertencia en ${slug}: Hero sin Alt-Text. Riesgo de Accesibilidad.`);
        }

        // Log de observabilidad para el peso de la página
        const galleryCount = bundle.media?.gallery?.length || 0;
        console.log(`[OBS-METRICS] 🖼️ Assets detectados para ${bundle.ops.clientId}: ${galleryCount + 1} imágenes preparadas para AVIF/Edge.`);

        return { bundle, bundle_hash: data.bundle_hash };
    });
}
