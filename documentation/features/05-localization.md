# 05 · Localization (4 languages)

The whole public site can be switched between **English, Español, Tiếng Việt and 中文**. These are the largest non-English language communities in San Jose and the South Bay. Every string is exported to [`../data/translations.json`](../data/translations.json) (55 keys across 8 namespaces).

## How it works

- Copy lives in `src/snippets/*.ts`, one file per namespace: `shared`, `navigation`, `footer`, `request-aid-form`, `donate-form`, `events-page`, `sign-up-form`, `log-in-form`.
- Each key maps to one string per language:
  ```ts
  ['needs.label']: { english: '…', spanish: '…', vietnamese: '…', chinese: '…' }
  ```
- `SnippetContext` holds `language` in React state (default `english`) and exposes `snippet(key, namespace = 'shared')`.
- **Fallback chain:** requested language → English → `''`. A missing translation never crashes the page or shows `undefined`.
- **Type-enforced completeness.** `SnippetInterface` is `{ [key in LanguageKeyType]: string }`, so adding a language to `LanguageKeyType` makes TypeScript flag every key that lacks it.
- The language switcher is a dropdown in the nav that shows each language's own name.

## Product insight worth keeping

The UI language **pre-fills the `language` field** on the request and donate forms. Coordinators can then see (and, in a commented-out filter, filter by) the requester's language and match them with a volunteer who speaks it. That's a real workflow benefit, not just a translation.

## What is NOT translated

- Home page body, FAQ, success messages, the kill-switch message, the forgot-password page, all dashboard UI, event names, event tags and the "CLOSED" badge.
- The dashboard is English only on purpose (volunteers), but this was never written down.

## Known issues

- The choice isn't remembered: a reload resets to English. It isn't in the URL either, so search engines only see English.
- No `lang` attribute changes on `<html>` (it's hard-coded `en`), which hurts screen readers and fonts for 中文 and Tiếng Việt.
- Static strings only: no plurals or interpolation (for example the "1 Result / 2 Results" logic is hand-written English).
- The `sign-up-form` namespace has no `confirmedPassword.label` key, so the "confirm password" label renders as an empty string. The fallback chain hid this instead of surfacing it.
- The `sign-up-form` namespace still has unused keys (`bio.*`, `role.label`, `success.*`) left over from the removed application flow ([14](14-removed-experiments.md)).
- Some translations look machine-made. Example: the `request-aid-form` header in Chinese, "欢迎共产主义者", reads roughly as "Welcome, communists". Have native speakers review the copy before reuse.

## In the rebuild

- Use locale codes (`en`, `es`, `vi`, `zh-Hans`) and put the locale **in the URL** (`/es/request-aid`), with `hreflang` alternates. Both Astro (built-in i18n routing) and Next.js (App Router `[locale]` segment) support this.
- Remember the choice (a cookie) and use `Accept-Language` on first visit.
- Use ICU messages (for example `next-intl`, `paraglide-js` or `astro-i18n`) for plurals and variables.
- Make a missing key fail the build or a test instead of silently showing blank.
- Keep the "form language defaults to UI language" behavior.
