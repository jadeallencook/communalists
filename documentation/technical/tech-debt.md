# Bugs and Tech Debt

Everything found while reading the code. **Bugs** are things users would hit. **Debt** is what not to carry forward. The feature docs explain each one in context.

## Bugs (user-facing)

| #   | Bug                                                                             | Where                               | Feature                                                 |
| --- | ------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| 1   | Delivery filter always gives an empty table (compares `'assigned'` to a uid)    | `src/utils/filter-requests.ts`      | [09](../features/09-request-triage-dashboard.md)        |
| 2   | Donation description never saved (`name="donation"` vs `value={body}`)          | `src/forms/DonateForm`              | [04](../features/04-donations.md)                       |
| 3   | Saving a donation's stage writes to `requests/`                                 | `ViewDonationForm`                  | [04](../features/04-donations.md)                       |
| 4   | Comment authors show as "@comrade" (names read from `accounts`, stored in RTDB) | `src/api/get-usernames.ts`          | [11](../features/11-comment-threads.md)                 |
| 5   | Events show as open before :10 past the hour (`9:05` → `95`)                    | `EventsTable` `isAfterHours`        | [03](../features/03-events-directory.md)                |
| 6   | Confirm-password label is blank (missing snippet)                               | `src/snippets/sign-up-form.ts`      | [07](../features/07-authentication.md)                  |
| 7   | Request and donation timestamps set at form mount, not submit                   | request and donate forms            | [01](../features/01-request-aid-form.md)                |
| 8   | Account `joined` timestamps set at module load                                  | `objects/account-initial-values.ts` | [07](../features/07-authentication.md)                  |
| 9   | Unknown `/dashboard/:route` crashes                                             | `src/pages/DashboardPage.tsx`       | [09](../features/09-request-triage-dashboard.md)        |
| 10  | Missing `/view-request/:id` shows 404 **and** redirects to sign-up              | `src/pages/ViewRequestPage.tsx`     | [10](../features/10-request-detail-and-coordination.md) |
| 11  | Table Delivery badge stale after assigning a driver                             | `VolunteerForm` skips the cache     | [10](../features/10-request-detail-and-coordination.md) |
| 12  | New matching requests hidden until Refresh (cache-first fetch)                  | `DashboardContext`                  | [09](../features/09-request-triage-dashboard.md)        |
| 13  | Language resets to English on reload                                            | `SnippetContext`                    | [05](../features/05-localization.md)                    |
| 14  | Opening a request blanks the table behind it (global `isLoading`)               | `RequestModal`                      | [10](../features/10-request-detail-and-coordination.md) |
| 15  | Donation comments crash when no thread exists                                   | `ViewDonationForm/Comments`         | [11](../features/11-comment-threads.md)                 |
| 16  | Chinese header translates as "Welcome, communists"                              | `src/snippets/request-aid-form.ts`  | [05](../features/05-localization.md)                    |

## Security and privacy risks

- Security rules aren't in the repo, and every permission is enforced only in the UI. See [firebase.md](firebase.md).
- Any member can unassign anyone. Nothing checks who may change stages.
- Health info and addresses sit in plain fields, readable by every member of any organization.
- The whole display-name roster is sent to every signed-in user.
- The public request and donation writes have no spam or abuse protection.
- The "once every three months" request policy isn't enforced.
- Analytics loads without consent.

## Debt not to carry forward

- **Client-only SPA with `HashRouter`.** Bad for SEO, link previews and first paint. The `/#/` links are hard-coded.
- **Three state patterns** (context cache, React Query, local effects), plus one global `isLoading`.
- **One 880-line `DashboardContext`** with no-op methods (`fetchOrganization`, `fetchDonation`, `fetchDisplayNames`).
- **Copy-pasted request and donation stacks:** forms, tables, modals, `Comments` and `CopyLinkButton` exist twice.
- **Hard-coded content:** events data, home page, FAQ and success copy.
- Formik without validation (Yup installed but unused).
- Bootstrap CSS + styled-components + animate.css from a CDN + global `!important` overrides.
- Dead code: `uid-to-unique-number.ts` (it also collides: anagram UIDs give the same number), `organize-comments-by-time.ts`, `organize-applications-by-date.ts`, `get-badge-bg-for-stage.ts`, `get-unapproved-accounts.ts`, `get-volunteers.ts`, `get-donations.ts` (only the hidden page uses it), `add-organization.ts`, `EventsTable/components/Day.tsx`, `NotApprovedPage.tsx`, `components/Template`, `eye.svg`, `types/race|pronouns|country|us-state.ts`, `interfaces/roles.ts`.
- Config clutter: two commitlint configs, an ESLint config that's never run, a `@database` alias and `npm run mock` that point at nothing, and aliases defined in two places.
- Mixed domains: `communalists.com` vs `communalists.org`. Two GA measurement IDs.
- `api/*` returns errors as values (`.catch((e) => e)`) in some files and throws in others. Callers can't tell success from failure.
- No tests.
