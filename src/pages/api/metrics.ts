import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// Kind: origen del dato (carga, interacción o evento de negocio)
const ALLOWED_KIND = new Set(["load", "interaction", "event"]);

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const kind = (body?.kind ?? body?.type ?? "").toString().trim().toLowerCase();
        const safeKind = ALLOWED_KIND.has(kind) ? kind : "load";

        const name = (body?.name ?? "").toString().trim();
        const value = Number(body?.value ?? 0);
        const slug = (body?.slug ?? "").toString().trim();
        const url = (body?.url ?? "").toString().trim();
        const userAgent = (body?.user_agent ?? "").toString().trim();

        if (!name || !slug || !Number.isFinite(value)) {
            return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), { status: 400 });
        }

        // metric_id: incluye el desglose (load vs interaction) + slug + métrica
        // Esto permite filtrar en Supabase sin añadir columnas.
        const metricId =
            (body?.metric_id ?? "").toString().trim() ||
            `vitals:${safeKind}:${slug}:${name}:${crypto.randomUUID()}`;

        const { error } = await supabase.from("rum_metrics").insert({
            name,
            value,
            metric_id: metricId,
            url,
            user_agent: userAgent,
        });

        if (error) {
            console.error(`[METRICS] DB Error (${slug}):`, error);
            return new Response(JSON.stringify({ ok: false, error: "db_insert_failed" }), { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        console.error("[METRICS] Request Error:", e);
        return new Response(JSON.stringify({ ok: false, error: "bad_request" }), { status: 400 });
    }
};
