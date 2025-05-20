'use client';

import { FC } from 'react';
import Button from '@/components/atoms/Button';
import { Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun } from 'lucide-react';

namespace Navbar {
  export interface Props extends Content.NavbarDocumentData {}
}

const Navbar: FC<Navbar.Props> = ({ title, links }) => {
  const { setTheme, theme } = useTheme();
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

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
        <Button
          onClick={toggleTheme}
          size="sm"
          variant="outline"
          aria-hidden="true"
        >
          <Sun />
        </Button>
      </div>
    </nav>
  );
};

export { Navbar };
