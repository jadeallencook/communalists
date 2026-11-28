import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentType } from 'react';

import {
    EMPTY_CONTENT,
    FORMAT_KEYS,
    LAYOUT_KEYS,
    PALETTE_KEYS,
    type GraphicContent,
    type PaletteKey,
} from '@/lib/graphics';

import { GraphicGallery, type GraphicGalleryProps } from './graphic-gallery';
import { SAMPLE_CONTENT, sampleGraphic } from './graphic-fixtures';

// Every layout × size, drawn by the real engine. Change the palette and the
// content in Controls to stress a new layout (long text, Chinese, nothing).

const CONTENT: Record<string, GraphicContent> = {
    full: SAMPLE_CONTENT,
    minimal: { ...EMPTY_CONTENT, title: 'Free Store' },
    long: {
        ...SAMPLE_CONTENT,
        title: 'Community Clothing Swap and Free Store',
        tagline:
            'Bring what you do not wear any more and take home something you love.',
        place: 'Mexican Heritage Plaza, 1700 Alum Rock Avenue, San José, California',
        details: 'All sizes and styles welcome. Leftovers are donated. '.repeat(
            4
        ),
        host: 'Alum Rock Tenants Union and South Bay Mutual Aid',
    },
    chinese: {
        ...SAMPLE_CONTENT,
        title: '免费商店',
        tagline: '需要什么就拿什么，能留什么就留什么。',
        place: '圣荷西圣詹姆斯公园',
        details: '衣服、书、厨房用品等等。全部免费。',
        host: '南湾互助会',
    },
};

interface Args {
    palette: PaletteKey;
    content: keyof typeof CONTENT;
}

type GalleryArgs = GraphicGalleryProps & Args;

const meta: Meta<GalleryArgs> = {
    title: 'Components/Organisms/GraphicGallery',
    component: GraphicGallery as ComponentType<GalleryArgs>,
    args: { rows: [], palette: 'rose', content: 'full' },
    argTypes: {
        palette: { control: 'select', options: PALETTE_KEYS },
        content: { control: 'select', options: Object.keys(CONTENT) },
    },
    loaders: [
        async ({ args }) => {
            const { palette = 'rose', content = 'full' } =
                args as unknown as Args;
            const rows = [];
            for (const layout of LAYOUT_KEYS) {
                const images = [];
                for (const format of FORMAT_KEYS)
                    images.push({
                        label: format,
                        image: await sampleGraphic(
                            format,
                            layout,
                            palette,
                            CONTENT[content]
                        ),
                    });
                rows.push({ label: layout, images });
            }
            return { rows };
        },
    ],
    render: (_, { loaded }) => (
        <GraphicGallery
            rows={loaded.rows as Parameters<typeof GraphicGallery>[0]['rows']}
        />
    ),
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Every graphics layout at every size, drawn by the real engine (src/lib/graphics). Use it to check a new layout: switch the palette and the content (full, minimal, long, Chinese) in Controls. How to add a layout: .claude/skills/add-graphic-layout.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<GalleryArgs>;

export const AllLayouts: Story = {};
export const LongText: Story = {
    args: { palette: 'night', content: 'long' },
};
export const Chinese: Story = {
    args: { palette: 'garden', content: 'chinese' },
};
export const Minimal: Story = {
    args: { palette: 'paper', content: 'minimal' },
};
