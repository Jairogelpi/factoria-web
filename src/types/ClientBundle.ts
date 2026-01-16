export type Environment = "prod" | "staging";

export type BundleStatus = "draft" | "ready" | "published";

// ISO 8601 HH:MM
export type TimeHHMM = `${number}${number}:${number}${number}`;

// Días Schema.org (en inglés)
export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export interface ClientSEOBundle {
    // Operación / observabilidad (no se expone al público si no quieres)
    ops: {
        clientId: string; // interno (cozy-caceres)
        environment: Environment;
        rum: { enabled: boolean; sampleRate: number };
        alertingTargets?: string[]; // webhooks, emails, etc.
    };

    // Identidad de marca (Organization)
    brand: {
        name: string;
        legalName?: string;
        url: string; // raíz del sitio (https://dominio.tld)
        logo: string; // URL o path público
        sameAs?: string[]; // redes sociales corporativas
    };

    // Sedes (LocalBusiness). Una web puede ser single-location o multi-location.
    locations: Array<{
        id: string; // "centro", "norte"...
        name: string; // "COZY Cáceres Centro"
        schemaType: string; // "HairSalon", "Restaurant", "LocalBusiness", etc.
        telephone: string;
        email?: string;
        priceRange?: string; // "€€", "$$", etc.
        image: string; // foto principal (fachada/interior)

        address: {
            street: string;
            locality: string; // ciudad
            region: string;
            postalCode: string;
            countryCode: string; // "ES"
        };

        geo: { lat: number; lng: number };

        openingHours: Array<{
            days: DayOfWeek[];
            open: TimeHHMM;
            close: TimeHHMM;
        }>;

        // Identificadores reales de Google (consistencia local)
        gbp?: {
            placeId: string; // "ChIJ..."
            mapsUrl: string; // https://maps.app.goo.gl/...
            cid?: string;
        };
    }>;

    // Configuración SEO técnica
    seo: {
        siteName: string;
        locale: string; // "es-ES"
        canonicalBase: string; // debe ser https://dominio.tld
        defaultTitlePattern: string; // "{page} | {brand} {city}"
        defaultDescription: string;
        robots: "index, follow" | "noindex, nofollow";
    };

    // Contenido para páginas
    content: {
        home: { headline: string; subheadline: string };

        cta_primary: {
            url: string;
            text: string;
        };
        microcopy: string;

        services: Array<{
            slug: string;
            name: string;
            summary: string;
            description: string; // build gate de thin content
        }>;

        faq?: Array<{ q: string; a: string }>;
        semantic_entities?: string[];
        semantic_hierarchy?: { category_name: string; category_url: string };
    };

    // JSON-LD (Schema.org) pre-generado
    jsonLd?: Record<string, any> | Array<Record<string, any>>;

    // Multimedia (OpenGraph, galería, etc.)
    media: {
        hero: string;
        ogImage?: string; // si no, usar hero
        gallery?: Array<{ src: string; alt: string; width?: number; height?: number }>;
    };

    // Performance policies
    performance: {
        thirdPartyWhitelist: string[]; // lista blanca interna (por id)
    };

    // Legal (según país)
    legal?: {
        countryCode: string; // "ES"
        includeCookieBanner?: boolean;
    };
}
