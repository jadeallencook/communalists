import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useLocale } from 'next-intl';

import { AccountSetupForm } from '@/components/organisms/account-setup-form';
import { sampleSearch } from '@/lib/places/sample';
import {
    accountSetupSchema,
    type AccountSetupErrorKey,
    type AccountSetupField,
    type AccountSetupState,
} from '@/lib/validation/account-setup';
import { localeNames, routing } from '@/i18n/routing';

import {
    useAccountSetupForm,
    type AccountSetupAction,
} from './use-account-setup-form';
import { useLocationPicker } from './use-location-picker';

// A stand-in for the server action: real validation, nothing saved.
const mockSave: AccountSetupAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const raw = Object.fromEntries(
        ['name', 'locale', 'country', 'placeId'].map((k) => [
            k,
            String(formData.get(k) ?? ''),
        ])
    );
    const parsed = accountSetupSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: AccountSetupState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            fieldErrors[issue.path[0] as AccountSetupField] ??=
                issue.message as AccountSetupErrorKey;
        }
        return { fieldErrors, values: { name: raw.name } };
    }
    return { values: { name: parsed.data.name } };
};

const search = sampleSearch(400);

function UseAccountSetupFormDemo() {
    const locale = useLocale();
    const { state, formAction, pending } = useAccountSetupForm(mockSave);
    const location = useLocationPicker({ locale, search });
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <AccountSetupForm
                state={state}
                formAction={formAction}
                pending={pending}
                locale={locale}
                next="/welcome"
                defaults={{ preferredLocale: locale }}
                languages={routing.locales.map((code) => ({
                    code,
                    name: localeNames[code],
                }))}
                location={location}
            />
            <div className="flex flex-col gap-2 text-sm">
                <p className="font-semibold">Hook output</p>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                    {JSON.stringify({ pending, state }, null, 2)}
                </pre>
                <p className="text-muted-foreground">
                    Submit to see validation. Try &quot;san&quot; in the city
                    search. In the app, saving goes to the page in{' '}
                    <code>next</code>.
                </p>
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useAccountSetupForm',
    component: UseAccountSetupFormDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for account setup. The app passes the `saveAccountSetup` server action; this demo passes a mock that uses the real validation schema.',
            },
        },
    },
} satisfies Meta<typeof UseAccountSetupFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
