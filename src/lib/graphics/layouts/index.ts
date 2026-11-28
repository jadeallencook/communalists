// Every layout, in the order the picker shows them within a group. Keys are
// permanent (analytics and file names use them); each needs a name under
// `Graphics.layout.options` in every messages file.

import type { LayoutSpec } from '../layout-spec';
import { block } from './block';
import { bold } from './bold';
import { centered } from './centered';
import { frame } from './frame';
import { photoBelow } from './photo-below';
import { reverse } from './reverse';
import { stripe } from './stripe';

export const LAYOUTS = {
    bold,
    stripe,
    centered,
    frame,
    reverse,
    block,
    'photo-below': photoBelow,
} satisfies Record<string, LayoutSpec>;

export type LayoutKey = keyof typeof LAYOUTS;
export const LAYOUT_KEYS = Object.keys(LAYOUTS) as LayoutKey[];

export const isLayoutKey = (value: string): value is LayoutKey =>
    Object.hasOwn(LAYOUTS, value);
