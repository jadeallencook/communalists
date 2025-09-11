'use client';

import { FC } from 'react';
import Button from '@/components/common/Button';
import { Content } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun } from 'lucide-react';
import styles from './Navbar.module.css';

namespace Navbar {
  export interface Props extends Content.NavbarDocumentData {}
}

const Navbar: FC<Navbar.Props> = ({ title, links }) => {
  const { setTheme, theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkTheme ? 'light' : 'dark');

  return (
    <nav className={styles.root}>
      <div className={styles.logo}>
        <span aria-hidden="true">★</span>
        <Link href="/" tabIndex={0}>
          <span>{title}</span>
        </Link>
      </div>
      <div className={styles.links}>
        {links.map(({ link }, index) => {
          const { text } = link;
          return (
            <PrismicNextLink tabIndex={0} field={link} key={index}>
              {text}
            </PrismicNextLink>
          );
        })}
        <button
          className={styles.themeToggleButton}
          onClick={toggleTheme}
          aria-hidden="true"
          tabIndex={0}
        >
          <Sun size={16} />
        </button>
      </div>
    </nav>
  );
};

export { Navbar };
