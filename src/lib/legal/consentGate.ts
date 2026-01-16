import type { ClientSEOBundle } from "../../types/ClientBundle";

/**
 * Validates that the Client Bundle meets all legal requirements for Consent Mode v2.
 * Throws an error if validation fails.
 */
export function assertConsentBundle(bundle: ClientSEOBundle) {
    const cm = bundle.legal?.consentModeV2;

    // Si no está habilitado, no hay nada que validar (aunque el script no debería inyectarse)
    if (!cm?.enabled) {
        // Check opcional: si includeCookieBanner es true, debería estar enabled consentModeV2
        if (bundle.legal?.includeCookieBanner) {
            console.warn(`[CONSENT WARN] ${bundle.ops.clientId} tiene banner activado pero Consent Mode desactivado.`);
        }
        return;
    }

    // Si está habilitado, verificamos CMP
    if (cm.cmp !== "axeptio") {
        // Por ahora solo soportamos Axeptio oficialmente en este gate
        // Si se añaden otros, actualizar esta lógica
        throw new Error(`[CONSENT BLOCK] ❌ Error en ${bundle.ops.clientId}: CMP '${cm.cmp}' no soportada o inválida. Estándar requerido: axeptio.`);
    }

    // Verificamos credenciales específicas de Axeptio
    if (!cm.axeptio?.projectId || !cm.axeptio?.cookiesVersion) {
        throw new Error(`[CONSENT BLOCK] ❌ Faltan IDs de Axeptio para el cliente ${bundle.ops.clientId}.`);
    }

    // Verificamos GTM
    if (!cm.gtm?.containerId) {
        throw new Error(`[CONSENT BLOCK] ❌ Falta GTM ID para el cliente ${bundle.ops.clientId}.`);
    }

    // Observabilidad: Confirmación de paso del gate
    console.log(`[OBSERVABILITY] ✅ Consent Gate superado para: ${bundle.ops.clientId}`);
}
