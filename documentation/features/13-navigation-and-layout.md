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

**Built (2026-11-22, decision #20; reworked 2026-11-27, [decision #61](../decisions/061-site-navigation-sections-and-phone-menu-drawer.md)):** the header is server-rendered with the session-dependent parts streamed in `<Suspense>`, so there's no flash of the wrong links.

- **Two levels.** The site header lists **platform sections**. Tools that belong to one organization (requests, lending library, calendars…) don't go in it: they'll get that organization's own navigation on its pages. This keeps the header small as tools are added.
- **One list.** The sections live in `src/lib/navigation.ts` (`NAV_ITEMS`: key, link, who sees it, which paths belong to it). Wide screens and the phone menu both draw from it. Adding a section is one entry plus a `Nav.<key>` label in all four messages files. Past about five, group the extras under "More" instead of widening the bar.
- **Sections today:** **Organizations** (`/find/organizations`; also marked on organization pages) and **Dictionary** for everyone, plus **Dashboard** at the end when signed in (last, so it only adds to the row when the session arrives). The exact page gets `aria-current="page"`, a page inside the section gets `aria-current="true"`. `/organization/new` marks nothing.
- **Wide screens (`lg` and up):** wordmark, sections, then language, theme and account. Signed out: Sign in (outlined) and Create account. Signed in: the account menu (initials → name and email, **your organizations** (up to 5, then "See all your organizations" to the dashboard), Your profile, Account settings, **Admin** for super users, Sign out).
- **Phones and narrow windows (below `lg`, including 200% zoom):** wordmark, language switcher, and a **Menu** button (icon and word) that opens a drawer from the right with everything else: Create account and Sign in when signed out; sections; your organizations; account links; a Light/Dark/System choice; Sign out. Links close the drawer. The language switcher stays outside the drawer on purpose: someone who can't read the current language has to be able to find it.
- **Your organizations** come from `getMemberships` (cached per user, cleared when they join, leave or an organization changes), so a signed-in page costs no extra read once it's cached. If the read fails, the menu goes without the list rather than breaking the page.
- **Homepage banner:** **Browse organizations** (to `/find/organizations`) as the main button, then **Create account** (outlined) when signed out or **Go to your dashboard** when signed in (2026-11-23). Signed in, the closing sign-up band is hidden.
- **Not found and errors** (2026-11-27, decisions [#68](../decisions/068-firebase-failures-show-an-error-never-break-the-app.md) and [#69](../decisions/069-not-found-pages-general-and-per-kind.md)). Both keep the header and footer, in the visitor's language:
  - **Not found:** an unknown address gets the general 404, with the address tried and links to Home, Organizations and the Dictionary. Words, organizations and profiles have their own, saying why it can happen and what to do next. A missing word suggests close words ("Did you mean: Mutual Aid").
  - **Errors:** a page that fails gets "Something went wrong" with Try again. If the layout itself fails, `global-error.tsx` says it in all four languages.
- **Not built:** an organization's own navigation (comes with its first tool); dashboard sub-navigation.

The rest of this section is the original advice, kept for reference:

- Server-side auth so the nav renders the right links without a flash.
- CSS transitions instead of animate.css. Respect `prefers-reduced-motion`.
- Wire the dev-only console logger to real monitoring (Sentry or similar) in production.
