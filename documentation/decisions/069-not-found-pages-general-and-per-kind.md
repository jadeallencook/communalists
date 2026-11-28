# 069 · Not-found pages: one general, one per kind of shared page

**Date:** 2026-11-27
**Status:** Accepted
**Context:** Every 404 was Next's default page: unstyled, in English, with no way back. The user asked for a general 404 and specific ones for addresses people share, like `/en/organization/unknown` and `/en/dictionary/unknown`.
**Decision:**

- **General** (`src/app/[locale]/not-found.tsx`): "We couldn't find that page", the address tried (so a typo is easy to spot), and links to the homepage, Organizations and the Dictionary. A catch-all route (`[locale]/[...rest]`) sends any unmatched address under a language there, so it gets the site's header, footer and language.
- **A word** (`dictionary/[entry]/not-found.tsx`): "There's no word “mutal-aid” in the dictionary yet", **Did you mean** with close words (`closestWords`: words the address starts or is part of, then near spellings, accents ignored), and Browse the dictionary.
- **An organization** (`organization/[handle]/not-found.tsx`): names the address, and says organizations can change their address (an old one stops working after 30 days, with no redirect) or be taken down. It offers Find organizations and Start an organization. Its pages (edit, members, claim) land here too.
- **A person** (`comrade/[username]/not-found.tsx`): the same for profiles, added because profile links are shared too. It never hints whether the username was ever used.
- All in four languages, `noindex`, with a page title per kind set from the page's own metadata.
- **Missing isn't failing** ([decision #68](068-firebase-failures-show-an-error-never-break-the-app.md)): a database error shows the error page, never a 404.

**Alternatives:** one page for everything (simpler, but loses the reason and the right next step); redirecting unknown words to the dictionary or search (hides the mistake, and a shared link would silently change meaning); suggestions for organizations (would need a search by handle, and could point people to the wrong group).
**Consequences:** The word, organization and profile pages look up their data inside `<Suspense>`, so by the time they know it's missing the response has started: they answer **200 with `noindex`**, not 404. Only the catch-all answers 404. A true 404 would mean checking before streaming, which these pages can't do without giving up streaming. Revisit if search engines report them as soft 404s. In development, the catch-all shows a "Could not validate `instant`" notice (Next's navigation check can't validate a page that's always not found); the build is unaffected. Docs: [features/13](../features/13-navigation-and-layout.md), [features/16](../features/16-organizations.md), [features/17](../features/17-profiles.md), [features/19](../features/19-dictionary.md), [seo](../technical/seo.md).
