# 13 · Navigation, Layout and Feedback

The shared shell around every page: top nav, mobile menu, footer, loading states and toasts.

## Top navigation

- A dark, sticky Bootstrap navbar. The brand mark (star logo, which rotates in on load) and the "Communalists" wordmark link to `/`.
- Links (translated): **Request** → `/request-aid`, **Donate** → `/donate`, **Events** → `/events`, then:
  - Signed out: **Log In** → `/sign-in`
  - Signed in: **Dashboard** → `/dashboard` and **Log Out**
- A language dropdown showing each language in its own script.
- The active link is highlighted by matching the path prefix.
- **Mobile:** below tablet width, a toggle opens an off-canvas drawer from the right with the same links. The drawer is rendered **outside** the `Navbar` on purpose. As a child, it made the page scroll sideways (see the comment in `src/components/Navigation/index.tsx`).

## Dashboard sub-navigation

- Pill tabs: **Overview**, **Requests** (members only), **Settings**. They map to `/dashboard/:route`, driven by a route table in `src/pages/DashboardPage.tsx` that has an `isRestricted` flag.
- Under every dashboard tab is a long footer paragraph asking for feedback, linking to `support@communalists.com`.

## Footer

Translated, four lines: "Developed by Volunteers / **San Francisco Bay Area** / Established 2022 / Open Source" (links to the GitHub repo).

## Feedback patterns

- **Loading:** a centered Bootstrap spinner (`components/Loading`). Forms swap their whole body for the spinner while submitting.
- **Toasts** (`react-hot-toast`, bottom center): sign-in success and error, sign-up errors, and **every** React Query error. That's set globally through `QueryClient` default `onError` plus `QueryCache` / `MutationCache` `onError`, which also logs to the console. In development, toasts stay up for about 16 minutes (`1000000` ms) so errors aren't missed. Each has a Dismiss button.
- **Console logger:** `log()` in `DashboardContext` prints `[communalists] …` with a red badge for every fetch. It was used to count Firestore reads per screen.
- **Animations:** animate.css from a CDN (`fadeIn`, `slideInDown`, `rotateIn`, `tada` on tooltip icons).
- **Tooltips:** an info-icon tooltip used on the request form "needs" field and for exact dates in modals.

## Uncommitted change on this branch

`src/components/Navigation/index.tsx` swaps the brand image from `logo.png` to a new `src/assets/star.svg` (not yet committed). If the star is the current mark, keep `star.svg` for the rebuild. Copy it out before deleting.

## In the rebuild

**Built (2026-11-22, decision #20):** the header is server-rendered with the account area streamed in `<Suspense>`, so there's no flash of the wrong links.

- **Signed out:** Sign in and Create account, always visible; the current page's link is marked active.
- **Signed in:** a Dashboard link, plus an account menu (initials → name, Account settings, Sign out). On phones, Dashboard and Create account fold away; Dashboard moves into the menu.
- **Active link:** marked with `aria-current` (Dashboard on the dashboard, Sign in / Create account on their pages).
- **Homepage banner:** a search instead of buttons (2026-11-26, [decision #53](../decisions/053-homepage-search-focus-area-and-city.md)), in one line along a translucent band at the bottom of the banner: **Connect with organizations**, a **City** picker and **Focus area** pills, opening `/find` with them applied. The pills may run past the header's right edge to the screen edge; everything else lines up with the header. There's no second button: **Go to your dashboard** repeated the header's Dashboard link, and Create account lives in the header and the closing band. Before that (2026-11-23): **Browse organizations**, then **Create account** or **Go to your dashboard**. Sign in lives in the header, as an outlined button. Signed in, the closing sign-up band is hidden.
- **Not built:** dashboard sub-navigation (the prototype's Overview / Requests / Settings tabs return with organizations); a full mobile drawer (not needed while the header has so few links).

The rest of this section is the original advice, kept for reference:

- Server-side auth so the nav renders the right links without a flash.
- CSS transitions instead of animate.css. Respect `prefers-reduced-motion`.
- Wire the dev-only console logger to real monitoring (Sentry or similar) in production.
