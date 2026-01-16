import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase (usando las mismas vars de entorno)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET({ request }: { request: Request }) {
    // 1. Obtenemos TODOS los slugs de golpe (es rápido)
    // Ajusta 'sites_factory' y 'business_slug' a tus nombres reales
    const { data: slugs, error } = await supabase
        .from('sites_factory')
        .select('business_slug, updated_at, seo_bundle')
        .limit(10000); // Límite de seguridad, ajusta según necesidad

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // 2. Base URL (Tu dominio de producción)
    // IMPORTANTE: Cambia esto por tu dominio real en producción
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || 'https://factoria-web.pages.dev';

    // 3. Generamos el XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${slugs.map((site) => {
        // Usamos la fecha de actualización real o la actual
        const lastMod = site.updated_at ? new Date(site.updated_at).toISOString() : new Date().toISOString();
        // Extraemos ciudad para la URL (si la guardas en seo_bundle)
        const ciudad = site.seo_bundle?.ubicacion?.ciudad || 'caceres'; // Fallback
        const loc = `${baseUrl}/${ciudad.toLowerCase()}/${site.business_slug}`;

        return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('')}
</urlset>`;

    // 4. Devolvemos el XML con el header correcto
    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            // Cacheamos 1 hora para no saturar la DB
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        },
    });
}
