# Search and link previews (SEO)

How public pages describe themselves to search engines and to apps that preview links (iMessage, Facebook, Slack, Discord). Set up on 2026-11-27 ([decision #64](../decisions/064-seo-titles-share-image-sitemap-and-structured-data.md)).

## What every public page has

- **A title in Title Case (English only)**, ending "| Communalists" except on the home page. Spanish and Vietnamese capitalize only the first word, and Chinese has no capitals, as with dictionary words ([decision #56](../decisions/056-dictionary-words-title-case-in-english.md)). Names people wrote themselves (organization names, places) are never re-capitalized.
- **A description** under 160 characters. User-written text (an organization's description, a word's definition) is cut at a word with `snippet()` (`src/lib/seo.ts`).
- **A canonical URL and `hreflang` links** to the same page in all four languages, plus `x-default`: the address with no locale, which the proxy sends to the visitor's language.
- **The share image**: `src/assets/share-image.jpg`, the homepage photo cropped to 1200×630, with the banner's alt text in the page's language. It's the same on every page.
- **Keywords**: page-specific ones first, then the site's (`Metadata.keywords`). Google ignores the keywords tag, so the words people search for also need to be in the title and description, which is where ranking comes from.

All of this goes through `pageMetadata()` in `src/app/[locale]/page-metadata.ts`. **Next.js replaces a parent's `openGraph` and `twitter` objects instead of merging them**, so a page that sets `openGraph` by hand loses the share image. Use `pageMetadata()` for any new public page. The layout sets the same defaults for pages that only set a title (sign-in forms, private pages), and never sets a canonical, which children would inherit.

## Per page

| Page                                    | Title (English)                                   | Description                                         | Structured data                               |
| --------------------------------------- | ------------------------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `/`                                     | Communalists: Tools for Mutual Aid Networks       | `Metadata.description`                              | `WebSite` and `Organization`                  |
| `/find/organizations/{country}/{r}/{c}` | Mutual Aid Organizations Near Concord, California | `Find.metaDescriptionNear`                          | none                                          |
| `/organization/{handle}`                | {name} in {place}                                 | Its description, or `Organizations.metaDescription` | `Organization`, listed and active groups only |
| `/dictionary/{slug}`                    | {Word}: Meaning and Definition                    | The word's short definition                         | `DefinedTerm`                                 |
| `/dictionary/{letter}`                  | Mutual Aid Dictionary: M                          | `Dictionary.intro`                                  | none                                          |
| `/sign-up`, `/sign-in`                  | Create Account, Sign In                           | `metaDescription` in their namespace                | none                                          |

A search's canonical is the city's path alone: `?radius=` and other filters are the same page to a search engine, so they don't compete with it. Keyword strings use the city's name without its state (`{name}`), because a label's comma would split a keyword in two.

The organization's structured data names only its general area (`location.label`), its website and social links, and its founding year. It leaves out the street address, email and phone even though the page shows them, so nothing beyond what's needed is copied into another format.

## Kept out of search

- **Not found** ([decision #69](../decisions/069-not-found-pages-general-and-per-kind.md)): unmatched addresses answer **404**. Missing words, organizations and profiles show their own not-found pages but answer **200 with `noindex`** (they find out inside streamed content, after the status is sent). Each has a "… not found" title.
- **`noindex`**: profiles (`/comrade/…`, decision #31), unlisted or archived organizations, and every signed-in, admin, setup, password and organization-management page.
- **`robots.txt`** (`src/app/robots.ts`): production allows everything except `/api/`, `/*/account/`, `/*/admin`, `/*/dashboard` and `/*/auth/` (they redirect signed-out visitors anyway). **Previews and local builds disallow everything**, so a preview URL never competes with communalists.com.

## Sitemap

`/sitemap.xml` (`src/app/sitemap.ts`) lists each address once per language, each with its `hreflang` alternates:

- the home page and `/sign-up`
- every dictionary word (with its `updatedAt`) and every letter that has words in any language
- every **listed, active** organization (`getSitemapOrganizations()`, unclaimed ones included)
- the city search for each city where a listed **local** group is based. There are about 20,000 US cities, and an empty city page is thin content that can hurt the whole site, so we list only cities with groups. Other cities are still reachable by links.

It's read per request (`connection()`), never at build, because the build has no database credentials. The organization read is cached for a day under `DIRECTORY_TAG`, so it's cleared whenever the directory is, and it reads only the four fields a URL needs.

## Checking

- `curl -s localhost:3000/en | grep -E '<title>|og:|canonical|hrefLang|ld\+json'` shows a page's tags. `localhost:3000/sitemap.xml` shows the sitemap from the emulator's data.
- After deploying: Google's [Rich Results Test](https://search.google.com/test/rich-results) for structured data, the [Facebook sharing debugger](https://developers.facebook.com/tools/debug/) to refresh a cached preview, and Search Console → Sitemaps to submit `https://communalists.com/sitemap.xml` (once).
- Link previews are cached by each app, often for days. A changed image or title shows on new shares first.

## Not done yet

- **A share card per page** (the photo with the page's title written over it) was considered and left for later. It needs bundled fonts for Vietnamese, Chinese and whatever organizations name themselves, and a server render for each card.
- **Organization logos** as their own share image once logos are shown on pages.
- **`BreadcrumbList`** for the dictionary and organization tools.
