import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    // Nota: Idealmente usar SERVICE_ROLE_KEY solo en backend seguro si no hay RLS
    // Para este caso, aseguramos que la tabla rum_metrics tenga permisos de INSERT público o restringido adecuadamente.
);

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const name = (body?.name ?? "").toString();
        const value = Number(body?.value ?? 0);
        const slug = (body?.slug ?? "").toString();
        const url = (body?.url ?? "").toString();
        const userAgent = (body?.user_agent ?? "").toString();

        if (!name || !slug) {
            return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), { status: 400 });
        }

        // ID único aproximado para evitar duplicados masivos si se desea
        const metric_id = `cookie:${slug}:${name}:${Date.now()}`;

        const { error } = await supabase.from("rum_metrics").insert({
            name,
            value,
            metric_id,
            url,
            user_agent: userAgent,
        });

        if (error) {
            console.error("[METRICS] DB Insert Error:", error);
            return new Response(JSON.stringify({ ok: false, error: "db_insert_failed" }), { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        console.error("[METRICS] Request Error:", e);
        return new Response(JSON.stringify({ ok: false, error: "bad_request" }), { status: 400 });
    }
};
