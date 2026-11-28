# 064 · SEO: Title Case titles, one share image, sitemap and structured data

**Date:** 2026-11-27
**Status:** Accepted
**Context:** A Google search for "mutual aid in Concord, CA" showed our city search with a good title, but the home page showed only "Communalists", dictionary pages showed only the word, and shared links had no image. The user asked for better titles and descriptions on every page, the homepage photo as the link-preview image, better dictionary titles, keywords, and titles with every word capitalized.
**Decision:**

- **Titles:** the home page is "Communalists: Tools for Mutual Aid Networks"; dictionary words are "{Word}: Meaning and Definition" (matching "… meaning" searches); organizations are "{name} in {place}"; letters are "Mutual Aid Dictionary: M". **English titles are in Title Case** (small words like "and", "a", "of" stay lowercase). Other languages keep their own rules ([#56](056-dictionary-words-title-case-in-english.md)), and names people wrote are never re-capitalized. This applies to page titles only; headings on the page keep sentence case. A few private pages use their heading as their title and keep sentence case too.
- **One share image for every page**: the homepage photo cropped to 1200×630 (`src/assets/share-image.jpg`), with translated alt text.
- **Every public page gets** a description, a canonical URL, `hreflang` links for all four languages plus `x-default`, Open Graph and Twitter tags, and keywords, all through one helper (`pageMetadata()`).
- **Keywords:** added as asked, but Google has ignored the tag since 2009. The words people search for also go in titles, descriptions and structured data, which is what affects ranking.
- **Structured data (JSON-LD):** `WebSite` and `Organization` on the home page, `Organization` on listed groups, and `DefinedTerm` on dictionary words.
- **`/sitemap.xml`** lists the home page, sign-up, dictionary words and letters, listed active organizations, and city searches only where a local group is based. **`/robots.txt`** blocks API and signed-in areas in production, and everything on previews.

**Alternatives:**

- **A generated card per page** (the photo with the page title over it). It stands out more in feeds, but needs fonts for Vietnamese, Chinese and user-written names, plus a server render per card. The user chose the plain photo; the card can come later.
- **"What is {word}?"** and **"{Word} – Communalists Dictionary"** for dictionary titles. Question titles read badly for some words, and the plain form misses "meaning" searches.
- **Listing every city in the sitemap.** That's about 20,000 pages, most with no groups. Thin pages can lower how search engines rate the whole site.
- **Capitalizing titles in code.** Hand-written English strings are simpler and can't mangle names; dictionary words are already stored in Title Case.

**Consequences:** New public pages must use `pageMetadata()`, or they lose the share image, because Next.js replaces `openGraph` instead of merging it. The sitemap costs one cached read of the listed organizations a day. Docs updated: [technical/seo.md](../technical/seo.md) (new), [features/05](../features/05-localization.md), [06](../features/06-home-and-faq.md), [16](../features/16-organizations.md), [19](../features/19-dictionary.md), the docs index and `AGENTS.md`.
