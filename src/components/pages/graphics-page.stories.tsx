import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    FillFromOrganization,
    GraphicEditor,
} from '@/components/organisms/graphic-editor';
import {
    drawSample,
    SAMPLE_ALT,
    SAMPLE_CONTENT,
} from '@/components/organisms/graphic-fixtures';
import { GraphicPreview } from '@/components/organisms/graphic-preview';

import { GraphicsPage } from './graphics-page';

const meta = {
    title: 'Pages/GraphicsPage',
    component: GraphicsPage,
    args: {
        editor: (
            <GraphicEditor
                step="words"
                setStep={fn()}
                thumbnails={{ templates: {}, layouts: {} }}
                layoutChoices={{ suggested: ['stripe'], rest: [] }}
                paletteChoices={{ suggested: ['rose'], rest: [] }}
                switchToPhotoLayout={fn()}
                aspect={1}
                ready
                save={fn()}
                template="free-store"
                setTemplate={fn()}
                format="square"
                setFormat={fn()}
                layout="stripe"
                setLayout={fn()}
                palette="rose"
                setPalette={fn()}
                graphicLocale="en"
                setGraphicLocale={fn()}
                content={SAMPLE_CONTENT}
                setField={fn()}
                linkInvalid={false}
                hasPhoto={false}
                pickPhoto={fn()}
                removePhoto={fn()}
                photoFocus="center"
                setPhotoFocus={fn()}
                hasLogo={false}
                pickLogo={fn()}
                removeLogo={fn()}
                fillSlot={
                    <FillFromOrganization signInHref="/sign-in?next=%2Fgraphics" />
                }
            />
        ),
        preview: (
            <GraphicPreview
                canvasRef={drawSample()}
                aspect={1}
                ready
                overflow={[]}
                alt={SAMPLE_ALT}
                save={fn()}
                copyStatus="idle"
                onCopyAlt={fn()}
            />
        ),
    },
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '/graphics, "Make some propaganda": the editor on the left and a sticky preview on the right (stacked on phones, with a link down to the preview). The route fills both from useGraphicEditor; see Hooks/useGraphicEditor to try it.',
            },
        },
    },
} satisfies Meta<typeof GraphicsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};
