import type { ClientSEOBundle } from "../../types/ClientBundle";
import { supabase } from "./supabase";
import { validateBundleStrict } from "../seo/validation";

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
        const { data, error } = await supabase
            .from("sites_factory")
            .select("seo_bundle, bundle_hash")
            .eq("business_slug", slug)
            .single();

        if (error || !data) throw new Error(`Bundle no encontrado: ${slug}`);

        const bundle = data.seo_bundle as ClientSEOBundle;
        const env = import.meta.env.PROD ? "prod" : "staging";

        // --- EL BUILD GATE: EL FILTRO DE CALIDAD ---
        validateBundleStrict(bundle, env);

        // Validación de Integridad "SEO Divino" (Legacy check, kept for safety, but strict validation covers most)
        if (!bundle.locations?.[0]?.address?.locality) {
            throw new Error("Bundle corrupto: faltan datos críticos de ubicación.");
        }

        return { bundle, bundle_hash: data.bundle_hash };
    });
}
