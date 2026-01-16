// src/pages/api/metrics.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // 1. Configuración Cliente Supabase (Usando tus env existentes)
        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Inserción de la métrica RUM
        const { error } = await supabase
            .from('rum_metrics')
            .insert({
                name: body.name,
                value: body.value,
                metric_id: body.id,
                url: body.url,
                user_agent: userAgent
            });

        if (error) throw error;

        return new Response(JSON.stringify({ status: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error(`[OBSERVABILITY] ❌ Error guardando métrica RUM:`, e);
        return new Response(JSON.stringify({ status: 'error' }), { status: 500 });
    }
};
