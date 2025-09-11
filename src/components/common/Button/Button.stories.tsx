import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Common/Button',
  component: Button,
  argTypes: {},
  args: {
    className: '',
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Join Community',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Learn About Community',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Leave Community',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Join Community',
    variant: 'outline',
  },
};

export const Link: Story = {
  args: {
    children: 'Read Community Guidelines',
    variant: 'link',
  },
};
