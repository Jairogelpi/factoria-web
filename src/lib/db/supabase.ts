import { createClient } from "@supabase/supabase-js";

// IMPORTANTE: Usa variables sin el prefijo PUBLIC_ para mayor seguridad en el servidor
const url = import.meta.env.SUPABASE_URL;
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    // En desarrollo local a veces queremos que falle ruidoso si falta config
    // pero en build time (SSG) esto podría romper si no están seteadas.
    // Como es SSR, está bien que falle si no hay credenciales.
    throw new Error("Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
}

export const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
});
