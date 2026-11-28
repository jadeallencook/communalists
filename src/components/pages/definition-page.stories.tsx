import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CopyLinkButton } from '@/components/molecules/copy-link-button';
import { sampleComments } from '@/components/molecules/comment-fixtures';
import { DefinitionEditBar } from '@/components/molecules/definition-edit-bar';
import { Discussion } from '@/components/organisms/discussion';

import { DefinitionPage, DefinitionPageLoading } from './definition-page';

const share = (
    <CopyLinkButton
        url="https://communalists.com/en/dictionary/mutual-aid"
        status="idle"
        onCopy={fn()}
        labels={{
            copy: 'Copy link',
            copied: 'Link copied.',
            failed: "Couldn't copy. Here's the link:",
        }}
    />
);

const meta = {
    title: 'Pages/Definition',
    component: DefinitionPage,
    parameters: { layout: 'fullscreen' },
    args: {
        slug: 'mutual-aid',
        word: 'Mutual aid',
        definition:
            'Neighbors helping each other directly with what they need, like food, rides or rent, and sharing what they have. Everyone can give and receive.',
        details: [
            'Mutual aid is not charity. In charity, one group gives and another receives. In mutual aid, people help each other as equals, and the person who gets help today may give help tomorrow.',
            'Mutual aid groups are often run by volunteers. They may share groceries, cook meals, give rides to appointments, help with paperwork, or raise money when someone is in trouble.',
        ],
        lang: 'en',
        locale: 'en',
        letter: 'm',
        related: [
            { slug: 'solidarity', word: 'Solidarity', lang: 'en' },
            {
                slug: 'mutual-aid-network',
                word: 'Mutual aid network',
                lang: 'en',
            },
        ],
        resources: [],
        share,
    },
} satisfies Meta<typeof DefinitionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Word: Story = {};

/** What a super user sees: a link to edit the word. */
export const SuperUser: Story = {
    args: { edit: <DefinitionEditBar slug="mutual-aid" word="Mutual aid" /> },
};

/** A super user back from the edit form: "Saved" takes focus. */
export const SuperUserSaved: Story = {
    args: {
        edit: <DefinitionEditBar slug="mutual-aid" word="Mutual aid" saved />,
    },
};

/** Only the short definition, nothing related. */
export const ShortOnly: Story = {
    args: { details: [], related: [] },
};

/** Not written in the UI language yet: shown in English, and the page says so. */
export const NotTranslated: Story = {
    args: { locale: 'vi' },
    globals: { locale: 'vi' },
};

export const Spanish: Story = {
    globals: { locale: 'es' },
    args: {
        word: 'Ayuda mutua',
        definition:
            'Vecinos que se ayudan directamente con lo que necesitan, como comida, transporte o renta, y comparten lo que tienen. Todos pueden dar y recibir.',
        details: [],
        lang: 'es',
        locale: 'es',
        letter: 'a',
        related: [{ slug: 'solidarity', word: 'Solidaridad', lang: 'es' }],
    },
};

/** A long word and definition, to check wrapping at 200% zoom and on phones. */
export const LongText: Story = {
    args: {
        word: 'Community land trust and cooperative housing association',
        definition:
            'A nonprofit that owns land on behalf of a community and keeps the homes on it affordable for good, so that families who live there now, and those who come after them, are not pushed out when prices in the area go up over time.',
    },
};

/** With resources (planned): books, videos, articles and links. */
export const WithResources: Story = {
    args: {
        resources: [
            {
                id: 'r1',
                type: 'book',
                title: 'A book about mutual aid',
                url: 'https://example.com/book',
                by: 'An author',
            },
            {
                id: 'r2',
                type: 'video',
                title: 'What mutual aid looks like',
                url: 'https://example.com/video',
            },
        ],
    },
};

/** With its discussion, as a signed-out visitor sees it. */
export const WithDiscussion: Story = {
    args: {
        discussion: (
            <Discussion
                viewer={{
                    status: 'signedOut',
                    signUpHref: '/sign-up',
                    signInHref: '/sign-in',
                }}
                counts={{ all: 4, en: 3, es: 1, vi: 0, zh: 0 }}
                comments={sampleComments.filter((c) => c.lang === 'en')}
                sort="top"
                onSortChange={fn()}
                readerLanguage="en"
                language="en"
                onLanguageChange={fn()}
                hasMore={false}
                onLoadMore={fn()}
                onVote={fn()}
                onReport={fn()}
                onDelete={fn()}
                onHide={fn()}
            />
        ),
    },
};

export const Loading: Story = { render: () => <DefinitionPageLoading /> };
