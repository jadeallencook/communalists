# Second Attempt: Next.js + Prismic (2025)

Between the prototype and the current rebuild there was a second attempt on `main`: 50 commits, from 2025-04-26 ("removed all project files and created blank slate") to 2025-11-03. It built only the **public, CMS-driven marketing shell**: home, a Little Free Library page, a 404 page, nav and footer. No dashboard, auth, forms or data layer. It was removed on 2026-11-20 to restart from these docs (see [decisions.md](../decisions.md) #2). The code stays in git history at `81eed51`.

## Stack

| Concern       | Choice                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 15.3 App Router, React 19, TypeScript 5, Turbopack dev server                               |
| Content       | **Prismic** headless CMS with Slice Machine (repository `communalists`)                             |
| Styling       | Started with Tailwind + shadcn/ui, then **moved to CSS modules** (`582c835`, `de813be`)             |
| UI primitives | Radix UI (accordion, dialog, dropdown, navigation menu, tooltip), lucide-react icons                |
| Theming       | `next-themes`: light and dark, follows the system setting, class-based                              |
| Component dev | Storybook 8 (deployed at `communalists-storybook.vercel.app`) + Vitest browser tests via Playwright |
| Hosting       | Vercel, with `@vercel/analytics` and `@vercel/speed-insights`                                       |
| Node          | 22.19.0                                                                                             |

## How content worked

- Every page was a Prismic **singleton** (`home`, `little_free_library`, `404`) with a `slices` zone plus `meta_title`, `meta_description` and `meta_image`. Pages rendered through `<SliceZone>`, and `generateMetadata` filled the title, description and Open Graph image from the CMS.
- Site chrome was CMS-driven too: `navbar` (title + links), `footer` (title, tagline, sections of links, copyright, privacy policy link), and `meta` (site-wide title and description).
- One slice was built: **Hero** (eyebrow rich text, title, description, links, image).
- Caching: production fetches used `cache: 'force-cache'` tagged `prismic`. A `POST /api/revalidate` route calls `revalidateTag('prismic')` (meant to be a Prismic webhook). Preview routes (`/api/preview`, `/api/exit-preview`) and `/slice-simulator` supported Prismic previews and Slice Machine.

## Design tokens (`src/app/globals.css`)

A **monochrome** palette, a clear break from the prototype's red: `--primary` is black in light mode and white in dark mode, `--secondary` is `#cfcfcf` / `#666`, and `--destructive` is `#a71d31`. It added full scales for radius (`xs`–`2xl`), text size (`xs`–`4xl`, 0.75–2.25 rem), spacing (`none`–`3xl`, 0–3 rem), and opacity, plus `--screen-gutters: 1rem`. The favicon became the star logo on a black background (`54079b5`).

## Lessons

- **Prismic as a CMS works for marketing pages**, and on-demand revalidation was the right model. It's a reasonable home for the [events/services](../features/03-events-directory.md) list and FAQ that the prototype hard-coded. But any feature that needs relational data (cases, memberships) still needs a real database.
- **Tailwind was tried and dropped for CSS modules.** Ask before reintroducing it.
- An early atomic-design folder setup (atoms, molecules, organisms; `4a8e37d`) was replaced by `components/common` and `components/features`.
- Storybook stayed in use the whole time and had a public deployment. It's worth keeping if a component library returns.
- `prismicio.ts` still had the template's empty `routes` array (a TODO), and the README was the `create-next-app` default.
- Like the prototype, it hard-coded `<html lang="en">`. i18n wasn't started.
- Links in the Storybook welcome page: website `communalists.org`, Prismic repo `communalists.prismic.io`, and a Discord invite.
