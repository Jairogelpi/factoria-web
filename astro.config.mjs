import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    site: import.meta.env.PUBLIC_BASE_URL || "https://example.com",
    integrations: [sitemap()],


});
