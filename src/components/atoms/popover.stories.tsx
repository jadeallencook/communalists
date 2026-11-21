import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from './popover';

const meta = {
    title: 'Components/Atoms/Popover',
    component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Who has the ladder?</Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>Extension ladder</PopoverTitle>
                    <PopoverDescription>
                        Checked out by Maria · due back Saturday
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    ),
};
