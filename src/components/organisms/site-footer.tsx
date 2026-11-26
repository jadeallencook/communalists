import { useTranslations } from 'next-intl';

import type { BuildInfo } from '@/lib/build-info';
import { REPOSITORY_URL } from '@/lib/build-info';

export interface SiteFooterProps {
    /** Which build is running. The layout passes currentBuild(); omit to hide it. */
    build?: BuildInfo;
}

const linkClass = 'underline-offset-4 hover:text-foreground hover:underline';

/** Bottom of every page: who built it, the open-source link, and the running commit. */
export function SiteFooter({ build }: SiteFooterProps) {
    const t = useTranslations('Footer');

    return (
        <footer className="border-t">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                    {t('developedBy')} · {t('region')} · {t('established')}
                </p>
                <p>
                    <a
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClass}
                    >
                        {t('openSource')}
                    </a>
                    {build && (
                        <>
                            {' · '}
                            <BuildLabel build={build} />
                        </>
                    )}
                </p>
            </div>
        </footer>
    );
}

function BuildLabel({ build }: { build: BuildInfo }) {
    const t = useTranslations('Footer');
    if (!build.commitUrl || !build.commit) {
        return <span className="font-mono text-xs">dev</span>;
    }
    return (
        <a
            href={build.commitUrl}
            target="_blank"
            rel="noreferrer"
            title={t('build', { commit: build.commit })}
            aria-label={t('build', { commit: build.commit })}
            className={`font-mono text-xs ${linkClass}`}
        >
            {build.commit}
        </a>
    );
}
