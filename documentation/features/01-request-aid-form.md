# 01 · Request Aid Form

A public form at `/request-aid` where a community member asks for help. Each submission creates one document in the Firestore `requests` collection. That document enters the volunteer pipeline at stage `submitted`.

## User flow

1. The visitor opens `/request-aid` from the nav ("Request") or the home page button ("Make A Request").
2. If the [kill switch](02-request-form-kill-switch.md) is off, they see a "temporarily taken down" message instead of the form.
3. They fill in the fields below and submit.
4. A spinner shows while the write runs. On success the form is replaced by a confirmation message.

## Fields

| Field      | Input    | Required | Notes                                                                                                                                                                        |
| ---------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | text     | yes      |                                                                                                                                                                              |
| `language` | select   | yes      | Defaults to the **current UI language**, so a visitor browsing in Vietnamese is tagged `vietnamese` without doing anything.                                                  |
| `location` | select   | yes      | One of 10 South Bay cities. Default `santa-clara-ca`.                                                                                                                        |
| `email`    | email    | yes      |                                                                                                                                                                              |
| `phone`    | tel      | no       | Auto-formatted as `(408) 555-1234` while typing (`src/utils/format-phone-number.ts`).                                                                                        |
| `method`   | select   | yes      | Preferred contact: `email`, `phone` (call), `text`. Default `email`.                                                                                                         |
| `health`   | text     | no       | "Do you have any relevant health conditions?"                                                                                                                                |
| `needs`    | textarea | yes      | Free text. A tooltip gives guidance and an example: "I'm in need of some fresh produce and cleaning supplies, I can meet at 456 Oak Ave sometime after 5:00PM on Wednesday." |

The form also sets these fields itself:

| Field                   | Value                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| `stage`                 | `'submitted'`                                                                   |
| `timestamp`             | Firestore `Timestamp`, taken when the form **mounts** (not on submit; see bugs) |
| `driver`, `coordinator` | `''`                                                                            |
| `hasDriver`             | `false`                                                                         |
| `organizations`         | `['communalists']` (hard-coded)                                                 |

## Policy copy

The description tells requesters: "we can only address a request from an individual once every three months." **Nothing enforces this.** The rebuild could check for a recent request with the same email or phone.

The success message says the info is "kept confidential and used solely for the purpose of connecting you with those who can help." Treat that as a product promise. It means request PII must be locked down with security rules (see [Firebase](../technical/firebase.md)).

## Source files

- `src/pages/RequestAidPage.tsx` — gate on the kill switch
- `src/forms/RequestAidForm/index.tsx` — Formik form
- `src/api/add-request.ts` — `addDoc(collection(db, 'requests'), values)`
- `interfaces/request-aid.ts` — shape
- `src/snippets/request-aid-form.ts` — translated copy

## Bugs and gaps to fix in the rebuild

- The success message and tooltip are **English only**, unlike the rest of the form.
- `timestamp` is set when the form mounts. If someone leaves the tab open for an hour, the request is back-dated.
- Formik is wired up, but **Yup validation is not used** anywhere. Validation relies only on HTML `required`.
- `onChange={handleChange && phoneHandler}` evaluates to just `phoneHandler`. It works, but by accident.
- `organizations: ['communalists']` is hard-coded. Requests are not actually routed to an organization (see [08](08-organizations-and-membership.md)).
- The support email is `support@communalists.com` here but `support@communalists.org` on the kill-switch page. Pick one.
- There is no spam protection (no captcha or rate limit) on a public, unauthenticated write.
