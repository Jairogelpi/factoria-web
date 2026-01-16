import type { Graph, WebSite, Organization, LocalBusiness, BreadcrumbList, Thing, Service } from 'schema-dts';
import type { ClientSEOBundle } from '../../types/ClientBundle';

export function generateSchemaGraph(bundle: ClientSEOBundle, pathname: string): Graph {
    const permalink = bundle.brand.url + pathname; // Asegurar trailing slash si es necesario en origen
    const siteUrl = bundle.brand.url;
    const location = bundle.locations[0]; // Asumimos single location principal por ahora

    // 1. WebSite (La raíz de la identidad digital)
    const website: WebSite = {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: bundle.brand.name,
        publisher: {
            '@id': `${siteUrl}/#organization`
        }
    };

    // 2. Organization (La Marca)
    const organization: Organization = {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: bundle.brand.name,
        url: bundle.brand.url,
        logo: {
            '@type': 'ImageObject',
            url: bundle.brand.logo
        },
        sameAs: bundle.brand.sameAs
    };

    // 3. LocalBusiness (La Sede física)
    const localBusiness: LocalBusiness = {
        '@type': location.schemaType as any || 'LocalBusiness',
        '@id': `${permalink}#localbusiness`,
        url: permalink,
        name: location.name,
        image: location.image,
        telephone: location.telephone,
        email: location.email,
        priceRange: location.priceRange,
        address: {
            '@type': 'PostalAddress',
            streetAddress: location.address.street,
            addressLocality: location.address.locality,
            addressRegion: location.address.region,
            postalCode: location.address.postalCode,
            addressCountry: location.address.countryCode
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: location.geo.lat,
            longitude: location.geo.lng
        },
        openingHoursSpecification: location.openingHours.flatMap(oh =>
            oh.days.map(day => ({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: day,
                opens: oh.open,
                closes: oh.close
            }))
        ),
        parentOrganization: {
            '@id': `${siteUrl}/#organization`
        }
    };

    // 4. BreadcrumbList (Jerarquía)
    const breadcrumb: BreadcrumbList = {
        '@type': 'BreadcrumbList',
        '@id': `${permalink}#breadcrumb`,
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: siteUrl
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: location.address.locality,
                item: `${siteUrl}/${location.address.locality.toLowerCase()}`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: bundle.content.semantic_hierarchy?.category_name || 'Servicios',
                item: bundle.content.semantic_hierarchy?.category_url || `${siteUrl}/servicios`
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: location.name,
                item: permalink
            }
        ]
    };

    // Mentions (Semantic SEO)
    if (bundle.content.semantic_entities) {
        (localBusiness as any).mentions = bundle.content.semantic_entities.map(url => ({
            '@type': 'Thing',
            '@id': url as string,
            name: url.split('/').pop()?.replace(/_/g, ' ') || 'Entity'
        })) as Thing[];
    }

    // 5. Servicios (SGE Optimization)
    // Cada servicios se declara como entidad independiente vinculada
    const services: Service[] = (bundle.content.services || []).map(service => ({
        '@type': 'Service',
        name: service.name,
        description: bundle.content.semantic_definitions?.[service.slug] || service.summary, // SGE Priority
        provider: {
            '@id': `${siteUrl}/#localbusiness`
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${permalink}#${service.slug}`
        }
    }));

    // 6. Construcción del Grafo Unificado
    return {
        '@context': 'https://schema.org',
        '@graph': [
            website,
            organization,
            localBusiness,
            breadcrumb,
            ...services
        ]
    };
}
