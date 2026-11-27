import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    HeaderLinksPlaceholder,
    NavLinks,
    SignedOutLinks,
} from './header-links';

const meta = {
    title: 'Components/Molecules/Header Links',
    component: SignedOutLinks,
    decorators: [
        (Story) => (
            <div className="flex items-center gap-1 p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SignedOutLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};
export const SignedOutOnSignIn: Story = { args: { current: 'sign-in' } };
export const SignedOutOnSignUp: Story = { args: { current: 'sign-up' } };

const sections = [
    { key: 'organizations', href: '/find' },
    { key: 'dictionary', href: '/dictionary' },
] as const;

/** The site's sections, as visitors see them. */
export const Sections: Story = {
    render: () => <NavLinks links={[...sections]} />,
};
/** Signed in, Dashboard joins at the end. */
export const SectionsSignedIn: Story = {
    render: () => (
        <NavLinks
            links={[...sections, { key: 'dashboard', href: '/dashboard' }]}
        />
    ),
};
/** On an organization's page: Organizations is marked as the current section (`aria-current="true"`). */
export const SectionsInsideOrganizations: Story = {
    render: () => (
        <NavLinks
            links={[
                { ...sections[0], current: 'true' },
                sections[1],
                { key: 'dashboard', href: '/dashboard' },
            ]}
        />
    ),
};
/** On /dictionary itself (`aria-current="page"`). */
export const SectionsOnDictionary: Story = {
    render: () => (
        <NavLinks links={[sections[0], { ...sections[1], current: 'page' }]} />
    ),
};
/** While the session is checked (resize to see the phone placeholder). */
export const Loading: Story = { render: () => <HeaderLinksPlaceholder /> };
