# 03 · Events / Services Directory

A public listing of recurring free services in the South Bay: meals, showers, essentials, medical care, haircuts, recovery support, legal help, mail service and groceries. It lives at `/events`, and a compact version ("Events Today In San Jose") appears on the home page.

**The data is hard-coded** in `src/assets/events.ts`: 26 listings from 9 organizations. They are exported to [`../data/events.json`](../data/events.json) so the rebuild keeps them. Treat them as possibly out of date, since they were last edited in 2023.

## Organizations in the data

| Organization                             | Listings |
| ---------------------------------------- | -------- |
| Catholic Charities of Santa Clara County | 12       |
| Martha's Kitchen                         | 4        |
| CityTeam                                 | 3        |
| Front Door Communities                   | 2        |
| Grace Baptist Church                     | 1        |
| Food Not Bombs                           | 1        |
| Santa Maria Urban Ministry               | 1        |
| Recovery Café                            | 1        |
| Dignity On Wheels                        | 1        |

18 of the 26 are flagged `isReligious: true`.

## Event shape

```ts
{
  organization: string;
  description?: string;        // in the type, never shown
  tags: TagType[];             // shower | food | essentials | medical | haircut | recovery | legal | mail | groceries
  venue: string;
  location: LocationKeyType;   // e.g. 'san-jose-ca'
  street: string;
  zipcode: number;
  isReligious: boolean;        // stored, never shown or filtered
  start: { hour: 1-12; minute: 0|15|30|45; period: 'am'|'pm' };
  end:   { hour: 1-12; minute: 0|15|30|45; period: 'am'|'pm' };
  frequency: 'weekly' | 'monthly';  // every listing is 'weekly'
  day: DayKeyType[];           // ['tue','wed','thu']
  monthlyDayPosition?: 1|2|3|4; // planned for "2nd Tuesday" events, unused
  website: string;
}
```

## UI behavior

- **Day pagination.** It opens on today. Previous and next buttons wrap around the week (Sat → Sun). The middle pill shows "Today" or the day key plus a count badge.
- **Filters** (full page only):
  - "After X:00" time filter (6 AM to 11 PM): hides events that **end** before that hour.
  - Tag filter: one tag at a time.
- **CLOSED badge.** When you're looking at today, an event whose end time has passed gets a grey "CLOSED" badge.
- **Each row** shows the organization, website link, time range ("10:00am till 2:00pm"), venue, address and tag badges. The address links to Google Maps (`https://www.google.com/maps/place/<street> <city>, CA <zip>`).
- **Empty state:** "There are no events this day".
- The home page version passes `hasFilters={false}`, which hides pagination and filters. It shows today only.

## Source files

- `src/components/EventsTable/index.tsx` — filtering and `isAfterHours`
- `src/components/EventsTable/components/` — `DayPagination`, `Time`, `Address`, `Tags`, `Day` (`Day` is unfinished and unused)
- `src/assets/events.ts`, `interfaces/events.ts`, `objects/events.ts`
- `src/pages/EventsPage.tsx`, `src/snippets/events-page.ts`

## Bugs and gaps

- **Time comparison bug.** `isAfterHours` builds numbers by gluing strings together. At 9:05 the current time becomes `"9" + "5"` = `95`, not `905`, so before 10 minutes past any hour, events look open when they're closed. Compare minutes since midnight instead.
- Uses the **browser's** clock and timezone, not Pacific time.
- The home page heading says "In San Jose", but the list includes every city.
- Tags show the raw keys (`food`), which are not translated. Event names and descriptions aren't translated either.
- `isReligious`, `description` and `monthly` frequency are modeled but never used. Some users avoid faith-based services, so the "religious" filter may be worth finishing.
- **Every edit needs an engineer and a deploy.** This was the biggest content problem. In the rebuild, move events into a CMS or database collection that organizers can edit. Astro content collections work if engineers still own the edits; use a DB or CMS if organizers do.
