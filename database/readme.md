# Database Schema

Reference guide to database architecture and design.

## Users

## Resources

## Organizations

## Products

## Warehouses

## Handles

Set of key value pairs to redirect user to organization page. When a user visits `communalists.com/organizations/sbma` we are grab the organization's UID and load the page.

```js
{
	"sbma": "organization123"
}
```