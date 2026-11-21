import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useLocale } from 'next-intl';

import { SignInForm } from '@/components/organisms/sign-in-form';
import {
    signInSchema,
    type SignInErrorKey,
    type SignInField,
    type SignInState,
} from '@/lib/validation/sign-in';

import { useSignInForm, type SignInAction } from './use-sign-in-form';

// A stand-in for the server action: real validation, fake credentials.
const mockSignIn: SignInAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const raw = {
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
    };
    const values = { email: raw.email };
    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: SignInState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            fieldErrors[issue.path[0] as SignInField] ??=
                issue.message as SignInErrorKey;
        }
        return { fieldErrors, values };
    }
    if (parsed.data.password !== 'correct horse') {
        return { formError: 'invalidCredentials', values };
    }
    return { values };
};

function UseSignInFormDemo() {
    const locale = useLocale();
    const { state, formAction, pending } = useSignInForm(mockSignIn);
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <SignInForm
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
                    Any valid email works. The password{' '}
                    <code>correct horse</code> succeeds; anything else shows the
                    wrong-password error.
                </p>
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useSignInForm',
    component: UseSignInFormDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for the sign-in form. The app passes the `signIn` server action; this demo passes a mock that uses the real validation schema.',
            },
        },
    },
} satisfies Meta<typeof UseSignInFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
