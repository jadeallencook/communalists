# Deployment

Two Vercel projects (Hobby plan, account `jadeallencook`) build from the same repo, `techletariats/communalists` (moved from `jadeallencook/communalists`; same repo ID 543376659), on branch `main`. The domain is registered at Squarespace Domains, and DNS is managed there. See [decisions.md](../decisions.md) #10 for why it's set up this way.

## Projects

| Project                  | Serves                                | Build                                                                           | Node |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------- | ---- |
| `communalists`           | `communalists.com` (canonical)        | Next.js preset; install/build/output auto-detected (pnpm from `packageManager`) | 24.x |
| `communalists-storybook` | `storybook.communalists.com` (public) | `pnpm build-storybook` → `storybook-static`                                     | 24.x |

Both projects date from earlier attempts (2022 and 2025). Their settings were updated on 2026-11-21: they had been on `npm` and Node 20/22.

## Domains

| Domain                       | Project                  | Behaviour                            |
| ---------------------------- | ------------------------ | ------------------------------------ |
| `communalists.com`           | `communalists`           | Serves the app                       |
| `www.communalists.com`       | `communalists`           | 308 → `communalists.com`             |
| `storybook.communalists.com` | `communalists-storybook` | Serves Storybook                     |
| `communalists.org`           | `communalists`           | 308 → `communalists.com` (path kept) |
| `www.communalists.org`       | `communalists`           | 308 → `communalists.com` (path kept) |

The `.org` redirects were switched on only after the DNS cutover. Before that, `.com` forwarded to `.org` at Squarespace, and the two would have looped. Vercel also refuses to redirect a domain that another domain redirects to, so change the redirect source first (`communalists.org`) and its old target (`www.communalists.org`) second.

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

- **Normal path:** push to `main` and Vercel builds production for both projects; PRs and other branches get previews. Working again since 2026-11-21 (see "Known issues").
- **Manual path (CLI):** `vercel deploy --project <name>` (preview), plus `--prod` for production. It uploads the **working tree**, uncommitted changes included, so deploy to production only from a clean checkout of `main`.
- **Previews** are behind Vercel Authentication. Use `vercel curl <full-deployment-url>/path` to test them.

## Known issues

- **Resolved 2026-11-21: Git integration silent since Sep 2025.** The repo had moved from `jadeallencook/communalists` to the **`techletariats` GitHub org**, but both Vercel projects were still linked as `jadeallencook/communalists`. Vercel hears about pushes through the Vercel GitHub App installed on whichever account owns the repo, so it needs to be installed on the `techletariats` org with access to `communalists`, and each project re-linked with `vercel git connect https://github.com/techletariats/communalists`. Fixed by installing the app on `techletariats` and running `vercel git connect https://github.com/techletariats/communalists --project <name>` for both projects. The first production deploys from Git (`0c552ba`) were triggered through the API (`POST /v13/deployments` with `gitSource`) and went live 2026-11-21. Vercel Hobby limits organization-owned repos (as far as we know, private ones only; this repo is public).
- **Stale 2023 certificate after the DNS switch.** Once DNS pointed at Vercel, it kept serving an old Let's Encrypt certificate (issued 2023-02-11) from when the domain was last on Vercel, and HTTPS failed. Automatic renewal didn't replace it within ~5 minutes. `vercel certs issue communalists.com www.communalists.com` and `vercel certs issue storybook.communalists.com` fixed it immediately (2026-11-21). For a minute afterwards, some edge servers still served the old certificate.
- **DNS cutover done 2026-11-21.** The Squarespace forwarding preset was replaced with the records above. Email (MX/SPF) was kept and verified afterwards.

## Planned: move DNS to Vercel (wildcard subdomains)

Organization pages at `{slug}.communalists.com` need `*.communalists.com`, which needs Vercel nameservers ([decision #11](../decisions.md), [product-vision.md](../product-vision.md)). Steps:

1. **Blocked (2026-11-21):** `vercel domains add communalists.com` says the domain "already exists under a different context": it's owned by **another Vercel account or team**, not `jadeallencook`. Remove it there (or verify ownership through the Vercel dashboard's add-domain flow) so this account owns it.
2. Recreate these records in Vercel DNS **before** switching nameservers (copied from Squarespace's authoritative servers on 2026-11-21):

   | Type  | Name             | Value                                                                                                                                                                 |
   | ----- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | MX    | `@`              | `mxa.mailgun.org` (priority 10)                                                                                                                                       |
   | MX    | `@`              | `mxb.mailgun.org` (priority 10)                                                                                                                                       |
   | TXT   | `@`              | `v=spf1 include:mailgun.org ~all`                                                                                                                                     |
   | TXT   | `pic._domainkey` | The full DKIM key (`k=rsa; p=MIGfMA0…AQAB`). Squarespace serves it as two strings that must be joined. Copy it with `dig +short pic._domainkey.communalists.com TXT`. |
   | CNAME | `bfo33sdpzsqo`   | `gv-7cegi55jw5n2ji.dv.googlehosted.com` (Google verification)                                                                                                         |

   `_domainconnect` (Google Domains' connect record) isn't needed on Vercel. Apex, `www` and `storybook` are handled automatically once the domains are on Vercel nameservers.

3. Add `*.communalists.com` to the `communalists` project.
4. At Squarespace Domains, switch the nameservers to the ones Vercel shows for the domain.
5. Verify mail (MX/SPF/DKIM) and HTTPS for apex, `www`, `storybook` and a test org subdomain.

**Email forwarding caveat:** Squarespace's email forwarding sends `support@communalists.com` through Squarespace's own Mailgun setup. With the MX records copied over, mail should still reach Mailgun, but the forwarding _rules_ are configured in Squarespace. Check that forwarding still works after the switch, and plan a replacement (e.g. Cloudflare Email Routing, ImprovMX, Google Workspace) if it doesn't.
