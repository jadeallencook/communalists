import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useLocale } from 'next-intl';

import { ResetPasswordForm } from '@/components/organisms/reset-password-form';
import {
    resetPasswordSchema,
    type ResetPasswordErrorKey,
    type ResetPasswordField,
    type ResetPasswordState,
} from '@/lib/validation/reset-password';

import {
    useResetPasswordForm,
    type ResetPasswordAction,
} from './use-reset-password-form';

// A stand-in for the server action: real validation, no Firebase.
const mockReset: ResetPasswordAction = async (_previous, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const parsed = resetPasswordSchema.safeParse({
        oobCode: String(formData.get('oobCode') ?? ''),
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
    });
    if (!parsed.success) {
        const fieldErrors: ResetPasswordState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            fieldErrors[issue.path[0] as ResetPasswordField] ??=
                issue.message as ResetPasswordErrorKey;
        }
        return { fieldErrors };
    }
    if (parsed.data.password === 'expired link') return { linkExpired: true };
    return {};
};

function UseResetPasswordFormDemo() {
    const locale = useLocale();
    const { state, formAction, pending } = useResetPasswordForm(mockReset);
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <ResetPasswordForm
                state={state}
                formAction={formAction}
                pending={pending}
                locale={locale}
                oobCode="sample-code"
                email="ada@example.com"
            />
            <div className="flex flex-col gap-2 text-sm">
                <p className="font-semibold">Hook output</p>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                    {JSON.stringify({ pending, state }, null, 2)}
                </pre>
                <p className="text-muted-foreground">
                    Submit to see validation. The password{' '}
                    <code>expired link</code> (typed twice) shows what happens
                    when the code expires while the form is open. In the app, a
                    successful save signs the person in and goes to the
                    dashboard.
                </p>
            </div>
        </div>
    );
}

const meta = {
    title: 'Hooks/useResetPasswordForm',
    component: UseResetPasswordFormDemo,
    parameters: {
        docs: {
            description: {
                component:
                    'Wraps `useActionState` for choosing a new password. The app passes the `resetPassword` server action; this demo passes a mock that uses the real validation schema.',
            },
        },
    },
} satisfies Meta<typeof UseResetPasswordFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
