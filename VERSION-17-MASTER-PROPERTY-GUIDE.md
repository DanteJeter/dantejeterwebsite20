# Version 17 — Master Property Editing Guide

## The only property file you normally edit

Open:

`listings-config.js`

Every property now has one master record inside `window.MASTER_PROPERTIES`.
The homepage, Current Listings page, individual property page, related listings,
status labels, prices, hero image, and gallery all read from that same record.

## Changing the price for 333 Patricia Avenue

Find:

```js
"333-patricia-avenue": {
```

Then change only this line:

```js
price: 139000,
```

Enter the number without a dollar sign or comma. The website formats it as
`$139,000` everywhere automatically.

## Changing a status

Change one line, for example:

```js
status: "Pending",
```

Accepted examples include Active, Coming Soon, Price Improvement,
Under Contract, Pending, and Sold.

## Changing photos

Within that same property record, edit `hero`, `assetBase`, or the `photos` list.
The property gallery and listing card image update from the master record.

## Important

The small files `property-config.js` and `property-333-patricia-config.js` are only
page selectors. They identify which master property should appear on a property
page. Do not place prices or listing facts in those selector files.
