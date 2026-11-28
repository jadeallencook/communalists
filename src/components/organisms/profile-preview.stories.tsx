import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { profileView } from '@/lib/profiles';

import { samplePerson } from './profile-fixtures';
import { ProfilePreview, type PreviewAudience } from './profile-preview';

const none = new Set<string>();
const groupsOnly = {
    ...samplePerson,
    settings: { ...samplePerson.settings, visibility: 'groups' as const },
};
const views = (person: typeof samplePerson) => ({
    public: profileView(person, 'public', none),
    comrade: profileView(person, 'comrade', none),
    groupmate: profileView(person, 'groupmate', none),
    signedIn: profileView(person, 'signedIn', none),
});

function Demo({ person }: { person: typeof samplePerson }) {
    const [audience, setAudience] = useState<PreviewAudience>('public');
    return (
        <ProfilePreview
            views={views(person)}
            audience={audience}
            onAudienceChange={setAudience}
        />
    );
}

const meta = {
    title: 'Components/Organisms/Profile Preview',
    component: ProfilePreview,
    args: {
        views: views(samplePerson),
        audience: 'public',
        onAudienceChange: () => {},
    },
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ProfilePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Public profile: switch audiences to compare. */
export const PublicProfile: Story = {
    render: () => <Demo person={samplePerson} />,
};
/** "People in my groups": visitors and strangers see only the name. */
export const GroupsOnly: Story = { render: () => <Demo person={groupsOnly} /> };
