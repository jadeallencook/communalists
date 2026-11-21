# Deployment

Two Vercel projects (Hobby plan, account `jadeallencook`) build from the same repo, `jadeallencook/communalists`, on branch `main`. The domain is registered at Squarespace Domains, and DNS is managed there. See [decisions.md](../decisions.md) #10 for why it's set up this way.

## Projects

| Project                  | Serves                                | Build                                                                           | Node |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------- | ---- |
| `communalists`           | `communalists.com` (canonical)        | Next.js preset; install/build/output auto-detected (pnpm from `packageManager`) | 24.x |
| `communalists-storybook` | `storybook.communalists.com` (public) | `pnpm build-storybook` → `storybook-static`                                     | 24.x |

Both projects date from earlier attempts (2022 and 2025). Their settings were updated on 2026-11-21: they had been on `npm` and Node 20/22.

## Domains

| Domain                       | Project                  | Behaviour                                                                                         |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| `communalists.com`           | `communalists`           | Serves the app                                                                                    |
| `www.communalists.com`       | `communalists`           | 308 → `communalists.com`                                                                          |
| `storybook.communalists.com` | `communalists-storybook` | Serves Storybook                                                                                  |
| `communalists.org`           | `communalists`           | Today 308 → `www.communalists.org`. **To change:** 308 → `communalists.com` after the DNS cutover |
| `www.communalists.org`       | `communalists`           | Today serves the app. **To change:** 308 → `communalists.com` after the DNS cutover               |

Don't redirect `.org` to `.com` while `.com` still forwards to `.org` at Squarespace, or the two will loop.

## Squarespace DNS for communalists.com

Values come from Vercel (`vercel api /v6/domains/<domain>/config`) and are project-specific. Re-check them there if Vercel reports a domain as misconfigured.

**Remove** the "Squarespace Domain Forwarding" preset (A `@` 198.185.159.144 / .145, CNAME `www` → `ext-sq.squarespace.com`).

**Add:**

| Type  | Name        | Data                                  |
| ----- | ----------- | ------------------------------------- |
| A     | `@`         | `216.198.79.1`                        |
| A     | `@`         | `64.29.17.1`                          |
| CNAME | `www`       | `5cfc686569577514.vercel-dns-017.com` |
| CNAME | `storybook` | `512986185778ae22.vercel-dns-017.com` |

**Keep:** the "Squarespace Email Forwarding" preset (MX `mxa`/`mxb.mailgun.org`, SPF TXT), which delivers `support@communalists.com`. Also keep `pic._domainkey` (DKIM), the Google verification CNAME and `_domainconnect`.

## Deploying

- **Normal path:** push to `main` and Vercel builds both projects. As of 2026-11-21, **Git-triggered builds weren't firing**: the last Git deploy was 2025-09-11. See "Known issues".
- **Manual path (CLI):** `vercel deploy --project <name>` (preview), plus `--prod` for production. It uploads the **working tree**, uncommitted changes included, so deploy to production only from a clean checkout of `main`.
- **Previews** are behind Vercel Authentication. Use `vercel curl <full-deployment-url>/path` to test them.

## Known issues

- **Git integration silent since Sep 2025.** The projects still list the repo, but pushes don't deploy. The likely cause is that the Vercel GitHub App lost access to the repo. Check GitHub → Settings → Applications → Vercel → Repository access, then Vercel → project → Settings → Git.
- **Stale 2023 certificate after the DNS switch.** Once DNS pointed at Vercel, it kept serving an old Let's Encrypt certificate (issued 2023-02-11) from when the domain was last on Vercel, and HTTPS failed. Automatic renewal didn't replace it within ~5 minutes. `vercel certs issue communalists.com www.communalists.com` and `vercel certs issue storybook.communalists.com` fixed it immediately (2026-11-21). For a minute afterwards, some edge servers still served the old certificate.
- **DNS cutover done 2026-11-21.** The Squarespace forwarding preset was replaced with the records above. Email (MX/SPF) was kept and verified afterwards.
