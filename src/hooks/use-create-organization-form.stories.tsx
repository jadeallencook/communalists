import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import type { SocialLink } from '@/components/molecules/social-links-field';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { languageOptions } from '@/components/organisms/create-organization-form.stories';
import { sampleSearch } from '@/lib/places/sample';
import { suggestHandle } from '@/lib/organizations/handle';
import type { ReachScope } from '@/lib/organizations/options';
import {
    organizationFormValues,
    organizationSchema,
    type CreateOrganizationState,
    type OrganizationErrorKey,
    type OrganizationField,
} from '@/lib/validation/organization';

import {
    useCreateOrganizationForm,
    type CreateOrganizationAction,
} from './use-create-organization-form';
import { useLocationPicker } from './use-location-picker';

// Stand-in for the server action: real validation, nothing saved.
const mockCreate: CreateOrganizationAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const raw = organizationFormValues(formData);
    const parsed = organizationSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: CreateOrganizationState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            fieldErrors[issue.path[0] as OrganizationField] ??=
                issue.message as OrganizationErrorKey;
        }
        return { fieldErrors, values: raw };
    }
    return { values: raw };
};

const search = sampleSearch(300);

function Demo() {
    const { state, formAction, pending } =
        useCreateOrganizationForm(mockCreate);
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [reach, setReach] = useState<ReachScope>('local');
    const [socials, setSocials] = useState<SocialLink[]>([]);
    const location = useLocationPicker({ locale: 'en', search });
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <CreateOrganizationForm
                state={state}
                formAction={formAction}
                pending={pending}
                locale="en"
                name={name}
                onNameChange={(next) => {
                    setName(next);
                    setHandle(suggestHandle(next));
                }}
                handle={handle}
                onHandleChange={setHandle}
                handleStatus={
                    handle ? { state: 'available' } : { state: 'empty' }
                }
                focusAreas={focusAreas}
                onFocusAreasChange={setFocusAreas}
                reach={reach}
                onReachChange={setReach}
                socials={socials}
                onSocialsChange={setSocials}
                location={location}
                languageOptions={languageOptions}
            />
            <pre className="h-fit overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify({ pending, state }, null, 2)}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/useCreateOrganizationForm',
    component: Demo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for creating an organization. This demo uses the real validation schema with a fake action; the handle follows the name.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
