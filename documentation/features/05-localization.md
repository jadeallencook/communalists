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

## Rebuild (current)

Built in the foundation scaffold (decision #8):

- **Locale in the URL**: `/en`, `/es`, `/vi`, `/zh`, using `next-intl` 4.15. `/` redirects using the `NEXT_LOCALE` cookie, then `Accept-Language`, then `en`. The switcher keeps you on the same page and sets the cookie, so the choice survives a reload.
- **`<html lang>` follows the locale**, and every locale is prerendered.
- **Messages** live in `messages/{locale}.json`, namespaced by component (`Header`, `Footer`, `Home`…). Keys are typed against `en.json`, so a typo in `t('…')` fails `tsc`.
- **No silent blanks.** `messages/messages.test.ts` fails CI if a locale is missing a key or has an empty string.
- Locale codes are plain `zh` (Simplified Chinese assumed). Switch to `zh-Hans` / `zh-Hant` if Traditional Chinese speakers need support.
- The brand name "Communalists" is never translated.

Still to do:

- `hreflang` alternates and per-locale metadata.
- ICU plurals and variables as features need them (next-intl supports them).
- Native-speaker review of every es / vi / zh string: the shell copy written during scaffolding, and the `Home`, `SignUp` and `Welcome` namespaces added 2026-11-21.
- Keep the "form language defaults to UI language" behavior when the request form is rebuilt.
- Import the still-useful prototype strings from [`../data/translations.json`](../data/translations.json) as each feature is rebuilt.
