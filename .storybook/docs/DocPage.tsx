import { Markdown } from '@storybook/addon-docs/blocks';
import type { AnchorHTMLAttributes } from 'react';

const REPO = 'https://github.com/jadeallencook/communalists/blob/main';

// Resolves a link written for GitHub (relative to the .md file) to where it
// should go inside Storybook: another doc page, the file on GitHub, or an
// external URL unchanged.
function resolveHref(
    href: string,
    source: string,
    docMap: Record<string, string>
): { href: string; external: boolean } {
    if (/^[a-z]+:/i.test(href) || href.startsWith('#')) {
        return { href, external: /^https?:/i.test(href) };
    }
    const [target] = href.split('#');
    const resolved = new URL(
        target,
        `https://repo.local/${source}`
    ).pathname.slice(1);
    const id = docMap[resolved];
    if (id) return { href: `/?path=/docs/${id}`, external: false };
    return { href: `${REPO}/${resolved}`, external: true };
}

export function DocPage({
    source,
    content,
    docMap,
}: {
    source: string;
    content: string;
    docMap: Record<string, string>;
}) {
    const Link = ({
        href = '',
        ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
        const link = resolveHref(href, source, docMap);
        return (
            <a
                {...props}
                href={link.href}
                // Docs render inside Storybook's iframe; break out of it for
                // links to other docs pages and open external links in a new tab.
                target={link.external ? '_blank' : '_top'}
                rel={link.external ? 'noreferrer' : undefined}
            />
        );
    };

    return (
        <>
            <Markdown options={{ overrides: { a: { component: Link } } }}>
                {content}
            </Markdown>
            <p style={{ marginTop: 48, fontSize: 12, opacity: 0.7 }}>
                Source:{' '}
                <a href={`${REPO}/${source}`} target="_blank" rel="noreferrer">
                    {source}
                </a>
            </p>
        </>
    );
}
