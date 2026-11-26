# Deployment

Two Vercel projects (Hobby plan, account `jadeallencook`) build from the same repo, `jadeallencook/communalists` (it moved to the `techletariats` org and back; same repo ID 543376659, so old URLs redirect), on branch `main`. The domain is registered at Squarespace Domains, and DNS is managed there. See decision [#10](../decisions/010-domains-communalists-com-and-storybook.md) for why it's set up this way.

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

## Environment variables (production)

Accounts need these on the `communalists` Vercel project (team `jadeallencook`; CLI: `--project communalists --scope jadeallencook`). **Production only for now:** our only Firebase project holds real data, so previews shouldn't get the service-account key. Working previews need a separate Firebase project with its own values on the Preview environment. Until then, auth pages on previews will fail.

Status 2026-11-21: the six `NEXT_PUBLIC_FIREBASE_*` values are set on Production (values from `firebase apps:sdkconfig WEB --project communalists`); `FIREBASE_SERVICE_ACCOUNT_KEY` was set (sensitive) on 2026-11-22 from a key generated under Firebase → Project settings → Service accounts (`firebase-adminsdk-6240t@…`). The downloaded file was deleted after upload. Production sign-in confirmed working.

| Variable                                   | Value                                                                                                  | Secret?                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | From the `communalists` Firebase web app config                                                        | No                              |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `communalists.firebaseapp.com`                                                                         | No                              |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `communalists`                                                                                         | No                              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `communalists.appspot.com`                                                                             | No                              |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `895012652302`                                                                                         | No                              |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | `1:895012652302:web:1472a663bf95e88ad1c35f`                                                            | No                              |
| `FIREBASE_SERVICE_ACCOUNT_KEY`             | Service-account JSON (the downloaded file as-is)                                                       | **Yes**                         |
| `PLATFORM_ADMIN_UIDS`                      | Super users' Firebase UIDs, comma separated ([features/18](../features/18-unclaimed-organizations.md)) | No, but keep it out of the repo |

**Super users:** `PLATFORM_ADMIN_UIDS` was set on Production on 2026-11-24 with one UID (the project owner's). It's read on the server at request time, so the first deploy that includes the super-user code picks it up. To change the list: `vercel env rm PLATFORM_ADMIN_UIDS production`, then `vercel env add PLATFORM_ADMIN_UIDS production --project communalists --scope jadeallencook` with the full comma-separated list, then redeploy (a running deployment keeps the values it started with).

**Which build is live:** the footer shows `v{version} ({short commit})`, linked to the commit on GitHub. If it doesn't match `git log -1 --format=%h` on `main`, the latest push hasn't deployed yet (or failed; check `vercel ls communalists --scope jadeallencook`). Local builds show `(dev)`. See decision #19.

**Node version:** production runs the major allowed by `package.json` `engines` (now Node 24), not the project's dashboard setting; see `tooling-and-ci.md` for the Node 26 incident.

`NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them. Vercel's CLI pauses on a `NEXT_PUBLIC_` name containing `KEY`, because it looks like a secret; the Firebase web API key is public by design, so add it with `--type config`. Add the service-account key straight from its file, so it's never pasted anywhere: `vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production --sensitive < key.json`, then delete the file. Also enable **Authentication → Sign-in method → Email/Password** in the Firebase console, add `communalists.com` under **Authentication → Settings → Authorized domains** (password-reset links return there), set the sender name under **Authentication → Templates**, and set the templates' **action URL** to `https://communalists.com/auth/action` (our reset-password page; see `accounts-and-sessions.md`).

## Analytics

Umami Cloud loads on the production deployment only (`VERCEL_ENV === 'production'`) and sends only from `communalists.com`. No env vars: the website id is a public constant. See [analytics](analytics.md).

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

- **Normal path:** merge a PR into `main` (branch protection requires review and green CI; see [tooling-and-ci](tooling-and-ci.md#branch-protection-on-main)) and Vercel builds production for both projects; PRs and other branches get previews. Working again since 2026-11-21 (see "Known issues").
- **Manual path (CLI):** `vercel deploy --project <name>` (preview), plus `--prod` for production. It uploads the **working tree**, uncommitted changes included, so deploy to production only from a clean checkout of `main`.
- **Previews** are behind Vercel Authentication. Use `vercel curl <full-deployment-url>/path` to test them.

## Known issues

- **Resolved 2026-11-21: Git integration silent since Sep 2025.** The repo had moved from `jadeallencook/communalists` to the **`techletariats` GitHub org**, but both Vercel projects were still linked as `jadeallencook/communalists`. Vercel hears about pushes through the Vercel GitHub App installed on whichever account owns the repo, so it needs to be installed on the `techletariats` org with access to `communalists`, and each project re-linked with `vercel git connect https://github.com/techletariats/communalists`. Fixed by installing the app on `techletariats` and running `vercel git connect https://github.com/techletariats/communalists --project <name>` for both projects. The first production deploys from Git (`0c552ba`) were triggered through the API (`POST /v13/deployments` with `gitSource`) and went live 2026-11-21. Vercel Hobby limits organization-owned repos (as far as we know, private ones only; this repo is public).
- **Stale 2023 certificate after the DNS switch.** Once DNS pointed at Vercel, it kept serving an old Let's Encrypt certificate (issued 2023-02-11) from when the domain was last on Vercel, and HTTPS failed. Automatic renewal didn't replace it within ~5 minutes. `vercel certs issue communalists.com www.communalists.com` and `vercel certs issue storybook.communalists.com` fixed it immediately (2026-11-21). For a minute afterwards, some edge servers still served the old certificate.
- **DNS cutover done 2026-11-21.** The Squarespace forwarding preset was replaced with the records above. Email (MX/SPF) was kept and verified afterwards.

## Planned: move DNS to Vercel (wildcard subdomains)

Organization pages at `{slug}.communalists.com` need `*.communalists.com`, which needs Vercel nameservers ([decision #11](../decisions/011-multi-organization-platform.md), [product-vision.md](../product-vision.md)). Steps:

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
