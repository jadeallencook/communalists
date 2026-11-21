import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from './command';

const meta = {
    title: 'Components/Atoms/Command',
    component: Command,
    decorators: [
        (Story) => (
            <div className="max-w-sm rounded-lg border">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Command>
            <CommandInput placeholder="Search tools…" />
            <CommandList>
                <CommandEmpty>No tools found.</CommandEmpty>
                <CommandGroup heading="Organization">
                    <CommandItem>Requests</CommandItem>
                    <CommandItem>Library</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Planning">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Documents</CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};
