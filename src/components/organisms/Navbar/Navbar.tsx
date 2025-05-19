import { FC } from 'react';
import { Button } from '@/components/atoms/Button';
import { Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import Link from 'next/link';

namespace Navbar {
  export interface Props extends Content.NavbarDocumentData {}
}

const Navbar: FC<Navbar.Props> = ({ title, links }) => {
  return (
    <nav className="justify-between flex p-4">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tighter"
        >
          <span aria-hidden="true">★</span>
          <span className="underline">{title}</span>
        </Link>
      </div>
      <div className="flex gap-2">
        {links.map(({ link }) => {
          const { text, variant } = link;
          return (
            <Button key={text} asChild variant={variant} size="sm">
              <PrismicNextLink field={link}>{text}</PrismicNextLink>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export { Navbar };
