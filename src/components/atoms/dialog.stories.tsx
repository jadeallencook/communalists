import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';

const meta = {
    title: 'Components/Atoms/Dialog',
    component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Leave organization</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave South Bay Mutual Aid?</DialogTitle>
                    <DialogDescription>
                        You will lose access to its internal tools. You can ask
                        to join again later.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive">Leave</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};
