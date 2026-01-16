import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ params }) => {
    const { key } = params;

    if (!key) {
        return new Response('Key missing', { status: 400 });
    }

    // Verificamos en Supabase si esta 'key' pertenece a algún cliente activo
    const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );

    // Buscamos en la columna JSONB 'seo_bundle' si existe algún ops.indexNowKey igual a la key solicitada
    // Nota: Esto asume que la estructura en DB coincide con el tipo.
    const { data, error } = await supabase
        .from('sites_factory')
        .select('business_slug')
        .eq('seo_bundle->ops->indexNowKey', key) // Sintaxis de flecha para JSON en Supabase/Postgres
        .single();

    if (error || !data) {
        return new Response('Not Found', { status: 404 });
    }

    // Si la llave existe y está asignada a un sitio, la devolvemos.
    return new Response(key, {
        headers: { "Content-Type": "text/plain" }
    });
}

// Habilitamos SSR para esta ruta si es necesario, aunque Astro híbrido o server lo maneja por defecto en dynamic routes.
export const prerender = false;
