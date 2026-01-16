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
    ops: {
        clientId: string;
        environment: "prod" | "staging";
        rum: { enabled: boolean; sampleRate: number };
        alertingTargets?: string[];
        indexNowKey?: string;
        // NUEVO: E-E-A-T (Author ID determinista)
        authorId?: string;
    };
    brand: {
        name: string;
        legalName?: string;
        url: string;
        logo: string;
        sameAs?: string[];
    };
    locations: Array<{
        id: string;
        name: string;
        schemaType: string;
        telephone: string;
        email?: string;
        priceRange?: string;
        image?: string;

        address: {
            street: string;
            locality: string; // ciudad
            region?: string;
            postalCode: string;
            countryCode: string;
        };

        geo?: { lat: number; lng: number };

        openingHours?: Array<{
            days: DayOfWeek[];
            open: TimeHHMM;
            close: TimeHHMM;
        }>;

        gbp?: { placeId: string; mapsUrl: string; cid?: string; };

        // SEO: AggregateReview support per location
        rating?: { value: number; count: number; };
    }>;

    // Configuración SEO técnica (Restaurado)
    seo: {
        siteName: string;
        locale: string;
        canonicalBase: string;
        defaultTitlePattern: string;
        defaultDescription: string;
        robots: "index, follow" | "noindex, nofollow";

        // OPCIONAL (E-E-A-T): Perfil de autor específico por cliente
        author?: {
            id: string;          // "jairo-gelpi" (kebab)
            name: string;        // nombre visible
            jobTitle?: string;   // "Consultor SEO / Data"
            url?: string;        // URL canónica del autor
            image?: string;      // avatar
            sameAs?: string[];   // linkedin, etc.
        };
    };

    content: {
        home: { headline: string; subheadline: string };

        cta_primary?: { url: string; text: string; };
        microcopy?: string;

        services: Array<{ slug: string; name: string; summary: string; description: string }>;
        // NUEVO CAMPO PARA SGE 2026: Diccionario de micro-respuestas semánticas
        semantic_definitions?: Record<string, string>;
        faq?: Array<{ q: string; a: string }>;
        internal_links?: Array<{
            fromServiceId: string;
            toServiceId: string;
            anchor: string;
            reason: string;
        }>;
        semantic_entities?: string[];
        semantic_hierarchy?: { category_name: string; category_url: string };
    };

    // JSON-LD (Schema.org) pre-generado (Restaurado)
    jsonLd?: Record<string, any> | Array<Record<string, any>>;

    media: {
        hero: { url: string; alt: string }; // Objeto para Alt-Text IA
        ogImage?: string;
        gallery: Array<{ src: string; alt: string; width?: number; height?: number }>;
    };

    social_proof?: {
        rating?: number;
        reviews_count?: number;
    };

    // Performance policies (Restaurado)
    performance: {
        thirdPartyWhitelist: string[];
    };

    // Legal (Restaurado & Ampliado)
    legal?: {
        countryCode: string;
        includeCookieBanner?: boolean;

        // Datos para Textos Legales Automáticos
        companyName: string;   // Razón Social
        vatId: string;        // CIF/NIF
        address: string;      // Dirección fiscal
        email: string;        // Email para ejercicio de derechos

        consentModeV2?: {
            enabled: boolean;
            cmp: "axeptio" | "cookiebot" | "didomi";
            axeptio?: {
                projectId: string;
                cookiesVersion: string;
            };
            gtm: {
                containerId: string;
            };
        };
    };
}
