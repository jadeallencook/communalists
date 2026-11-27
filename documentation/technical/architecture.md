# Architecture

A single Next.js App Router app serves both the public site and (later) the volunteer dashboard. Locale-prefixed routes are rendered on the server, and Firebase is the backend. As of 2026-11-20, only the foundation exists: layout shell, i18n, Firebase wiring and tooling. No features yet. The prototype's architecture is in [prototype/architecture.md](prototype/architecture.md).

## Stack

| Concern         | Choice                                                                   | Notes                                                                 |
| --------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Framework       | Next.js 16.4 (App Router), React 19.3, TypeScript 5.9 (strict)           | `cacheComponents` and `partialPrefetching` on (template defaults)     |
| i18n            | `next-intl` 4.15, locales `en` `es` `vi` `zh`                            | Locale read with `next/root-params`; messages in `messages/*.json`    |
| UI              | Tailwind CSS 4.3 + shadcn/ui 4.23 (style `radix-nova`, Radix primitives) | Components copied into `src/components/atoms`; class merging via `cn` |
| Theme           | `next-themes`: light, dark, system                                       | See [design-system.md](design-system.md)                              |
| Backend         | Firebase: Auth + Firestore (client SDK 13, Admin SDK 14)                 | Realtime Database is unused; its rules deny everything                |
| Validation      | Zod 4                                                                    | Installed for server actions and forms; not used yet                  |
| Hosting         | Vercel                                                                   | Not yet connected                                                     |
| Package manager | pnpm 12 (via Corepack), Node ≥ 24.15                                     | See [tooling-and-ci.md](tooling-and-ci.md)                            |

## Layout

```
messages/                 en.json, es.json, vi.json, zh.json + parity test
src/
  app/
    [locale]/layout.tsx   Root layout: <html lang>, fonts, providers, header/footer
    [locale]/page.tsx     Home: banner, platform intro, create-account CTA, sign-in link
    [locale]/sign-up/     Container: wires the signUp action into SignUpPage
    [locale]/sign-in/     Container: wires the signIn action into SignInPage
    [locale]/forgot-password/  Container: wires requestPasswordReset into ForgotPasswordPage
    [locale]/account/setup/ Container: required profile questions (name, language, city); returns to ?next=
    [locale]/org/new/     Create an organization (form container + action)
    [locale]/org/[handle]/ An organization's page (public profile + members' space)
    [locale]/auth/action/ Firebase email links (Action URL): verifies the code, renders ResetPasswordPage
    [locale]/dashboard/   Container: requireAccount, renders DashboardPage (streamed); /welcome redirects here
    [locale]/account/settings/ Container: edit profile (setup form in settings mode)
    [locale]/find/[[...place]]/ Find organizations; the city in the path (/find/us/ca/oakland)
    [locale]/header-slots.tsx  Header's signed-in parts (session + profile), streamed in <Suspense>
    [locale]/analytics.tsx     Umami loader (production) + click listener; track-event.tsx sends on render
    actions/sign-out.ts   Shared sign-out server action (account menu)
    api/places/           GET city search for the picker (cached)
    api/handles/[handle]/ GET handle availability for the create form (signed-in only)
    globals.css           Tailwind + shadcn tokens
    favicon.ico           Star logo (from the 2025 attempt)
  components/
    atoms/                shadcn primitives (button, input, card, field…)
    molecules/            Small composites (FeatureCard, LocaleSwitcher, ThemeToggle, LocationField, LinkProblem, AccountMenu, header links)
    organisms/            Page sections (SiteHeader, HeroBanner, AuthCard, SignUpForm, SignInForm, ForgotPasswordForm, ResetPasswordForm, AccountSetupForm…)
    pages/                Presentational page views (HomePage, SignUpPage, SignInPage, ForgotPasswordPage, ResetPasswordPage, AccountSetupPage, AccountSettingsPage, DashboardPage)
    providers/            Client providers (theme)
  hooks/                  Shared UI logic (useSignUpForm, useSignInForm, useForgotPasswordForm, useResetPasswordForm, useAccountSetupForm, useLocationPicker, usePlaceSearch)
  i18n/
    routing.ts            Locales, default locale, display names
    navigation.ts         Locale-aware Link / useRouter / redirect
    request.ts            Per-request locale + messages for next-intl
    locale-from-tag.ts    "zh-CN" → zh (for the Action URL's lang)
  assets/               Images imported by components (see AGENTS.md)
  lib/auth/             Session cookies; requireAccount() gate; Firebase Auth REST (password sign-in, reset email, reset)
  lib/organizations/    Organizations: options, handle rules, Firestore (create, cached reads)
  lib/build-info.ts     Version + commit for the footer (pure)
  lib/account-setup.ts  Required profile questions, what's missing, safe ?next= (pure)
  lib/places/           Place data, search, readable slugs (us/ca/oakland), API client (city picker)
  lib/analytics/        Event catalog, track() attributes, what may leave the browser (pure); browser.ts sends
  lib/validation/       Zod schemas shared by forms and actions
  lib/users.ts          users/{uid} profiles
  lib/firebase/
    client.ts             Browser SDK (lazy; emulator-aware)
    admin.ts              Admin SDK (server-only; bypasses rules)
  proxy.ts                Locale detection + redirect (Next 16's renamed middleware); /auth/action uses ?lang=
  global.d.ts             Types `t('…')` keys against en.json
firebase.json, firestore.rules, database.rules.json, firestore.indexes.json
scripts/build-places.mjs  Regenerates src/lib/places/data from GeoNames
```

## Request flow

1. **`src/proxy.ts`** runs on every page request (not `/api`, `/_next`, `/_vercel` or files with an extension). A path without a locale (`/`) is redirected to `/{locale}` using the `NEXT_LOCALE` cookie, then `Accept-Language`, then `en`. The exception is `/auth/action` (Firebase email links), which uses the link's `lang` first.
2. The **`[locale]` root layout** reads the locale with `next/root-params`, 404s if it isn't supported, and sets `<html lang>`. That fixes the prototype's hard-coded `lang="en"`.
3. Server Components get translations with `getTranslations()`. Client Components use `useTranslations()` through `NextIntlClientProvider`, which passes the messages down automatically.
4. All four locales are **prerendered at build time** (`generateStaticParams` in the layout).

## Next.js 16 specifics

These are newer than most training data and docs online. The bundled docs in `node_modules/next/dist/docs/` are the source of truth, and `AGENTS.md` tells agents to read them first.

- **`middleware.ts` is now `proxy.ts`.** It runs on the Node.js runtime, and the `runtime` option isn't allowed.
- **Cache Components** (`cacheComponents: true`): every root param needs at least one value from `generateStaticParams`, or the build fails. Dynamic data must be inside `<Suspense>` or marked `'use cache'`.
- **Pages stay alive when you leave them** (Cache Components hides up to 3 routes with React `<Activity>` instead of unmounting them; `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`). React state _and_ DOM state survive, so an uncontrolled input (`defaultChecked`, `defaultValue`) keeps its old value when the page comes back with a different URL. Found 2026-11-26: after a homepage search with a tag, going back, clearing the tag and searching again, `/find` still showed the old tag's chip ticked, and the next filter click sent it again. Fix: reset (remount with a `key`) when the URL changes from outside the form, as `find-container.tsx` does; close popovers and clear typed text in a `useLayoutEffect` cleanup, as `FocusAreaField` does.
- **`next/root-params`**: server code can read `[locale]` without prop drilling. It doesn't work in Client Components, Server Actions or Route Handlers. next-intl 4.15 builds on this and has deprecated `setRequestLocale`.
- `LayoutProps<'/[locale]'>` / `PageProps` are global type helpers generated by `next typegen`, which runs as part of `pnpm typecheck`.

## Firebase usage rules

- **Server first.** Reads and writes go through the Admin SDK in Server Components, Server Actions and Route Handlers, with authorization checked in code. The client SDK is for auth state and (later) realtime listeners.
- **Rules deny everything** until a feature opens a path, and each opening ships with emulator tests. Both `firestore.rules` and `database.rules.json` (Realtime Database, unused) are deny-all and were **deployed to production `communalists` on 2026-11-20**, after the data was backed up and deleted. Deploy rule changes with `firebase deploy --only firestore:rules,database --project communalists`. Use `firestore:rules`, not `firestore`, so the empty `firestore.indexes.json` doesn't wipe indexes.
- Both SDKs initialize lazily (`getClientAuth()`, `getAdminDb()` and so on), so importing them never touches Firebase during the build.
- Local development uses the emulators with the `demo-communalists` project, which can't reach real Firebase. See [tooling-and-ci.md](tooling-and-ci.md).

## Presentational vs logic

Routes in `src/app/` are thin containers: read the session, fetch data, pick the server action, and render a page view from `src/components/pages/` with props. Presentational components never import from `src/lib/auth`, `src/lib/firebase`, `src/lib/users`, or route `actions.ts` files. See `AGENTS.md` → "Components and Storybook" and decision #13.

## Accounts

Sign-up, sessions and location are covered in [accounts-and-sessions.md](accounts-and-sessions.md).

## Not decided yet

- The Firestore schema for the rebuild. The prototype's schema and a relational sketch are in [data-model.md](data-model.md).
- Which Firebase project ID production uses, and how environments map to Vercel (preview vs production).
