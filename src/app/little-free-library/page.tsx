import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { asImageSrc } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';

export default async function Page() {
  const client = createClient();
  const page = await client
    .getSingle('little_free_library')
    .catch(() => notFound());

  return (
    <>
      <SliceZone slices={page.data.slices} components={components} />
      <iframe
        src="https://app.littlefreelibrary.org/ourmap"
        allowFullScreen
        width="100%"
        height="600"
        style={{ border: 'none' }}
        title="Little Free Library Map"
      ></iframe>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client
    .getSingle('little_free_library')
    .catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? '' }],
    },
  };
}
