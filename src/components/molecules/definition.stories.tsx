import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Definition } from './definition';
import { samplePreviews, WithDefinitions } from './definition-fixtures';
import type { DefinitionPreviews } from '@/hooks/use-definition-previews';

function Sentence({
    state,
    slug = 'mutual-aid',
    word = 'mutual aid',
}: {
    state?: DefinitionPreviews;
    slug?: string;
    word?: string;
}) {
    return (
        <WithDefinitions state={state}>
            <p className="max-w-prose text-lg">
                Start a group for <Definition slug={slug}>{word}</Definition> in
                your neighborhood, and{' '}
                <a href="#" className="underline underline-offset-4">
                    an ordinary link
                </a>{' '}
                for comparison. Hover or Tab to the marked word.
            </p>
        </WithDefinitions>
    );
}

const meta = {
    title: 'Components/Molecules/Definition',
    component: Sentence,
    parameters: {
        docs: {
            description: {
                component:
                    'A dictionary word marked in our copy. Dotted underline; hover or keyboard focus shows the short definition (Escape closes it); choosing it opens the word’s page. Pass the slug, not the word.',
            },
        },
    },
} satisfies Meta<typeof Sentence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Found: Story = {};

/** The slug isn't in the dictionary: plain text, no underline, no error. */
export const NotFound: Story = {
    args: { slug: 'not-a-word', word: 'not a word' },
};

/** Before the definitions arrive: a link to the page, no tooltip yet. */
export const Loading: Story = { args: { state: { status: 'loading' } } };

/** The definitions couldn't load: still a link to the page. */
export const LoadFailed: Story = { args: { state: { status: 'error' } } };

export const LongDefinition: Story = {
    args: {
        state: {
            status: 'ready',
            previews: {
                'mutual-aid': {
                    word: 'Community Land Trust and Cooperative Housing Association',
                    definition:
                        'A nonprofit that owns land on behalf of a community and keeps the homes on it affordable for good, so families who live there now, and those after them, are not pushed out when prices go up over time in the area.',
                    lang: 'en',
                },
            },
        },
    },
};

export const Spanish: Story = {
    globals: { locale: 'es' },
    args: {
        word: 'ayuda mutua',
        state: {
            status: 'ready',
            previews: {
                'mutual-aid': {
                    word: 'Ayuda mutua',
                    definition:
                        'Vecinos que se ayudan directamente con lo que necesitan, como comida, transporte o renta, y comparten lo que tienen.',
                    lang: 'es',
                },
            },
        },
    },
};

export const Vietnamese: Story = {
    globals: { locale: 'vi' },
    args: {
        word: 'tương trợ',
        state: {
            status: 'ready',
            previews: {
                'mutual-aid': {
                    word: 'Tương trợ',
                    definition:
                        'Hàng xóm giúp đỡ nhau trực tiếp với những gì họ cần, như thức ăn, đi lại hay tiền thuê nhà.',
                    lang: 'vi',
                },
            },
        },
    },
};

/** Chinese UI, with the word not translated yet: shown in English (lang="en"). */
export const ChineseFallback: Story = {
    globals: { locale: 'zh' },
    args: {
        word: '互助',
        state: { status: 'ready', previews: samplePreviews },
    },
};
