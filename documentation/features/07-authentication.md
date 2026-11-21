# 07 · Authentication

Volunteers sign up and sign in with email and password through **Firebase Auth**. There are no social logins and no email verification.

## Sign up (`/sign-up`)

| Field | Stored where |
|---|---|
| `name` | Realtime Database `displayNames/{uid}` (not in Firestore) |
| `email`, `password` | Firebase Auth only |
| `confirmedPassword` | Compared on the client, never stored |
| `location` | Firestore `accounts/{uid}` |

Flow in `src/api/auth.ts` → `signUp()`:

1. Throw if the passwords don't match. The error shows as a toast.
2. `createUserWithEmailAndPassword`.
3. `setDoc(accounts/{uid}, { location, joined, lastUpdated })`.
4. `updateUserDisplayName(name)` → RTDB `displayNames/{uid}`.
5. Go to `/dashboard`.

**Not atomic:** if step 3 or 4 fails, the Auth user exists with no account doc or display name. In the rebuild, do this on the server (a Next.js route handler or Firebase Function `onCreate`), or make the app tolerate missing profile data.

## Sign in (`/sign-in`)

- `signInWithEmailAndPassword`, using React Query `useMutation`.
- Success: a translated "signed in" toast, then go to `/dashboard`. Failure: a translated error toast.
- Links: "Forget Password" (sic) → `/forgot-password` and Sign Up.

## Forgot password (`/forgot-password`)

- `sendPasswordResetEmail(auth, email)`, then a "Reset Link Sent" message. The copy is English only.

## Sign out

- The nav "Log Out" link calls `signOut(getAuth(app))`, then goes to `/`.
- `DashboardContext` listens to `onAuthStateChanged` and **clears every cached request, account and organization on sign-out**. That matters on shared computers (libraries, shelters), so keep it.

## Session handling

- Auth state is read only on the client (`onAuthStateChanged` in `DashboardContext`).
- **No route guards.** `/dashboard` renders for signed-out visitors, just with nothing loaded. Restricted tabs are only hidden in the nav (see [09](09-request-triage-dashboard.md)).
- No email verification. Anyone can sign up and immediately request to join an organization. The real gate is moderator approval ([08](08-organizations-and-membership.md)).

## Bugs

- On the sign-up form, the password input has `id="email"` (duplicate ID).
- The confirm-password label is blank because its snippet is missing ([05](05-localization.md)).
- `accountInitialValues` builds `joined` and `lastUpdated` timestamps **when the module loads**, so they reflect when the page was first opened, not when the user signed up.
- No password rules beyond Firebase's 6-character minimum.

## In the rebuild

- Next.js: Firebase Auth on the client plus session cookies verified in middleware, or switch to Auth.js / Clerk / Supabase Auth. Astro: middleware with session cookies.
- Guard `/dashboard/**` on the server.
- Create the profile record on the server when the user is created.
