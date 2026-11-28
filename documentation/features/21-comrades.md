# 21 · Comrades (rebuild)

Comrades are two people who agreed to be connected, like friends. One sends a request, and the other accepts it on their dashboard or in their notifications. Comrades see each other's profile details whatever its visibility, and show on each other's profiles. Designed with the user and **built 2026-11-28** ([decision #74](../decisions/074-comrades-and-a-shared-notifications-inbox.md)). Requests use the shared inbox in [features/22](22-notifications.md).

**Principle:** a comradeship opens up both profiles to each other, and nothing else. It never reveals a group, a comrade or a photo that someone's own settings keep from a viewer.

## Sending and answering

- **On a profile**, in the header: beside the name on wider screens, and the full width under it on phones. **Add comrade** becomes **✓ Request sent ▾**, a menu holding **Cancel request**. Once accepted it's **✓ Comrades ▾**, with **Remove comrade**. If they asked first, a highlighted strip under the name says "{name} wants to be your comrade." with **Accept** and **Decline**, since it needs an answer. Results show as one quiet line under the header. (Until 2026-11-28 it was a row of its own between the header and the bio, with a hint sentence. It read as part of the profile's content, so it moved into the header.)
- **Signed out:** "Sign in to add as a comrade", coming back to the profile. An account without a username goes through setup first.
- **Who can ask** follows the other person's setting: anyone signed in (default), people in their groups, or nobody. The button doesn't show when their setting wouldn't take a request from you (or, signed out, when it's "Nobody"). The server checks again.
- **Both asked:** sending a request to someone who already asked you accepts theirs.
- **Answering:** on the dashboard's **Comrade requests** card (only shown when there are some), in `/notifications`, or on their profile.
- **Declining is silent.** The sender keeps seeing "Request sent". For 30 days, asking again changes nothing and notifies nobody. After that, or once they take it back, they can ask again. The person who declined can still send a request themself.
- **At most 50 requests waiting** per sender. Answering someone else's request is never limited.
- **Removing** asks first, in a dialog ("Remove {name} as a comrade? They aren't told…", **Keep** / **Remove**). It's silent, and either person can send a new request later. Both photos move to a new link unless the profile is public, so a copy of the old link stops working ([decision #71](../decisions/071-profile-photos-and-organization-logos-cropped-in-browser-firebase-storage.md)).

## What comrades see

- **Details at every level.** "Only my comrades" (stored as `name`) shows comrades everything and everyone else just the name, and "My groups and comrades" (`groups`) adds them to groupmates. The same goes for photos in member lists, the members page, comments and notifications.
- **Groups stay private.** A comrade sees only the groups they could already see on those groups' pages ([features/17 → Groups on a profile](17-profiles.md#groups-on-a-profile)).
- **Preview as…** in profile settings has "A comrade".

## Comrades on a profile

- A **Comrades** section after Endorses: "N comrades", six of them (photo or initials, name, @username), and **See all comrades** at `/comrade/{username}/comrades` when there are more. Most recent first.
- **Both people's privacy counts.** The list follows the owner's visibility and **Show my comrades on my profile** (on by default). Each comrade is listed only if their own visibility would show this viewer their details, so someone on "Only my comrades" never appears to a stranger on a friend's list. Their photo follows their own setting.
- The settings preview lists only comrades with public profiles, since how an imagined viewer relates to each one isn't known.

## Accessibility

- The comrade control is never `disabled` while saving (`aria-disabled`). After each action, focus goes to the control that replaces it (Add comrade → Request sent → …), and the result is announced. The menus are standard menu buttons, Escape closes them, and they open by keyboard.
- **Remove comrade** opens a dialog with focus on **Keep**, the safe choice. Escape or Keep returns focus to **Comrades**. The menu isn't modal (`modal={false}`), so opening the dialog from it doesn't fight over focus. An earlier inline confirm had a bug where one Enter both opened it and submitted it: React reused the button's element. The dialog avoids that.
- In request lists, Accept and Decline name the person for screen readers ("Accept: Thanh Nguyễn"). The answered row disappears, so focus moves to the list's heading and the result is announced.

## Failures

([decision #68](../decisions/068-firebase-failures-show-an-error-never-break-the-app.md)) If the viewer's comradeships can't be read, the profile treats them as not comrades (it shows less, never more) and the button area says it couldn't check. A failed comrades list says so in its section. A failed request list shows "Couldn't load comrade requests" on the dashboard, and the rest of the dashboard still shows.

## Data

- `comradeships/{low}_{high}` → `{ uids: [low, high], from, to, status: pending | accepted | declined, createdAt, respondedAt?, hiddenFromSender? }`, times in epoch ms. One per pair. `hiddenFromSender` marks a declined request its sender took back (kept for the cooldown).
- Read with `uids array-contains` (a single-field index): one cached read per person gives their comrades, requests both ways and declines. It's tagged `comrades:{uid}` and cleared for both people on every change. Changes run in a transaction with their notifications.
- `users.profile.comrades { show, requests }`.

## Code

Rules (pure, tested): `src/lib/comrades/index.ts`. Who sees what: `visibleComrades` and the `comrade` viewer in `src/lib/profiles.ts`. Firestore: `src/lib/comrades/store.ts`. How a viewer relates to several people, reading groups only when it matters: `src/lib/comrades/relations.ts`. Waiting requests with sender details: `requests.ts`. Action: `src/app/actions/comrades.ts`. UI: `ComradeButton`, `ComradeRequestList`, `ComradeLinks`, `ComradesPage`. Containers: `src/app/[locale]/comrade/[username]/` and `dashboard/`.

## Later

Comrade-only features (messaging, sharing with comrades only), blocking and reporting (planned with messaging, [features/17 → Phases](17-profiles.md#phases)), and finding comrades.
