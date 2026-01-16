import { spawn } from "node:child_process";

// Helper para ejecutar comandos y esperar su terminación
function run(cmd, args, env = {}) {
    return new Promise((resolve, reject) => {
        // Usamos spawn para stream de logs en tiempo real
        const p = spawn(cmd, args, {
            stdio: "inherit",
            shell: process.platform === "win32",
            env: { ...process.env, ...env },
        });
        p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed with code ${code}`))));
    });
}

(async () => {
    console.log('[OBSERVABILITY] 🛡️ Iniciando Release Gate Enterprise 2026...');

    // --- GATE 1: BUILD & BUNDLE ---
    console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 1: Build & Bundle...`);
    try {
        await run("npm", ["run", "build"]);
        console.log(`[OBSERVABILITY] ✅ Gate 1 Build PASSED.`);
    } catch (e) {
        console.error(`[OBSERVABILITY] ❌ Gate 1 Fallido.`);
        process.exit(1);
    }

    // Levantamos servidor para los siguientes gates
    console.log("\n[OBSERVABILITY] 🌐 Levantando Preview Server para validación...");
    const preview = spawn("npm", ["run", "preview"], { stdio: "inherit", shell: true });

    // Wait for server to be ready
    await new Promise((r) => setTimeout(r, 3000));
    const TEST_ENV = { BASE_URL: "http://localhost:4321" };

    try {
        // --- GATE 2: SEO TÉCNICO ---
        console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 2: SEO Técnico...`);
        await run("npm", ["run", "test:seo"], TEST_ENV);
        console.log(`[OBSERVABILITY] ✅ Gate 2 SEO PASSED.`);

        // --- GATE 3: SCHEMA GRAPH ---
        console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 3: Schema Graph...`);
        await run("npm", ["run", "test:schema"], TEST_ENV);
        console.log(`[OBSERVABILITY] ✅ Gate 3 Schema PASSED.`);

        // --- GATE 4: CONSENTIMIENTO UE ---
        console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 4: Consentimiento UE...`);
        await run("npm", ["run", "test:consent"], TEST_ENV);
        console.log(`[OBSERVABILITY] ✅ Gate 4 Consent PASSED.`);

        // --- GATE 5: ACCESIBILIDAD (UE) ---
        console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 5: Accesibilidad (UE)...`);
        await run("npm", ["run", "test:a11y"], TEST_ENV);
        console.log(`[OBSERVABILITY] ✅ Gate 5 A11y PASSED.`);

        // --- GATE 6: LIGHTHOUSE (PERF) ---
        console.log(`\n[OBSERVABILITY] 🔄 Ejecutando Gate 6: Lighthouse (Perf)...`);
        await run("npm", ["run", "test:perf"], TEST_ENV);
        console.log(`[OBSERVABILITY] ✅ Gate 6 Perf PASSED.`);

        console.log('\n[OBSERVABILITY] 🚀 REVESTIMIENTO COMPLETADO. El sitio es perfecto para producción.');

    } catch (e) {
        console.error(`\n[OBSERVABILITY] ❌ FALLO EN GATES. Despliegue cancelado.`);
        console.error(e.message);
        process.exit(1);
    } finally {
        // Cleanup server
        if (process.platform === "win32") {
            spawn("taskkill", ["/pid", preview.pid, "/f", "/t"]);
        } else {
            preview.kill("SIGTERM");
        }
    }
})();
