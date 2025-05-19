import { FC } from 'react';
import { Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import Button from '@/components/atoms/Button';
import Link from 'next/link';

namespace Footer {
  export interface Props extends Content.FooterDocumentData {}
}

const Footer: FC<Footer.Props> = ({
  title,
  tagline,
  sections,
  copyright,
  privacy_policy,
}) => {
  const currentYear = new Date().getFullYear();
  const foundingYear = 2022;
  return (
    <footer>
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-6 py-4 pl-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2 lg:justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tighter"
            >
              <span aria-hidden="true">★</span>
              <span className="underline">{title}</span>
            </Link>
          </div>
          <p className="mt-4 font-bold">{tagline}</p>
        </div>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="mb-4 font-bold">{section.title}</h3>
            <ul className="space-y-4 text-muted-foreground">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Button asChild size="sm" variant="link" className="px-0">
                    <PrismicNextLink field={link}>{link.text}</PrismicNextLink>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-4 mb-4 flex flex-col justify-between gap-4 border-t text-sm font-medium text-muted-foreground md:flex-row md:items-center">
        <p className="pl-4">
          ★ {foundingYear}-{currentYear} {copyright}
        </p>
        <ul className="flex gap-4 px-4">
          <li className="hover:text-primary">
            <Button asChild size="sm" variant="link" className="px-0">
              <PrismicNextLink field={privacy_policy}>
                {privacy_policy.text}
              </PrismicNextLink>
            </Button>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export { Footer };
