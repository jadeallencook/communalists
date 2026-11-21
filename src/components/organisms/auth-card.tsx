import type { ReactNode } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/atoms/card';
import { Link } from '@/i18n/navigation';

export interface AuthCardProps {
    /** The page's heading (rendered as its h1). */
    title: string;
    description?: ReactNode;
    children: ReactNode;
    /** A link to the neighboring page: "Already have an account? Sign in". */
    footer?: { prompt: string; label: string; href: string };
}

/** The narrow centered card shared by sign-up, sign-in and password pages. */
export function AuthCard({
    title,
    description,
    children,
    footer,
}: AuthCardProps) {
    return (
        <section className="mx-auto w-full max-w-md px-4 py-16">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1 className="font-heading text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                    </CardTitle>
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer && (
                    <CardFooter className="justify-center text-sm text-muted-foreground">
                        <p>
                            {footer.prompt}{' '}
                            <Link
                                href={footer.href}
                                className="font-medium text-foreground underline underline-offset-4"
                            >
                                {footer.label}
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </section>
    );
}
