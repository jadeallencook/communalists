import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware wrappers around Next.js navigation APIs. Use these instead of
// `next/link` and `next/navigation` so links keep the current locale.
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
