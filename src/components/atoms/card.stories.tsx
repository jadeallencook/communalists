import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './card';

const meta = {
    title: 'Components/Atoms/Card',
    component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card className="max-w-sm">
            <CardHeader>
                <CardTitle>South Bay Mutual Aid</CardTitle>
                <CardDescription>
                    San Jose, California · 42 members
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    Neighbors helping neighbors with groceries, rides and
                    essentials.
                </p>
            </CardContent>
            <CardFooter>
                <Button>Join</Button>
            </CardFooter>
        </Card>
    ),
};
