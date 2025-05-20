import type { Meta, StoryObj } from '@storybook/react';

import { Navbar } from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Organisms/Navbar',
  component: Navbar,
  // removes default padding from the story
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Communalists',
    links: [{ link: { url: '/about', text: 'Login', link_type: 'Web' } }],
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Primary: Story = {};
