import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

// Any address under a language that no route matches (/en/nope) lands here,
// so it gets the site's own 404 (../not-found.tsx), inside the header and
// footer and in the visitor's language, instead of the framework's.

export async function generateMetadata(): Promise<Metadata> {
    return { title: (await getTranslations('NotFound.general'))('metaTitle') };
}

export default function UnknownPage() {
    notFound();
}
