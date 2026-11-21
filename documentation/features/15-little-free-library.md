# 15 · Little Free Library

A public page at `/little-free-library` that points people to free book-exchange boxes nearby. It was added in the [2025 Next.js + Prismic attempt](../technical/nextjs-prismic-attempt.md) (`3188716`), not in the original prototype.

## How it worked

- The page content (intro copy, hero) came from a Prismic singleton, `little_free_library`, through its slice zone. Title, description and Open Graph image came from its meta fields.
- Under the content, the page embedded the official map in a 600 px tall iframe: `https://app.littlefreelibrary.org/ourmap` (title "Little Free Library Map").

## Notes for the rebuild

- This is the first sign of the product widening from _aid requests_ toward a **directory of community resources**. It fits naturally next to the [events/services directory](03-events-directory.md): consider one "resources" section with services, libraries and similar.
- Relying on a third-party iframe means no control over its language, accessibility, or what it shows. Check whether Little Free Library offers data or an API before building a native map.
- Like the rest of that attempt, the page was English only.
