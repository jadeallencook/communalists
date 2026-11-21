import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useLocale } from 'next-intl';

import { SignUpForm } from '@/components/organisms/sign-up-form';
import {
    signUpSchema,
    type SignUpErrorKey,
    type SignUpField,
    type SignUpState,
} from '@/lib/validation/sign-up';

import { useSignUpForm, type SignUpAction } from './use-sign-up-form';

// A stand-in for the server action: real validation, fake everything else.
const mockSignUp: SignUpAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const raw = Object.fromEntries(
        ['email', 'password', 'confirmPassword'].map((k) => [
            k,
            String(formData.get(k) ?? ''),
        ])
    );
    const values = { email: raw.email };
    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: SignUpState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            fieldErrors[issue.path[0] as SignUpField] ??=
                issue.message as SignUpErrorKey;
        }
        return { fieldErrors, values };
    }
    if (parsed.data.email.endsWith('@taken.test')) {
        return { fieldErrors: { email: 'emailInUse' }, values };
    }
    return { values };
};

function UseSignUpFormDemo() {
    const locale = useLocale();
    const { state, formAction, pending } = useSignUpForm(mockSignUp);
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <SignUpForm
                state={state}
                formAction={formAction}
                pending={pending}
                locale={locale}
            />
            <div className="flex flex-col gap-2 text-sm">
                <p className="font-semibold">Hook output</p>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                    {JSON.stringify({ pending, state }, null, 2)}
                </pre>
                <p className="text-muted-foreground">
                    Submit to see validation. Use an email ending in{' '}
                    <code>@taken.test</code> to see the &quot;already
                    exists&quot; error. In the app, success goes to account
                    setup.
                </p>
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useSignUpForm',
    component: UseSignUpFormDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for the sign-up form. The app passes the `signUp` server action; this demo passes a mock that uses the real validation schema.',
            },
        },
    },
} satisfies Meta<typeof UseSignUpFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
