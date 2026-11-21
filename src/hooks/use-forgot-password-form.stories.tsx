import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useLocale } from 'next-intl';

import { ForgotPasswordForm } from '@/components/organisms/forgot-password-form';
import {
    forgotPasswordSchema,
    type ForgotPasswordErrorKey,
} from '@/lib/validation/forgot-password';

import {
    useForgotPasswordForm,
    type ForgotPasswordAction,
} from './use-forgot-password-form';

// A stand-in for the server action: real validation, no email sent.
const mockRequestReset: ForgotPasswordAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const values = { email: String(formData.get('email') ?? '') };
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
        return {
            fieldErrors: {
                email: parsed.error.issues[0]
                    ?.message as ForgotPasswordErrorKey,
            },
            values,
        };
    }
    if (parsed.data.email.endsWith('@throttled.test')) {
        return { formError: 'tooManyAttempts', values };
    }
    return { sent: true, values };
};

function UseForgotPasswordFormDemo() {
    const locale = useLocale();
    const { state, formAction, pending } =
        useForgotPasswordForm(mockRequestReset);
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <ForgotPasswordForm
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
                    Any valid email shows the confirmation (real or not, so the
                    page never reveals who has an account). An email ending in{' '}
                    <code>@throttled.test</code> shows the too-many-requests
                    error. Reload the story to start over.
                </p>
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useForgotPasswordForm',
    component: UseForgotPasswordFormDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for the forgot-password form. The app passes the `requestPasswordReset` server action; this demo passes a mock that uses the real validation schema.',
            },
        },
    },
} satisfies Meta<typeof UseForgotPasswordFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
