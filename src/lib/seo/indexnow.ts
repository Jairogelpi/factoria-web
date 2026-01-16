export async function notifyIndexNow(urlList: string[]) {
    const host = new URL(import.meta.env.PUBLIC_BASE_URL || "https://factoria-web.pages.dev").hostname;
    const key = import.meta.env.INDEXNOW_KEY; // Tu clave de API de IndexNow

    if (!key) {
        console.warn("[OBSERVABILITY] ⚠️ IndexNow Key missing. Skipping notification.");
        return;
    }

    const payload = {
        host: host,
        key: key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: urlList
    };

    try {
        const response = await fetch('https://api.indexnow.org/IndexNow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[OBSERVABILITY] 🚀 IndexNow: ${urlList.length} URLs notificadas con éxito.`);
        } else {
            console.error(`[OBSERVABILITY] ❌ IndexNow Failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error(`[OBSERVABILITY] ❌ Error en IndexNow:`, error);
    }
}
