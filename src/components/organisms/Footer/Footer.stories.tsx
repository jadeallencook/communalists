import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Organisms/Footer',
  component: Footer,
  // removes default padding from the story
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Communalists',
    tagline:
      'Tools and resources for communities to build and sustain mutual aid networks.',
    sections: [
      {
        title: 'Resources',
        links: [
          {
            link_type: 'Web',
            key: 'f56ab83f-f2b9-49ca-8ad6-c29515a23664',
            url: 'https://theanarchistlibrary.org',
            target: '_blank',
            text: 'Anarchist Library',
          },
          {
            link_type: 'Web',
            key: '4902dbb8-3ab6-4654-8295-a19879ca3a6e',
            url: 'https://foodnotbombs.net/new_site/seven-steps.php',
            target: '_blank',
            text: 'Food Not Bombs',
          },
        ],
      },
      {
        title: 'Contribute',
        links: [
          {
            link_type: 'Web',
            key: '403e6cb7-2fff-4d14-adb5-6b758f86dbe8',
            url: 'https://github.com/jadeallencook/communalists',
            target: '_blank',
            text: 'GitHub',
          },
          {
            link_type: 'Web',
            key: 'd9c044c4-b28c-477c-a650-318327e05e3c',
            url: 'https://communalists-storybook.vercel.app/',
            target: '_blank',
            text: 'Storybook',
          },
        ],
      },
      {
        title: 'Social Media',
        links: [
          {
            link_type: 'Web',
            key: '0ea769a3-3566-4e7f-bcf2-5d5d3bfcc8b1',
            url: 'https://discord.gg/zEyDZz3q',
            target: '_blank',
            text: 'Discord',
          },
          {
            link_type: 'Web',
            key: 'd1bdfbfc-f4fd-4504-ad61-439f2696165e',
            url: 'https://www.instagram.com/wearecommunalists',
            target: '_blank',
            text: 'Instagram',
          },
          {
            link_type: 'Web',
            key: 'ad1ffc3f-e66e-4869-8e29-b7885dba2214',
            url: 'https://bsky.app/profile/communalists.bsky.social',
            target: '_blank',
            text: 'Bluesky',
          },
        ],
      },
    ],
    copyright: 'Communalists | Built by Volunteers',
    privacy_policy: {
      link_type: 'Web',
      url: '/privacy-policy',
      target: '_blank',
      text: 'Privacy Policy',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Primary: Story = {};
