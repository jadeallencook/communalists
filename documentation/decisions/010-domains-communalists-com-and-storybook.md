# 010 · Domains: communalists.com and storybook.communalists.com

**Date:** 2026-11-21
**Status:** Accepted. Live 2026-11-21: `.com` serves the rebuild, `.org` and `www` redirect, Storybook is public.
**Context:** Before this, `communalists.com` (registered at Squarespace Domains, ex-Google Domains) 301-forwarded to `communalists.org`, which served the 2025 Next.js + Prismic site from Vercel at `www.communalists.org`. Email for `support@communalists.com` is forwarded through Squarespace's Mailgun preset.
**Decision:**

- **`communalists.com` (apex) is canonical.** `www.communalists.com` redirects to it.
- **`storybook.communalists.com`** is a second Vercel project from the same repo that builds Storybook. It's **public**.
- **`communalists.org` and `www.communalists.org` redirect to `communalists.com`**, keeping the path, once the new app is live. The 2025 site goes offline (code at `81eed51`).
- **Squarespace DNS:** remove only the "Domain Forwarding" preset (A `@` ×2, CNAME `www`). **Keep** the Email Forwarding preset (Mailgun MX + SPF), the `pic._domainkey` DKIM record, the Google verification CNAME and `_domainconnect`.
- Vercel is managed with the Vercel CLI (pinned 66.5.0, installed globally under Node 24.22.3).

**Alternatives:** `www` as canonical (Vercel's CNAME-friendly default); keeping the 2025 site on `.org`.
**Consequences:** `src/lib/site.ts` holds the canonical URLs, and `metadataBase` uses them. Support email is `support@communalists.com`, which settles the prototype's `.com`/`.org` mix.
