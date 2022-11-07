# Database Schema

Reference guide to database architecture and design.

- Items
- Listings
- Locations
- Groups
- Users
- Handles

## Items

To prevent discrepancies, only admins can add items.

This data is cached when the user visits the resources page.

## Listings

You're able to view all resource listings for a specific county:

`listings/santa-clara-ca`

You can also view all resource listings for a specific user or organization:

`listings/santa-clara-ca/USER_UID`
`listings/santa-clara-ca/ORG_UID`

## Locations

We store locations to cordinate resource pickups.

You can view all locations for a specific group or user:

`locations/USER_UID`
`locations/ORG_UID`

## Groups

This stores all of the information for a group.

## Users

User data is under each user's UID, you can request user data:

`/users/USER_UID`

## Handles

Set of key value pairs to redirect user to a group's page. When a user visits `communalists.com/groups/sbma` we are grab the groups's UID and load the page.

```js
{
	"sbma": "group123"
}
```