import { FC, useMemo } from 'react';
import { Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
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
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const foundingYear = 2022;
  return (
    <footer>
      <div>
        <div>
          <div>
            <Link href="/">
              <span aria-hidden="true">★</span>
              <span>{title}</span>
            </Link>
          </div>
          <p>{tagline}</p>
        </div>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3>{section.title}</h3>
            <ul>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <PrismicNextLink field={link}>{link.text}</PrismicNextLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <p>
          ★ {foundingYear}-{currentYear} {copyright}
        </p>
        <ul>
          <li>
            <PrismicNextLink field={privacy_policy}>
              {privacy_policy.text}
            </PrismicNextLink>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export { Footer };
