# 02 · Request Form Kill Switch

Moderators can pause the public aid request form from the dashboard, with no deploy needed. It was built in Aug 2023 because requests were arriving faster than volunteers could handle them.

## How it works

- One boolean, `requestFormStatus`, lives in Firebase **Realtime Database** (not Firestore). `true` means the form is live.
- `RequestFormStatusContext` reads it **once** at app load and exposes `{ requestFormStatus, hasFetchedRequestFormStatus }`.
- `/request-aid` shows a spinner until the value arrives. Then it shows either the form or the "paused" message.
- In the dashboard Requests tab, moderators see a checkbox and a badge (**Live** in red, **Offline** in dark) inside the search bar. Clicking it writes the flipped value, then refetches it with React Query.

## Who can toggle it

Only users who moderate at least one organization they belong to (`src/utils/is-user-moderator.ts`). This check happens **only in the UI**. Unless Realtime Database rules restrict writes to `requestFormStatus`, any signed-in user could flip it.

## Paused-state copy

The paused page explains that intake is paused because of limited volunteer capacity. It then recruits volunteers, with a mailto link to `support@communalists.org` ("Mutual Aid Volunteer Request"). This copy is English only and hard-coded in `src/pages/RequestAidPage.tsx`.

## Details to keep

- **Fail closed.** `getFormStatus` returns `false` when the key is missing, so the form stays hidden until someone turns it on. On a read error it returns `null`, which also hides the form.
- The value is read once per page load. A visitor who already has the page open keeps seeing the form after a moderator pauses it. That's fine for this use, but a real-time listener would be cheap.

## Source files

- `src/contexts/RequestFormStatusContext.tsx`
- `src/forms/FormStatusForm/index.tsx`
- `src/api/get-form-status.ts`, `src/api/update-form-status.ts`
- `src/pages/RequestAidPage.tsx`

## In the rebuild

This is a general feature flag. Consider a small `settings` document or a flags table, so the next toggle (for example "pause donations" or a banner message) doesn't need another one-off path. With SSR/SSG, read it on the server so the page doesn't flash a spinner first.
