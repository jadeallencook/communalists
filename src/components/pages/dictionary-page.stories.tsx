import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DictionaryPage, DictionaryPageLoading } from './dictionary-page';

const counts: Record<string, number> = {
    a: 6,
    b: 2,
    c: 9,
    f: 3,
    h: 1,
    m: 4,
    t: 3,
};
const letters = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map((letter) => ({ letter, count: counts[letter] ?? 0 }));

const meta = {
    title: 'Pages/Dictionary',
    component: DictionaryPage,
    parameters: { layout: 'fullscreen' },
    args: {
        letter: 'm',
        letters,
        words: [
            {
                slug: 'member',
                word: 'Member',
                definition:
                    'On Communalists, someone who has joined an organization. Members can see and use its members-only tools.',
                lang: 'en',
            },
            {
                slug: 'moderator',
                word: 'Moderator',
                definition:
                    'On Communalists, a member trusted to help run an organization: approving people who ask to join, editing its page, making members moderators, and removing or banning members.',
                lang: 'en',
            },
            {
                slug: 'municipalism',
                word: 'Municipalism',
                definition:
                    'Organizing politics around the city or town: residents take more direct control of local decisions, often through neighborhood assemblies.',
                lang: 'en',
            },
            {
                slug: 'mutual-aid',
                word: 'Mutual Aid',
                definition:
                    'Neighbors helping each other directly with what they need, like food, rides or rent, and sharing what they have. Everyone can give and receive.',
                lang: 'en',
            },
        ],
    },
} satisfies Meta<typeof DictionaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Letter: Story = {};

/** A letter with no words says so; its button in the bar is dashed. */
export const EmptyLetter: Story = { args: { letter: 'q', words: [] } };

/** Chinese: words are grouped by pinyin, so 互助 (hùzhù) is under H. */
export const Chinese: Story = {
    globals: { locale: 'zh' },
    args: {
        letter: 'h',
        words: [
            {
                slug: 'mutual-aid',
                word: '互助',
                definition:
                    '邻居之间直接互相帮助，满足食物、交通或房租等需要，并分享自己拥有的东西。',
                lang: 'zh',
            },
        ],
    },
};

export const Loading: Story = { render: () => <DictionaryPageLoading /> };
