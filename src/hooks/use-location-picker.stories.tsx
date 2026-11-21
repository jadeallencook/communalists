import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LocationField } from '@/components/molecules/location-field';
import { sampleSearch } from '@/lib/places/sample';

import { useLocationPicker } from './use-location-picker';

const search = sampleSearch(400);

function UseLocationPickerDemo({
    preselected = false,
}: {
    preselected?: boolean;
}) {
    const location = useLocationPicker({
        locale: 'en',
        search,
        selected: preselected
            ? { id: '5392171', label: 'San Jose, California' }
            : null,
    });
    const { countries, options, ...rest } = location;
    return (
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
                <LocationField {...location} />
            </div>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(
                    {
                        countries,
                        options,
                        ...Object.fromEntries(
                            Object.entries(rest).filter(
                                ([, v]) => typeof v !== 'function'
                            )
                        ),
                    },
                    null,
                    2
                )}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useLocationPicker',
    component: UseLocationPickerDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Holds the country, search text and chosen city for `LocationField`, using `usePlaceSearch`. Changing country clears the city. This demo searches a sample dataset.',
            },
        },
    },
} satisfies Meta<typeof UseLocationPickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
/** An account that already has a city: shown as chosen. */
export const Preselected: Story = { args: { preselected: true } };
