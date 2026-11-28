import { jsonLdString } from '@/lib/seo';

/**
 * Structured data for search engines (schema.org JSON-LD). Rendered by
 * containers only; it shows nothing on the page. See technical/seo.md.
 */
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
        />
    );
}
