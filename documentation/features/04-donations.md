# 04 · Donations

The flip side of aid requests: someone offers goods (for example surplus restaurant food or furniture) and volunteers arrange pickup. **The public form is live, but the dashboard side is disabled**, so donations are written to Firestore and nobody can see them in the app.

## Public form (`/donate`)

It reuses the request form's layout and shared snippets:

| Field | Notes |
|---|---|
| `name`, `email` (required), `phone` (auto-formatted) | |
| `language` | Defaults to the UI language |
| `location` | Default `santa-clara-ca` |
| `method` | email / phone / text |
| `body` | Textarea describing the donation |

It also sets `stage: 'submitted'`, `timestamp`, `driver: ''`, `coordinator: ''` and `hasDriver: false`, then writes to the Firestore `donations` collection.

## Dashboard side (built, then hidden)

- `src/pages/Dashboard/DonationsPage.tsx`, `DonationsTable`, `DonationModal` and `ViewDonationForm` mirror the request triage UI: a table, filters, a modal with Information / Communication / Coordination sections, driver and coordinator assignment, and comments.
- The `donations` entry is commented out of the dashboard routes (`src/pages/DashboardPage.tsx`) and of `types/dashboard-route-link.ts`.
- `DashboardContext.updateStage(id, stage, isDonation)` has a `// TODO` for donations. `ViewDonationForm` calls `updateRequestStage`, which writes to the **`requests`** collection using a donation ID. That's a bug: saving a donation's stage would fail or hit the wrong document.
- The donation modal's `CopyLinkButton` and `Comments` are copy-pasted duplicates of the request versions.

## Bugs

- **The donation description is never saved.** The textarea has `name="donation"` but `value={body}`. Formik updates `values.donation`, `body` stays `''`, and the controlled textarea won't take input. Every donation saved has an empty `body`.
- The same copy-paste bugs as the request form: `timestamp` is set when the form mounts, there is no Yup validation, and there is no spam protection.

## In the rebuild

Model requests and donations as **one "case" entity with a `type` field** (`request` | `offer`). Then they share one pipeline, table, detail view, assignment logic and comments, instead of two copies drifting apart. Decide whether donations need their own stages: "Received → Pickup scheduled → Delivered" reads better than the request labels.
