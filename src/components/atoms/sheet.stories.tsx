import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './sheet';

const meta = {
    title: 'Components/Atoms/Sheet',
    component: Sheet,
    parameters: {
        docs: {
            description: {
                component:
                    'A dialog that slides in from an edge (no slide with reduced motion). Focus moves in, Esc closes it, and focus returns to the trigger. Pass a translated `closeLabel`.',
            },
        },
    },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open</Button>
            </SheetTrigger>
            <SheetContent closeLabel="Close">
                <SheetHeader>
                    <SheetTitle>South Bay Mutual Aid</SheetTitle>
                    <SheetDescription>
                        Food distribution every Saturday.
                    </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Done</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
};

export const FromTheLeft: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open</Button>
            </SheetTrigger>
            <SheetContent side="left" closeLabel="Close">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Narrow the list.</SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
};
