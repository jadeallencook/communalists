# 072 · Share cards for profiles and organizations, with bundled fonts

**Date:** 2026-11-28
**Status:** Accepted, built the same day
**Context:** A shared profile link previewed as the homepage: the site's title, description and food photo, because the profile page only set its title. The user wanted the profile photo in the preview (with a default when there's none), the bio and other details in the description, and a better title. Organization pages had the same generic image (seo.md listed logos as "not done yet"). Link previews are fetched signed out and kept by the apps that fetch them, so they can never show more than a signed-out visitor sees ([decision #31](031-profiles-visibility-groups-skill-search.md), [#71](071-profile-photos-and-organization-logos-cropped-in-browser-firebase-storage.md)).
**Decision:**

- **A generated 1200×630 card** for profiles and organization pages: the photo or logo, or initials, the name, `@username` or the city, and "Communalists". The card doubles as the default when there's no photo.
- **Profile title "{name} (@{username})"**, with "| Communalists" in the browser tab. The username tells people with the same name apart, and the site name is already on the preview.
- **Profile description from the signed-out view:** pronouns, city and bio when the profile is shared with Everyone, a generic line otherwise. The card shows the photo on the same terms. This is decided from the public view whoever is looking at the page.
- **Organizations get the same card** with the logo (logos are public). Their titles and descriptions were already good.
- **Bundled fonts, not Google Fonts.** `next/og` fetches characters its font lacks (Chinese, some Vietnamese) from Google Fonts with the characters in the request. We bundle Noto Sans and Noto Sans SC from `@fontsource` (one weight, `.woff`) and load only the files a card's text needs, so no name leaves our server.
- Served from route handlers with a version in the link (`?v=`, a hash of what the card shows), so apps fetch a new card when a name, photo or visibility changes.

**Alternatives:** the square photo as the preview image (apps crop it into the wide slot or shrink it to a thumbnail; considered, not chosen); titles "{name} on Communalists" or just the name; letting `next/og` fetch from Google Fonts (no extra files, but each name in another script is sent to Google; the user chose bundling); copying a font subset into the repo (a build step and binary files in git, where reading the npm packages needs neither); the `opengraph-image` file convention (no version in the link, and root params with Cache Components complicate it).
**Consequences:** New dependencies `@fontsource/noto-sans` and `@fontsource/noto-sans-sc` (read at run time; about 5 MB of font files traced into the card functions). `pageMetadata()` takes an `image`. `robots.txt` allows `/api/share-cards/` (Twitterbot and Slackbot honour it). A card that can't be drawn redirects to the site's share image. Docs updated: [seo](../technical/seo.md), [features/17](../features/17-profiles.md), [features/16](../features/16-organizations.md), `AGENTS.md`, the decisions index.
