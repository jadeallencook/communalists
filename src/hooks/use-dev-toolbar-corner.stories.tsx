import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    DEV_TOOLBAR_CORNERS,
    useDevToolbarCorner,
} from './use-dev-toolbar-corner';

function Demo() {
    const [corner, setCorner] = useDevToolbarCorner();
    return (
        <div className="flex max-w-md flex-col gap-4">
            <p className="text-sm">
                Saved corner: <code>{corner}</code>. It&apos;s kept in this
                browser (localStorage), so it survives reloads; other tabs
                follow along.
            </p>
            <div className="flex flex-wrap gap-2">
                {DEV_TOOLBAR_CORNERS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setCorner(option)}
                        aria-pressed={corner === option}
                        className="rounded-md border px-2.5 py-1 text-sm aria-pressed:border-primary aria-pressed:bg-muted"
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useDevToolbarCorner',
    component: Demo,
    parameters: {
        docs: {
            description: {
                component:
                    'Where the dev toolbar sits. Defaults to bottom right (Next’s own indicator is bottom left). Falls back to the default if storage is blocked.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
