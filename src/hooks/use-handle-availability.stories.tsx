import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { HandleField } from '@/components/molecules/handle-field';
import type { HandleCheck } from '@/lib/organizations/client';

import { useHandleAvailability } from './use-handle-availability';

// Pretend server: "sbma" and "oakland-auto-club" are taken.
const taken = new Set(['sbma', 'oakland-auto-club']);
const mockCheck = (handle: string, signal: AbortSignal) =>
    new Promise<HandleCheck>((resolve, reject) => {
        const timer = setTimeout(
            () =>
                resolve(
                    taken.has(handle)
                        ? { available: false, reason: 'taken' }
                        : { available: true }
                ),
            500
        );
        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

function Demo() {
    const [value, setValue] = useState('sbma');
    const status = useHandleAvailability(value, { check: mockCheck });
    return (
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
            <HandleField value={value} onChange={setValue} status={status} />
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(status, null, 2)}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useHandleAvailability',
    component: Demo,
    parameters: {
        docs: {
            description: {
                component:
                    'Live handle check. Shape problems (too short, reserved, bad characters) answer instantly; otherwise it asks the server after a 300 ms pause. This demo fakes the server: "sbma" and "oakland-auto-club" are taken.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
