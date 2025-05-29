import { FC } from 'react';
import { Content } from '@prismicio/client';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';
import Button from '@/components/atoms/Button';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';

namespace Hero {
  export interface Props extends SliceComponentProps<Content.HeroSlice> {}
}

const Hero: FC<Hero.Props> = ({ slice }) => {
  const { primary } = slice;
  const { title, eyebrow, description, links, image } = primary;

  return (
    <section>
      <div className="grid items-center gap-8 bg-muted-2 lg:grid-cols-2">
        <div className="flex flex-col p-16 items-start px-4">
          <PrismicRichText field={eyebrow} />
          <p
            className="my-6 text-4xl font-bold text-pretty lg:text-6xl"
            aria-hidden="true"
          >
            {title}
          </p>
          <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
            {description}
          </p>
          <div className="flex w-full flex-colgap-2 sm:flex-row justify-start gap-2">
            {links.map(({ link }) => {
              const { text, variant } = link;
              return (
                <Button key={text} asChild variant={variant} size="sm">
                  <PrismicNextLink field={link}>{text}</PrismicNextLink>
                </Button>
              );
            })}
          </div>
        </div>
        <PrismicNextImage
          field={image}
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

export { Hero };
