import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import foodServe from '@/assets/food-serve.jpg';
import { Button } from '@/components/atoms/button';

import { PHOTO_CROP_VIEWPORT, usePhotoCrop } from './use-photo-crop';

function UsePhotoCropDemo() {
    const crop = usePhotoCrop();
    const [output, setOutput] = useState<string | null>(null);
    const loadSample = async () => {
        const blob = await (await fetch(foodServe.src)).blob();
        await crop.pick(new File([blob], 'sample.jpg', { type: 'image/jpeg' }));
    };
    const exportCrop = async () => {
        const file = await crop.toFile();
        if (file) setOutput(URL.createObjectURL(file));
    };
    const scale =
        crop.frame && crop.crop
            ? (PHOTO_CROP_VIEWPORT /
                  Math.min(crop.frame.width, crop.frame.height)) *
              crop.crop.zoom
            : 1;

    return (
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={loadSample}>
                        Load sample photo
                    </Button>
                    <label className="text-sm">
                        Or pick a file:{' '}
                        <input
                            type="file"
                            onChange={(e) => crop.pick(e.target.files?.[0])}
                        />
                    </label>
                </div>
                {crop.src && crop.frame && crop.crop && (
                    <div
                        {...crop.dragHandlers}
                        className="relative touch-none overflow-hidden rounded-lg bg-muted"
                        style={{
                            width: PHOTO_CROP_VIEWPORT,
                            height: PHOTO_CROP_VIEWPORT,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={crop.src}
                            alt=""
                            draggable={false}
                            className="absolute top-0 left-0 max-w-none"
                            style={{
                                width: crop.frame.width * scale,
                                height: crop.frame.height * scale,
                                transform: `translate(${crop.crop.x}px, ${crop.crop.y}px)`,
                            }}
                        />
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {(['left', 'up', 'down', 'right'] as const).map((d) => (
                        <Button
                            key={d}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => crop.move(d)}
                        >
                            {d}
                        </Button>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            crop.setZoom((crop.crop?.zoom ?? 1) + 0.5)
                        }
                    >
                        zoom +
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={exportCrop}
                    >
                        Export
                    </Button>
                </div>
                {output && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={output}
                        alt="Exported crop"
                        className="size-32 rounded-full"
                    />
                )}
            </div>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(
                    {
                        problem: crop.problem,
                        frame: crop.frame,
                        crop: crop.crop,
                    },
                    null,
                    2
                )}
            </pre>
        </div>
    );
}

const meta = {
    title: 'Hooks/usePhotoCrop',
    component: UsePhotoCropDemo,
} satisfies Meta<typeof UsePhotoCropDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Load the sample (or pick a file), drag it, zoom, and export the square. Pick a GIF or a tiny image to see the problems. */
export const Demo: Story = {};
