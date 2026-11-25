# 008 · Locale routing from the first commit

**Date:** 2026-11-20
**Status:** Accepted
**Context:** The public site serves English, Spanish, Vietnamese and Chinese speakers. The prototype kept the language in React state (reset on reload, invisible to search engines).
**Decision:** Scaffold `app/[locale]/…` with `next-intl` from day one, with locales `en`, `es`, `vi`, `zh`, seeded from `data/translations.json`.
**Alternatives:** English first and i18n later (faster start, but every route moves later).
**Consequences:** Every page and link is locale-aware from the start. Docs to follow: `features/05-localization.md`.
