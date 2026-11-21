# 12 · Account Settings

`/dashboard/settings` lets a volunteer change one thing: their **display name**.

## Behavior

- An input pre-filled from `displayNames[uid]`, with a **Save Changes** button.
- Save writes `displayNames/{uid}` in Realtime Database and updates the local `displayNames` map, so the new name shows across the dashboard right away.

## Why display names live in Realtime Database

Showing names for coordinators, drivers, members and comment authors originally meant one Firestore read per person. Commit `d153141` (Jun 2023) moved them into a flat `displayNames: { [uid]: name }` map in RTDB, fetched **once** when the dashboard loads. RTDB bills by bandwidth rather than per document, which suits a small map read all at once.

Downsides:
- Every signed-in user downloads every volunteer's name. That's fine for a few hundred volunteers but doesn't scale, and it exposes the full roster to any account.
- Names now live in two places (RTDB, plus the old `accounts.name` that comments still read). See [11](11-comment-threads.md).

## Not built

- Change email or password (beyond forgot-password), location (collected at sign-up but never editable or shown), delete account, notification preferences, pronouns (`types/pronouns.ts` exists, unused), language preference.

## In the rebuild

A single `profiles` table or collection holding display name, location, preferred language and pronouns. Fetch names alongside the records that need them (a SQL join, or denormalize the assignee name onto the request).
