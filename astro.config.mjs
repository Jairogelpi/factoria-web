import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    site: import.meta.env.PUBLIC_BASE_URL || "https://example.com",
    integrations: [sitemap()],

    // OPTIMIZACIONES 2026:
    compressHTML: true, // Reduce el tamaño del HTML al máximo
    prefetch: {
        prefetchAll: true, // Carga las páginas siguientes en segundo plano
        defaultStrategy: 'hover'
    },

    // Configuración de imagen (High Performance 2026)
    image: {
        domains: ['jxcwgneqbkyqrgyezbni.supabase.co'],
        format: ['avif', 'webp'],
        service: {
            entrypoint: 'astro/assets/services/sharp'
        }
    }
});
