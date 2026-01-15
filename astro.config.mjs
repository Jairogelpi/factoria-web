import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    output: "static",
    adapter: cloudflare(),
    site: import.meta.env.PUBLIC_BASE_URL, // o ponlo fijo si prefieres
    integrations: [sitemap()],
});
