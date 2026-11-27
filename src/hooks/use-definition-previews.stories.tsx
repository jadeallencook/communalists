import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { samplePreviews } from '@/components/molecules/definition-fixtures';

import { useDefinitionPreviews } from './use-definition-previews';

const slow = () =>
    new Promise<typeof samplePreviews>((resolve) =>
        setTimeout(() => resolve(samplePreviews), 1000)
    );
const broken = () => Promise.reject(new Error('offline'));

function Demo({ fails }: { fails: boolean }) {
    const { state, load } = useDefinitionPreviews('en', fails ? broken : slow);
    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={load}
                className="w-fit rounded-md border px-3 py-1.5"
            >
                load()
            </button>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(
                    state.status === 'ready'
                        ? {
                              status: state.status,
                              words: Object.keys(state.previews),
                          }
                        : state,
                    null,
                    2
                )}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useDefinitionPreviews',
    component: Demo,
    args: { fails: false },
    parameters: {
        docs: {
            description: {
                component:
                    'Loads the short definitions for marked words from /api/definitions, once per language per page, and only after load() (a marked word calls it). This demo fakes the request with a 1 s delay.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loads: Story = {};
export const Fails: Story = { args: { fails: true } };
