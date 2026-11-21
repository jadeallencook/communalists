# Prototype: Architecture

> **History.** This describes the 2022–2024 prototype (commit `7ebc168`). For the current setup, see [../architecture.md](../architecture.md).

A client-only React single-page app, bundled with Webpack, that talks to Firebase directly from the browser. There is no server, API layer or Cloud Functions: every read and write runs in the browser, and only Firebase security rules stand between users and the data.

## Stack (as built)

| Concern      | Choice                                                                           | Version                                     |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------- |
| UI           | React                                                                            | 18.2                                        |
| Language     | TypeScript                                                                       | 4.8 (pinned; newer `@types/node` breaks it) |
| Bundler      | Webpack 5 + ts-loader + babel-loader                                             |                                             |
| Routing      | React Router `HashRouter`                                                        | 6.4                                         |
| Server state | React Query (`react-query` v3)                                                   | 3.39 (only partly used)                     |
| App state    | React Context (`DashboardContext`, `SnippetContext`, `RequestFormStatusContext`) |                                             |
| Forms        | Formik (Yup installed, unused)                                                   | 2.2                                         |
| UI kit       | React-Bootstrap + Bootstrap 5 CSS                                                | 2.5 / 5.2                                   |
| Styling      | styled-components (one `style.ts` per component) + global `theme.css`            | 5.3                                         |
| Toasts       | react-hot-toast                                                                  | 2.4                                         |
| Backend      | Firebase Auth, Firestore, Realtime Database                                      | `firebase` 9.15 (modular SDK)               |
| Analytics    | GA4 via gtag in `public/index.html`                                              |                                             |
| Node         | 16.17.0 (`.nvmrc`)                                                               |                                             |

## Folder layout

```
interfaces/   TypeScript interfaces for documents (outside src/)
objects/      Enum maps: key → display label (locations, stages, roles…)
types/        Union types for the keys
src/
  api/        One file per Firebase call (get-*, add-*, update-*); init-app.ts makes the app
  contexts/   DashboardContext (cache + actions), SnippetContext (i18n), RequestFormStatusContext
  pages/      Route components; pages/Dashboard/* are dashboard tabs
  forms/      Formik forms, each with index.tsx + style.ts
  components/ Presentational components, each with index.tsx + style.ts
  snippets/   Translations per namespace
  utils/      Pure helpers (formatting, filtering, sorting)
  assets/     Images + events.ts (hard-coded events data)
```

## Provider tree (`src/index.tsx`)

```
RequestFormStatusProvider      reads the kill switch once
└ SnippetProvider              language + snippet()
  └ QueryClientProvider        global onError → toast + console log
    └ HashRouter
      └ DashboardProvider      onAuthStateChanged, caches, all dashboard actions
        ├ Navigation
        ├ Routes
        └ Footer
    └ Toaster
```

`DashboardProvider` wraps the **public** pages too. It sets up the auth listener on every page load and, for signed-in users, runs the initial dashboard fetch even on the home page.

## Routes

| Path                                       | Page                                                | Auth                          |
| ------------------------------------------ | --------------------------------------------------- | ----------------------------- |
| `/`                                        | Home                                                | public                        |
| `/request-aid`                             | Request form or paused message                      | public                        |
| `/donate`                                  | Donation form                                       | public                        |
| `/events`                                  | Events directory                                    | public                        |
| `/sign-in`, `/sign-up`, `/forgot-password` | Auth forms                                          | public                        |
| `/view-request/:uid`                       | Standalone request detail                           | public route, relies on rules |
| `/dashboard`, `/dashboard/:route`          | Dashboard shell: `overview`, `requests`, `settings` | not guarded                   |

Because of `HashRouter`, real URLs look like `https://www.communalists.org/#/events`. Copy-link code hard-codes `/#/`.

## Data flow in the dashboard

1. `onAuthStateChanged` fires → if signed in, `initalDashboardFetch` runs **one after another**: my organizations → all organizations → my account → display names. These four requests are independent and could run in parallel.
2. Pages read from context maps (`requests`, `organizations`, `accounts`, `displayNames`).
3. Actions (`updateStage`, `requestToJoinOrganization`, `approveRequestToJoinOrganization`, `updateDisplayName`) write to Firebase, then patch the local map right away.
4. One global `isLoading` boolean is shared by every action. Any fetch makes every page that reads it show a spinner.
5. Some components skip the context and call `src/api` directly: `VolunteerForm`, `Comments`, `ViewRequestPage`, `FormStatusForm` (React Query), `DonationsPage`.

So there are **three state patterns side by side**: context cache, React Query, and local `useEffect` + `useState`. The rebuild should pick one.

## Environments

- `src/api/init-app.ts` (committed) used `process.env.FIREBASE_CONFIG` (JSON, injected by `webpack.EnvironmentPlugin`) and fell back to the **`communalists-test`** project. So local dev never touched production by default.
- The **uncommitted** working copy replaces that with a hard-coded test config that adds `databaseURL`. Realtime Database calls (`getDatabase()`) need `databaseURL`. Without it, the kill switch and display names fail. Keep that in mind for any Firebase config.
- `getDatabase()` and `getAuth()` are sometimes called **without** passing `app`. That works only because there's one default app.
- Production domain: `www.communalists.org` (gtag checks for it). The `package.json` homepage says `communalists.com`, and support emails mix `.com` and `.org`.

## Analytics

- `public/index.html` loads gtag for `G-41Q7T9V1ZW`, but configures `G-6CVL13DXLL`, and only on `www.communalists.org`. **Two different measurement IDs.** `G-41Q7T9V1ZW` is the production Firebase project's (`communalists`) own Analytics ID (confirmed from its web config, 2026-11-20); where `G-6CVL13DXLL` came from is unknown.
- The script still loads on every host, and there's no consent banner.
