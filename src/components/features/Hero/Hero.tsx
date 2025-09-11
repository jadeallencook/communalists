import { FC } from 'react';
import { Content } from '@prismicio/client';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';
import Button from '@/components/common/Button';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import styles from './Hero.module.css';

namespace Hero {
  export interface Props extends SliceComponentProps<Content.HeroSlice> {}
}

const Hero: FC<Hero.Props> = ({ slice }) => {
  const { primary } = slice;
  const { title, eyebrow, description, links, image } = primary;

  return (
    <header className={styles.root}>
      <div>
        <div>
          <PrismicRichText field={eyebrow} />
          <p aria-hidden="true">{title}</p>
          <p>{description}</p>
          <div>
            {links.map(({ link }) => {
              const { text, variant } = link;
              return (
                <Button key={text} asChild>
                  <PrismicNextLink field={link}>{text}</PrismicNextLink>
                </Button>
              );
            })}
          </div>
        </div>
        <PrismicNextImage field={image} />
      </div>
    </header>
  );
};

export { Hero };
