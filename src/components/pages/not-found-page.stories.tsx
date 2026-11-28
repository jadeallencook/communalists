import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WordSuggestions } from '@/components/molecules/word-suggestions';

import { NotFoundPage } from './not-found-page';

const meta = {
    title: 'Pages/NotFoundPage',
    component: NotFoundPage,
    parameters: { layout: 'fullscreen' },
    args: {
        title: "We couldn't find that page",
        description:
            'The address may have a typo, or the page may have moved or been removed.',
        address: '/nope/really',
        actions: [
            { href: '/', label: 'Go to the homepage' },
            { href: '/find/organizations', label: 'Find organizations' },
            { href: '/dictionary', label: 'Browse the dictionary' },
        ],
    },
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Any address no page matches. */
export const General: Story = {};

/** A word that isn't in the dictionary, with close matches. */
export const Word: Story = {
    args: {
        title: 'There’s no word “mutal-aid” in the dictionary yet',
        description:
            'Check the spelling, or browse the dictionary. New words are added over time.',
        address: undefined,
        actions: [{ href: '/dictionary', label: 'Browse the dictionary' }],
        children: (
            <WordSuggestions
                words={[
                    { slug: 'mutual-aid', word: 'Mutual Aid', lang: 'en' },
                    {
                        slug: 'mutual-aid-network',
                        word: 'Mutual Aid Network',
                        lang: 'en',
                    },
                ]}
            />
        ),
    },
};

/** An organization address nobody uses (any more). */
export const Organization: Story = {
    args: {
        title: 'We couldn’t find an organization at “south-bay-aid”',
        description:
            'Organizations can change their address, and an old address stops working after a while. It may also have been taken down. Try finding it by name or place.',
        address: undefined,
        actions: [
            { href: '/find/organizations', label: 'Find organizations' },
            { href: '/organization/new', label: 'Start an organization' },
        ],
    },
};

/** A very long address, to check wrapping at 320px and 200% zoom. */
export const LongAddress: Story = {
    args: {
        address:
            '/organization/a-very-long-handle-that-someone-typed/members/and/more/segments-than-expected',
    },
};

export const Vietnamese: Story = {
    globals: { locale: 'vi' },
    args: {
        title: 'Chúng tôi không tìm thấy trang đó',
        description:
            'Địa chỉ có thể bị gõ sai, hoặc trang đã được chuyển đi hay bị gỡ xuống.',
        actions: [{ href: '/', label: 'Về trang chủ' }],
    },
};
