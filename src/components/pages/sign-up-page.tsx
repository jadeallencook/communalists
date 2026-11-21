import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/atoms/card';

export interface SignUpPageProps {
    /** The form. The app passes a container wired to the server action; Storybook passes <SignUpForm> with mock state. */
    form: ReactNode;
}

/** Create-account page layout: a card with a title, description and the form. */
export function SignUpPage({ form }: SignUpPageProps) {
    const t = useTranslations('SignUp');

    return (
        <section className="mx-auto w-full max-w-md px-4 py-16">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1 className="font-heading text-2xl font-semibold tracking-tight">
                            {t('title')}
                        </h1>
                    </CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>{form}</CardContent>
            </Card>
        </section>
    );
}
