import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: sites, error } = await supabase
    .from('sites_factory')
    .select('business_slug, seo_bundle, updated_at');

  if (error) {
    console.error("[SITEMAP] Error fetching sites:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const baseUrl = import.meta.env.PUBLIC_BASE_URL || "https://factoria-web.pages.dev";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${sites?.map(site => {
    // Extraemos la localidad del bundle para el cluster semántico
    const locality = site.seo_bundle?.locations?.[0]?.address?.locality?.toLowerCase() || 'localidad';
    const url = `${baseUrl}/${locality}/${site.business_slug}`;
    const image = site.seo_bundle?.media?.hero?.url || site.seo_bundle?.locations?.[0]?.image;

    return `
        <url>
          <loc>${url}</loc>
          <lastmod>${new Date(site.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          ${image ? `
          <image:image>
            <image:loc>${image}</image:loc>
          </image:image>` : ''}
        </url>
      `}).join('')}
    </urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
