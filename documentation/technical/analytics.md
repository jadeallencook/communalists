# Analytics

We use **[Umami Cloud](https://umami.is)** (decision [#50](../decisions/050-umami-analytics-page-views-and-named-click-events.md)) to see which pages and organizations people visit, which cities they search, and which buttons they press. Umami sets no cookies and stores no personal data. It counts visitors with a hash that changes daily.

## What runs where

| Piece                                                 | What it does                                                                                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/analytics/index.ts` (pure, tested)           | The event list (`AnalyticsEvents`), `track()` attributes for clickable elements, and `sanitizeAnalyticsPayload` (what may leave the browser) |
| `src/lib/analytics/browser.ts`                        | `sendEvent`: hands an event to `window.umami`, queues it until the tracker loads, logs it to the console in dev                              |
| `src/app/[locale]/analytics.tsx` (in the root layout) | Listens for clicks on tracked elements. On production only, loads Umami's script with the before-send hook                                   |
| `src/app/[locale]/track-event.tsx`                    | `<TrackEvent>`: sends an event when a page renders (`org-view`, `find-search`)                                                               |

- **Production only.** The script loads only when `VERCEL_ENV === 'production'`, and `data-domains="communalists.com"` blocks sends from any other hostname. Local dev and previews send nothing. In dev, each event is printed to the browser console as `[analytics] name {data}`, so you can check new events without an Umami account.
- **Do Not Track is respected** (`data-do-not-track`). Browsers that send it are not counted at all.
- **Website id:** `UMAMI_WEBSITE_ID` in `src/lib/analytics/index.ts`. It's public (it's in the page source), so it's a constant, not an env var. Reports are at cloud.umami.is under the project owner's account.

## Page views

Umami counts a page view on each load and each client-side navigation (it wraps `history.pushState`/`replaceState`). Before anything is sent, `sanitizeAnalyticsPayload` runs on every page view and event:

- **Never sent:** `/auth/action` (email links carry one-time codes) and `/admin` (super-user tools), with or without a locale prefix. Look-alikes such as `/org/admin-collective` are still counted.
- **Query strings are an allowlist.** Only `/find`'s filters (`radius`, `focusAreas`, `languages`, `reach`) are kept. Everything else is dropped, including `?next=` and any parameter added later. To report a new parameter, add it to `KEPT_QUERY_PARAMETERS` and make sure it can't hold personal data.
- **No `#hash`**, and other sites' referrers are cut to their address without the query (`https://www.google.com/search`).

The city searched on `/find` is in the path (`/find/us/ca/oakland`, decision [#49](../decisions/049-readable-find-urls-city-in-the-path.md)), so the Pages report shows searched cities directly. Each filter change replaces the URL, so it also counts as a page view.

## Events

Events are named with stable kebab-case keys, never UI text, so reports read the same in all four languages and survive copy changes. `org` is always the organization's **handle**.

| Event                              | Data                                                 | When                                                                         |
| ---------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `org-view`                         | `org`                                                | An organization's page opens (any language)                                  |
| `org-open`                         | `org`, `from` (`find`, `card`)                       | An organization's name is clicked in `/find` results or a card               |
| `org-details`                      | `org`                                                | A `/find` result is expanded                                                 |
| `org-website`                      | `org`, `url`                                         | The website link (page or `/find` result)                                    |
| `org-social`                       | `org`, `platform`                                    | A social link                                                                |
| `org-phone`, `org-email`           | `org`                                                | The phone or email link (the number and address are not sent)                |
| `org-directions`                   | `org`, `provider`                                    | Apple Maps, Google Maps or OpenStreetMap in the directions menu              |
| `org-join`                         | `org`, `policy` (`open`, `request`)                  | Join or Ask to join pressed                                                  |
| `org-join-sign-in`                 | `org`                                                | Signed out, "Sign in to join" pressed                                        |
| `org-cancel-request`, `org-leave`  | `org`                                                | Cancel a request; confirm leaving                                            |
| `org-claim`, `org-claim-submit`    | `org`                                                | "Claim" on an unclaimed group; the claim form sent                           |
| `find-search`                      | `city`, `radius`, `focusAreas`, `languages`, `reach` | Each `/find` search shown. `city` is the path, e.g. `us/ca/oakland`          |
| `browse-organizations`             | `from` (`hero`, `dashboard`, `nearby`)               | A link to `/find`                                                            |
| `create-organization`              | `from` (`dashboard`, `find`)                         | A link to `/org/new`                                                         |
| `create-organization-submit`       | none                                                 | The create form sent (not the edit form)                                     |
| `sign-up`, `sign-in`               | `from`                                               | Header or homepage links                                                     |
| `sign-up-submit`, `sign-in-submit` | none                                                 | The forms sent                                                               |
| `language-change`                  | `to`                                                 | A different language picked in the switcher                                  |
| `definition-view`                  | `slug`                                               | A dictionary word's page opens ([features/19](../features/19-dictionary.md)) |
| `definition-share`                 | `slug`                                               | Copy link pressed on a word's page                                           |
| `definition-open`                  | `slug`                                               | A marked word in our copy chosen, opening its page                           |

**Clicks are attempts, not outcomes.** A `*-submit` or `org-join` event means the button was pressed. The form may still fail validation or the server may refuse. Count real outcomes (members, organizations) from Firestore.

**Profile cities reach Umami.** Since [decision #52](../decisions/052-find-always-has-a-city-profile-or-default.md), plain `/find` redirects a signed-in visitor to their profile's city, so that city is in the page view and the `find-search` event. It's a general area (a city, never an address), and Umami can't link it to an account. It used to be sent as `"profile"`.

## Adding an event

1. Add it to `AnalyticsEvents` in `src/lib/analytics/index.ts`, with its data. Never personal data: no names, emails, phone numbers, addresses or typed text. Handles, slugs, enum keys and public URLs are fine.
2. **A click:** spread `track('event', { … })` onto the link or button. This is the one analytics call presentational components make: it only adds `data-analytics-*` attributes, and the listener in the layout does the sending. Keyboard activation fires the same click. **On render:** put `<TrackEvent event=… data=… />` in the route's container.
3. Add a row to the table above.

Don't use Umami's own `data-umami-event` attributes. On a link, Umami cancels the click and sets `location.href` after sending, which turns a client-side `<Link>` navigation into a full page load.

## Gotchas

- In dev, React Strict Mode runs effects twice, so each `<TrackEvent>` logs twice. Production sends once.
- Umami reads the before-send hook (`window.communalistsBeforeSend`) by name on every send, checked against `cloud.umami.is/script.js` on 2026-11-26. The hook is set when `analytics.tsx` loads, before the script can run.
- Unlisted organizations' pages are counted like any other. The reports are private to the project, but treat handles in reports as you would the pages themselves.
