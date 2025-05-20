import type { Meta, StoryObj } from '@storybook/react';

import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Organisms/Hero',
  component: Hero,
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {
    slice: {
      slice_type: 'hero',
      slice_label: null,
      version: 'storybook',
      variation: 'default',
      id: 'default',
      items: [],
      primary: {
        eyebrow: [
          {
            type: 'heading1',
            text: 'Mutual Aid Tools & Resources',
            spans: [],
            direction: 'ltr',
          },
        ],
        title: 'This is what community looks like.',
        description:
          'We provide tools and resources that empower communities to support each other through mutual aid. Our platform connects individuals and organizations to share resources, knowledge, and support. Join us in building stronger communities.',
        links: [
          {
            link: {
              link_type: 'Web',
              url: '/about',
              text: 'Learn More',
              variant: 'outline',
            },
          },
          {
            link: {
              link_type: 'Web',
              url: '/sign-up',
              text: 'Create Account',
              variant: 'default',
            },
          },
        ],
        image: {
          dimensions: { width: 1086, height: 724 },
          alt: 'Someone passing a plate of food.',
          copyright: null,
          url: 'https://images.prismic.io/communalists/aCwEKSdWJ-7kSUeE_4004F444-41EA-4AF1-89F0-ACA7035E0A5C_1_105_c.jpeg?auto=format,compress',
          id: 'aCwEKSdWJ-7kSUeE',
          edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        },
      },
    },
  },
};
