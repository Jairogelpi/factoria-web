# 🏭 Factoría Web

Proyecto de generación de directorios de negocios locales estáticos, optimizado para SEO y diseñado para ser alimentado automáticamente mediante **N8n**.

Construido con [Astro](https://astro.build) y desplegado en [Cloudflare Pages](https://pages.cloudflare.com/).

## 🚀 Visión General

Este proyecto sirve como frontend para un sistema de automatización que:
1.  Recopila datos de negocios (scraped o introducidos).
2.  Genera archivos JSON estructurados.
3.  Dispara un nuevo despliegue estático.

El resultado es un sitio web ultrarrápido, con rutas dinámicas para cada negocio/ciudad, y schemas JSON-LD automáticos para Google.

## 🛠️ Arquitectura

-   **Framework**: Astro 5 (Modo estático + Adapter Cloudflare).
-   **Contenido**: Archivos JSON en `src/content/businesses/`.
-   **Ruting**: Dinámico basado en archivos `[ciudad]/[slug].astro`.
-   **Estilos**: CSS nativo en `Layout.astro`.
-   **SEO**:
    -   Metadatos dinámicos por página.
    -   `sitemap-index.xml` automático.
    -   `robots.txt`.
    -   JSON-LD Schema.org para negocios locales.

### Estructura de Directorios

```text
/
├── public/                 # Archivos estáticos (robots.txt, favicon)
├── src/
│   ├── content/
│   │   └── businesses/     # 📂 AQUÍ van los JSON generados por N8n
│   ├── layouts/
│   │   └── Layout.astro    # Plantilla base con <head> SEO
│   └── pages/
│       ├── index.astro     # Portada
│       └── [ciudad]/
│           └── [slug].astro # Plantilla dinámica para cada negocio
├── astro.config.mjs        # Configuración (Cloudflare, Sitemap)
└── package.json
```

## 🤖 Integración con N8n

Este repositorio está diseñado para ser la "salida" de un workflow de N8n.

### Flujo de Datos
1.  **N8n** genera un objeto JSON con los datos del negocio.
2.  **N8n** (nodo Git) hace commit de ese archivo en `src/content/businesses/_{slug}.json`.
3.  **Git** push a la rama `main`.
4.  **Cloudflare Pages** detecta el cambio y reconstruye el sitio.

### Esquema JSON Esperado

Los archivos en `src/content/businesses/` deben seguir esta estructura:

```json
{
  "ciudad": "madrid",
  "slug": "nombre-negocio",
  "nombre_negocio": "Nombre del Negocio",
  "seo": {
    "meta_title": "Título SEO",
    "meta_description": "Descripción para Google",
    "canonical_path": "madrid/nombre-negocio",
    "og_image": "https://url-imagen.com/foto.jpg"
  },
  "content": {
    "descripcion_corta": "Texto principal del negocio...",
    "lista_servicios": "Corte, Peinado, Tinte",
    "faq": [
      { "q": "¿Pregunta?", "a": "Respuesta" }
    ]
  },
  "schema_jsonld": [] // Array de objetos Schema.org opcional
}
```

## 💻 Desarrollo Local

Si quieres editar la estructura o estilos manualmente:

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Visita `http://localhost:4321`.

3.  **Construir para producción** (prueba de build):
    ```bash
    npm run build
    ```
    Generará la carpeta `dist/` lista para Cloudflare.

## 📝 Comandos

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia servidor local |
| `npm run build` | Genera sitio estático en `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run astro check` | Verifica tipos y errores de código |

---
*Generado automáticamente por Antigravity*
