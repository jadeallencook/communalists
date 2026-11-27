import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { getAdminDb } from '@/lib/firebase/admin';
import { logRead } from '@/lib/firebase/read-log';

import {
    changedFields,
    cleanRelated,
    readDefinition,
    type Definition,
    type DefinitionInput,
} from './index';

// The dictionary in Firestore (design: documentation/features/19-dictionary.md).
//
//   definitions/{slug}   one word: its text in every language, related
//                        slugs, resources, created and updated info
//
// Admin SDK only; rules deny clients. Only super users write, and every
// write goes in adminLog.

const db = () => getAdminDb();
const definitions = () => db().collection('definitions');
const millis = (value: unknown) =>
    value && typeof (value as { toMillis?: unknown }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : undefined;

/** Every word (the index, the admin list, related words). */
export const DEFINITIONS_TAG = 'definitions';
/** One word's page. */
export const definitionTag = (slug: string) => `definition:${slug}`;

function toDefinition(
    snapshot: FirebaseFirestore.DocumentSnapshot
): Definition | null {
    if (!snapshot.exists) return null;
    const data = snapshot.data()!;
    return readDefinition(snapshot.id, data, {
        createdAt: millis(data.createdAt),
        updatedAt: millis(data.updatedAt),
    });
}

/**
 * Every word, cached. The glossary is small (dozens of words), so one read
 * of the collection serves the index, the admin list and related links.
 */
export async function getDefinitions(): Promise<Definition[]> {
    'use cache';
    cacheTag(DEFINITIONS_TAG);
    cacheLife('days');
    const snapshot = await definitions().get();
    logRead('definitions', Math.max(snapshot.size, 1));
    return snapshot.docs.flatMap((doc) => toDefinition(doc) ?? []);
}

async function readOne(slug: string): Promise<Definition | null> {
    logRead('definitions');
    return toDefinition(await definitions().doc(slug).get());
}

/** One word, cached. */
export async function getDefinition(slug: string): Promise<Definition | null> {
    'use cache';
    cacheTag(definitionTag(slug));
    cacheLife('days');
    return readOne(slug);
}

/** One word, straight from Firestore (to confirm a cached miss). */
export const getDefinitionFresh = cache(readOne);

export type SaveDefinitionResult =
    | { ok: true; fields: string[] }
    | { ok: false; error: 'slugTaken' | 'notFound' };

/**
 * A super user adds a word (`mode: 'create'`) or edits one. Checked on fresh
 * data in one transaction: a new slug must be free, an edited word must
 * exist. Related slugs that aren't words are dropped. Editing keeps the
 * resources and when it was created. Each save goes in adminLog.
 */
export async function saveDefinition(
    adminUid: string,
    mode: 'create' | 'edit',
    input: DefinitionInput
): Promise<SaveDefinitionResult> {
    const ref = definitions().doc(input.slug);
    return db().runTransaction(async (tx) => {
        const [existing, all] = await Promise.all([
            tx.get(ref),
            tx.get(definitions().select()),
        ]);
        logRead('definitions', 1 + Math.max(all.size, 1));
        if (mode === 'create' && existing.exists)
            return { ok: false, error: 'slugTaken' } as const;
        if (mode === 'edit' && !existing.exists)
            return { ok: false, error: 'notFound' } as const;

        const related = cleanRelated(
            input.slug,
            input.related,
            new Set(all.docs.map((doc) => doc.id))
        );
        const now = FieldValue.serverTimestamp();
        const before = toDefinition(existing);
        const fields = before
            ? changedFields(before, { ...input, related })
            : [];
        if (mode === 'edit' && fields.length === 0)
            return { ok: true, fields } as const; // nothing to save or log

        const text = JSON.parse(JSON.stringify(input.text));
        if (mode === 'create') {
            tx.create(ref, {
                slug: input.slug,
                text,
                related,
                resources: [],
                createdBy: adminUid,
                createdAt: now,
                updatedBy: adminUid,
                updatedAt: now,
            });
        } else {
            tx.update(ref, {
                text,
                related,
                updatedBy: adminUid,
                updatedAt: now,
            });
        }
        tx.create(db().collection('adminLog').doc(), {
            action: mode === 'create' ? 'createDefinition' : 'editDefinition',
            definition: { slug: input.slug, word: input.text.en.word },
            actorUid: adminUid,
            ...(fields.length ? { fields } : {}),
            createdAt: now,
        });
        return { ok: true, fields } as const;
    });
}

export interface ImportDefinitionsResult {
    added: string[];
    /** Already in the dictionary by the time they were added. */
    skipped: string[];
}

/**
 * A super user adds the ready rows of a reviewed CSV. Words that already
 * exist are skipped, never overwritten. Related slugs may point to other
 * words in the same file. One batch (at most 200 words, two writes each), so
 * either every word is added or none is; each gets its own adminLog entry.
 */
export async function importDefinitions(
    adminUid: string,
    inputs: readonly DefinitionInput[]
): Promise<ImportDefinitionsResult> {
    const existing = await getDefinitionSlugsFresh();
    const fresh = inputs.filter((input) => !existing.has(input.slug));
    const known = new Set([...existing, ...fresh.map((input) => input.slug)]);
    const now = FieldValue.serverTimestamp();
    const batch = db().batch();
    for (const input of fresh) {
        // create() fails the whole batch if someone added the word meanwhile.
        batch.create(definitions().doc(input.slug), {
            slug: input.slug,
            text: JSON.parse(JSON.stringify(input.text)),
            related: cleanRelated(input.slug, input.related, known),
            resources: [],
            createdBy: adminUid,
            createdAt: now,
            updatedBy: adminUid,
            updatedAt: now,
        });
        batch.create(db().collection('adminLog').doc(), {
            action: 'createDefinition',
            definition: { slug: input.slug, word: input.text.en.word },
            actorUid: adminUid,
            createdAt: now,
        });
    }
    if (fresh.length) await batch.commit();
    return {
        added: fresh.map((input) => input.slug),
        skipped: inputs
            .filter((input) => existing.has(input.slug))
            .map((input) => input.slug),
    };
}

/** Every slug, straight from Firestore (the import's check). */
export async function getDefinitionSlugsFresh(): Promise<Set<string>> {
    const all = await definitions().select().get();
    logRead('definitions', Math.max(all.size, 1));
    return new Set(all.docs.map((doc) => doc.id));
}
