'use server';

import { hasLocale } from 'next-intl';

import { endSession } from '@/lib/auth/session';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export async function signOut(formData: FormData): Promise<void> {
    const requested = formData.get('locale');
    const locale =
        typeof requested === 'string' && hasLocale(routing.locales, requested)
            ? requested
            : routing.defaultLocale;
    await endSession();
    redirect({ href: '/', locale });
}
