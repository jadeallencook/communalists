# 06 · Home Page and FAQ

The landing page at `/`. It explains mutual aid and sends visitors to the two main actions.

## Sections (top to bottom)

1. **Hero** (`Shared/Header` with a `network.png` background): "Welcome To Communalists", the tagline "We give communities the tools they need to empower themselves through mutual aid", and two buttons: **Make A Request** (→ `/request-aid`) and **Become A Volunteer** (→ `/sign-up`).
2. **Building Stronger Communities**: the mission paragraph.
3. **From Surplus to Support**: the redistribution pitch (restaurants with surplus food, people with furniture they no longer need). This framing explains why the [donations](04-donations.md) feature exists.
4. **Frequently Asked Questions**: an accordion with 4 questions:
   - What is mutual aid?
   - How does it work? (sign up, join or create organizations, track tasks, fulfill requests)
   - Is it free to join? (yes)
   - How can I get involved?
5. **Events Today In San Jose**: the [events list](03-events-directory.md) for today, without filters.

## Notes

- All home page and FAQ copy is hard-coded English in `src/pages/HomePage.tsx` and `src/components/Home/FAQ/index.tsx`, so the language switcher doesn't affect it.
- The FAQ promises things the app doesn't do: users can't **create** organizations from the UI (`add-organization.ts` exists but nothing calls it), and there is no task tracking or resource management.
- The page `<title>` is "Communalists | Building Stronger Communities Together". There is no meta description or Open Graph image.
- The site footer (on every page) is translated and reads: "Developed by Volunteers · San Francisco Bay Area · Established 2022 · Open Source", linking to the GitHub repo.

## In the rebuild

This page is static and the best candidate for SSG. Move the copy into translations or content files, add meta and OG tags, and make the FAQ match what the product actually does.
