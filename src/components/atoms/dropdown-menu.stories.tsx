import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
    title: 'Components/Atoms/Dropdown Menu',
    component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Organization</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>South Bay Mutual Aid</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View public page</DropdownMenuItem>
                <DropdownMenuItem>Members</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
};
