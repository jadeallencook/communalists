import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { GraphicOrganizationResult } from '@/app/actions/graphics';
import {
    FillFromOrganization,
    GraphicEditor,
} from '@/components/organisms/graphic-editor';
import { GRAPHIC_COPIES } from '@/components/organisms/graphic-fixtures';
import { GraphicPreview } from '@/components/organisms/graphic-preview';
import { GraphicsPage } from '@/components/pages/graphics-page';

import { useCopyLink } from './use-copy-link';
import { useGraphicEditor } from './use-graphic-editor';

const fills = (): Promise<GraphicOrganizationResult> =>
    new Promise((resolve) =>
        setTimeout(
            () =>
                resolve({
                    ok: true,
                    organization: {
                        name: 'South Bay Mutual Aid',
                        link: 'https://communalists.com/organization/sbma',
                        place: '1 Market St, San José',
                    },
                }),
            400
        )
    );
const fails = (): Promise<GraphicOrganizationResult> =>
    Promise.resolve({ ok: false });

function Demo({ fillFails }: { fillFails: boolean }) {
    const editor = useGraphicEditor({
        copies: GRAPHIC_COPIES,
        locale: 'en',
        fillAction: fillFails ? fails : fills,
    });
    const copyAlt = useCopyLink(editor.alt);
    return (
        <GraphicsPage
            editor={
                <GraphicEditor
                    {...editor}
                    fillSlot={
                        <FillFromOrganization
                            organizations={[
                                {
                                    handle: 'sbma',
                                    name: 'South Bay Mutual Aid',
                                },
                            ]}
                            fill={editor.fill}
                            filling={editor.filling}
                            error={editor.error === 'fill'}
                        />
                    }
                />
            }
            preview={
                <GraphicPreview
                    {...editor}
                    copyStatus={copyAlt.status}
                    onCopyAlt={copyAlt.onCopy}
                />
            }
        />
    );
}

const meta = {
    title: 'Hooks/useGraphicEditor',
    component: Demo,
    args: { fillFails: false },
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The whole graphics editor working in the browser: type, pick a template, size, layout, colours or language, add a photo, and Save. "Fill in" is faked here (no logo). Nothing is uploaded; the PNG is made on the device.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Works: Story = {};
export const FillFails: Story = { args: { fillFails: true } };
