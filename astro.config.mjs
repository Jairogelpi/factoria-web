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

    // Configuración de imagen (si usas <Image /> de Astro)
    image: {
        service: {
            entrypoint: 'astro/assets/services/noop' // En Cloudflare suele ser mejor passthrough
        }
    }
});
