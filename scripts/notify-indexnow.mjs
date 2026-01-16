import { createClient } from '@supabase/supabase-js';
// Node 20 has native fetch, removing node-fetch dependency requirement
// import fetch from 'node-fetch'; 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    console.log("[OBSERVABILITY] 🤖 Iniciando proceso de indexación masiva...");

    // 1. Obtenemos todos los sitios activos para notificar sus cambios
    const { data: sites, error } = await supabase
        .from('sites_factory')
        .select('seo_bundle');

    if (error || !sites) {
        console.error("[OBSERVABILITY] ❌ Error al obtener sitios de Supabase:", error);
        process.exit(1);
        return;
    }

    for (const site of sites) {
        const bundle = site.seo_bundle;
        const { seo, ops, locations } = bundle;

        // Si la empresa no tiene key, la saltamos (evita errores)
        if (!ops?.indexNowKey) continue;

        const host = new URL(seo.canonicalBase).hostname;

        const payload = {
            host: host,
            key: ops.indexNowKey,
            keyLocation: `${seo.canonicalBase}/${ops.indexNowKey}.txt`,
            urlList: [
                seo.canonicalBase,
                // Construcción segura de la URL de ciudad
                locations?.[0]?.address?.locality
                    ? `${seo.canonicalBase}/${locations[0].address.locality.toLowerCase()}/${ops.clientId}`
                    : null
            ].filter(Boolean)
        };

        try {
            const response = await fetch('https://api.indexnow.org/IndexNow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`[OBSERVABILITY] ✅ Indexación exitosa: ${host} (Cliente: ${ops.clientId})`);
            } else {
                console.warn(`[OBSERVABILITY] ⚠️ Fallo parcial en ${host}: ${response.statusText}`);
            }
        } catch (e) {
            console.error(`[OBSERVABILITY] ❌ Error de red para ${host}:`, e.message);
        }
    }
}

run();
