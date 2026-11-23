# 06 · Home Page and FAQ

The landing page at `/`. It explains the platform and sends visitors to create an account, or signed-in visitors back to their dashboard.

## Current (rebuild)

`src/components/pages/home-page.tsx`, rendered by `src/app/[locale]/page.tsx`. All copy is in `messages/*.json` under `Home`.

1. **Hero:** photo banner with the title and subtitle. Signed out: **Create account** (→ `/sign-up`) and **Sign in** (→ `/sign-in`). Signed in: a single **Go to dashboard** button in their place.
2. **Built for mutual aid:** platform intro, supported languages, and a grid of tools (organizations, requests, library, calendars and documents), with an "early development" note.
3. **Join band:** "Ready to organize?" with **Create account**, or **Go to dashboard** when signed in.

**Dashboard link:** there is no `/dashboard` route yet, so "Go to dashboard" points at `/welcome`, the signed-in landing page. When a real dashboard ships, change the link in `HomePage` (decision #20).

**Signed-in check:** the route reads the session cookie with `getSessionUser()` inside `<Suspense>`. The rest of the page stays prerendered (a partial prerender). While the check runs, the fallback renders the page with the buttons kept in place but invisible and inert. A signed-in visitor never sees "Create account" flash, and the layout doesn't shift. It only checks for a session, not for finished setup: `/welcome` sends incomplete accounts on to setup itself.

## Prototype

### Sections (top to bottom)

1. **Hero** (`Shared/Header` with a `network.png` background): "Welcome To Communalists", the tagline "We give communities the tools they need to empower themselves through mutual aid", and two buttons: **Make A Request** (→ `/request-aid`) and **Become A Volunteer** (→ `/sign-up`).
2. **Building Stronger Communities**: the mission paragraph.
3. **From Surplus to Support**: the redistribution pitch (restaurants with surplus food, people with furniture they no longer need). This framing explains why the [donations](04-donations.md) feature exists.
4. **Frequently Asked Questions**: an accordion with 4 questions:
   - What is mutual aid?
   - How does it work? (sign up, join or create organizations, track tasks, fulfill requests)
   - Is it free to join? (yes)
   - How can I get involved?
5. **Events Today In San Jose**: the [events list](03-events-directory.md) for today, without filters.

### Notes

- All home page and FAQ copy is hard-coded English in `src/pages/HomePage.tsx` and `src/components/Home/FAQ/index.tsx`, so the language switcher doesn't affect it.
- The FAQ promises things the app doesn't do: users can't **create** organizations from the UI (`add-organization.ts` exists but nothing calls it), and there is no task tracking or resource management.
- The page `<title>` is "Communalists | Building Stronger Communities Together". There is no meta description or Open Graph image.
- The site footer (on every page) is translated and reads: "Developed by Volunteers · San Francisco Bay Area · Established 2022 · Open Source", linking to the GitHub repo.

### Carried into the rebuild

The plan was to prerender the page, move the copy into translations, add meta and OG tags, and make the FAQ match what the product does. The copy is translated and the page is prerendered apart from the session check. There's no FAQ yet. When one is added, keep it to what the product actually does.
