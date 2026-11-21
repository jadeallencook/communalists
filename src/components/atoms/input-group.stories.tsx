import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SearchIcon } from 'lucide-react';

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from './input-group';

const meta = {
    title: 'Components/Atoms/Input Group',
    component: InputGroup,
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
    render: () => (
        <InputGroup>
            <InputGroupAddon>
                <SearchIcon aria-hidden />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search organizations" />
        </InputGroup>
    ),
};

export const WithTextAndButton: Story = {
    render: () => (
        <InputGroup>
            <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="southbaymutualaid" />
            <InputGroupAddon align="inline-end">
                <InputGroupButton>Check</InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    ),
};
