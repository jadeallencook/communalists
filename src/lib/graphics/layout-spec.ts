// What a layout is: a small description the engine (layout.ts) turns into
// shapes for any size. Layouts live in ./layouts/, one file each; adding one
// is a new file, an entry in ./layouts/index.ts and its name in the messages
// files. The tests check every layout at every size automatically.
// How-to: .claude/skills/add-graphic-layout/SKILL.md (decision #76).

import type { Palette } from './palettes';

export type ColorRole = keyof Palette;

/** The words a graphic can show, in reading order. */
export type TextRole =
    'tagline' | 'title' | 'when' | 'place' | 'details' | 'host' | 'link';

/** Roughly what shape the graphic is: square posts, tall posts and print, stories. */
export type Shape = 'square' | 'tall' | 'story';

/** A number, or one per shape (with `default` for the rest). */
export type ByShape =
    number | ({ default: number } & Partial<Record<Shape, number>>);

export interface TextBlockSpec {
    role: Exclude<TextRole, 'host' | 'link'>;
    color: ColorRole;
    /** A full-width band of this colour behind the text. */
    band?: ColorRole;
    align?: 'left' | 'center';
    /** Bigger (>1) or smaller (<1) than the usual sizes for this text. */
    scale?: number;
}

/** A short line between blocks. `width` is a share of the column (default 0.22). */
export interface RuleSpec {
    rule: ColorRole;
    width?: number;
    align?: 'left' | 'center';
}

export type BlockSpec = TextBlockSpec | RuleSpec;

/**
 * A full-width horizontal band. Regions stack from the top of the page to
 * the footer. Each holds the photo or words, not both (text never sits on a
 * photo, so it's always readable).
 */
export interface RegionSpec {
    /** Share of the height above the footer. One region may be `'rest'`. */
    height: ByShape | 'rest';
    /** Its background. Without one, the page's background shows. */
    fill?: ColorRole;
    /** This region shows the photo, cropped to fill it. */
    photo?: boolean;
    /** With a photo: the smallest share it shrinks to when the words need room. */
    minHeight?: number;
    /** Blocks stacked down from the top. */
    start?: BlockSpec[];
    /** Blocks stacked up from the bottom. */
    end?: BlockSpec[];
    /** Blocks stacked in the middle (instead of start and end). */
    center?: BlockSpec[];
}

/** A shape drawn under the words. Positions are shares of the page's width and height. */
export type DecorationSpec =
    | {
          kind: 'rect' | 'circle';
          x: number;
          y: number;
          w: number;
          h: number;
          color: ColorRole;
      }
    /** A border around the page, `inset` and `thickness` as shares of the width. */
    | { kind: 'frame'; inset: number; thickness: number; color: ColorRole };

export type LayoutGroup = 'type' | 'photo';

export interface LayoutSpec {
    /** How the picker groups it: words only, or with a photo. */
    group: LayoutGroup;
    /** The page's background colour (default `background`). */
    background?: ColorRole;
    /** With a photo (if a region has `photo`) or always. */
    regions: RegionSpec[];
    /** Required when a region has `photo`: used when there's no photo. */
    withoutPhoto?: RegionSpec[];
    decorations?: DecorationSpec[];
    /** "Hosted by", logo and QR code at the bottom. */
    footer?: {
        /** A full-width band behind it. */
        fill?: ColorRole;
        /** Colour of its words (default `text`). */
        color?: ColorRole;
    };
    /** Space around the edges, as a share of the width (default 0.075). */
    margin?: number;
}

export const isRule = (block: BlockSpec): block is RuleSpec => 'rule' in block;

/** Whether the layout can show a photo. */
export const usesPhoto = (spec: LayoutSpec) =>
    spec.regions.some((region) => region.photo);
