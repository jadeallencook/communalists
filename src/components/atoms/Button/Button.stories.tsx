import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      options: ['default', 'secondary', 'destructive', 'outline', 'link'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['default', 'sm', 'lg'],
    },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    asChild: {
      table: {
        disable: true,
      },
    },
    className: {
      table: {
        disable: true,
      },
    },
    children: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    asChild: false,
    disabled: false,
    className: '',
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Join Community',
    variant: 'default',
    size: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Learn About Community',
    variant: 'secondary',
    size: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Leave Community',
    variant: 'destructive',
    size: 'default',
  },
};

export const Outline: Story = {
  args: {
    children: 'Join Community',
    variant: 'outline',
    size: 'default',
  },
};

export const Link: Story = {
  args: {
    children: 'Read Community Guidelines',
    variant: 'link',
    size: 'default',
  },
};
