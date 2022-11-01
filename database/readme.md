# Database Schema

Reference guide to database architecture and design.

## Users

User data is under each user's UID, you can request user data:

`/users/USER_UID`

## Resources

You're able to view all resources for a specific county:

`resources/santa-clara-ca`

You can also view all resources for a specific user or organization:

`resources/santa-clara-ca/USER_UID`
`resources/santa-clara-ca/ORG_UID`

## Organizations

This stores all of the information for an organization.

## Products

To prevent product discrepancies, only admins can add products.

This data is cached when the user visits the resources page.

## Warehouses

Warehouses are were users are able to pickup resources.

You can view all warehouses for a specific organization or user:

`warehouses/USER_UID`
`warehouses/ORG_UID`

## Handles

Set of key value pairs to redirect user to organization page. When a user visits `communalists.com/organizations/sbma` we are grab the organization's UID and load the page.

```js
{
	"sbma": "organization123"
}
```