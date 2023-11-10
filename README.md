# d1-api

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]

`d1-api` is a package for interacting with [Cloudflare D1](https://developers.cloudflare.com/d1/) outside of Cloudflare Workers, and tries to match the D1 client API used in Workers.

It uses the [D1 HTTP API](https://developers.cloudflare.com/api/operations/cloudflare-d1-query-database) to run queries on your SQLite database. The D1 HTTP API has significate overhead which results in about half a second of latency on every query. This is intended and is not planned to be fixed by Cloudflare.

`fetch` is required (available in Node 18+ and other runtimes).

## Install

```bash
npm install d1-api
```

```bash
pnpm install d1-api
```

```bash
yarn add d1-api
```

TypeScript typings are included with the package.

## Usage

Remove type annotations (`<{ id: number}>`) to translate to JavaScript.

```ts
import D1API from 'd1-api';

const d1api = new D1API({
  accountId: 'account-id',
  apiKey: 'api-key',
  databaseId: 'database-id',
});

// TypeScript is fully supported.
type User = { id: number };

// Return results of all rows. Tagged template is used to prepare statements.
const response = await d1api.all<User>`SELECT * FROM users WHERE id = ${1}`;
// {
//   success: true,
//   // Row data here.
//   results: [
//     {
//       id: 1
//     }
//   ],
//   // Metadata such as duration, rows read/written, changed, etc.
//   meta: { ... }
// }

// Return first row. Returns null if no result.
// Tagged template is used to prepare statements.
const response = await d1api.first<User>`SELECT * FROM users WHERE id = ${1}`;
// {
//   id: 1
// }

// Execute a query. Tagged template is used to prepare statements.
const response =
  await d1api.exec<User>`UPDATE users SET id = ${1} WHERE id = ${2} RETURNING *`;
// {
//   success: true,
//   result: [
//     {
//       success: true,
//       // Row data here. Can be empty if non-SELECT statement
//       results: [
//         {
//           id: 1
//         }
//       ],
//       // Metadata such as duration, rows read/written, changed, etc.
//       meta: { ... }
//     }
//   ],
//   // Query errors. A D1Error is thrown if any errors are present.
//   errors: [],
//   // Messages/warnings are in the format of: { code: 1000, message: "Some message" }
//   messages: [],
// }
```

## API

### `new D1API(options)`

The `options` object requires the following fields:

- `accountId`: Your Cloudflare account ID. This can be found as the ID in the URL on the dashboard after `dash.cloudflare.com/`, or in the sidebar of a zone.
- `apiKey`: Your Cloudflare API key. This can be created under the user icon in the top-right under "My Profile", then "API Tokens" in the sidebar. Make sure to have D1 write access (even if you are just reading from the database).
- `databaseId`: Your Cloudflare D1 database ID. This can be found on the D1 page.

#### Response

Same as `D1API.exec`.

### `` D1API.all`SELECT * FROM user WHERE id = ${id}` ``

Returns result of all rows with tagged template.

You can reuse parameters inside the query by manually mapping them to `?N`. Example: `SELECT * FROM user WHERE id = ${id} AND age = ?1`. This will filter where both `id` and `age` are equal to 1. This is not recommended as it can be error prone.

#### Response

```json5
{
  success: true,
  // Row data here.
  results: [
    {
      id: 1
    }
  ],
  // Metadata such as duration, rows read/written, changed, etc.
  meta: { ... }
}
```

### `D1API.allRaw("SELECT * FROM user WHERE id = ?1", [id])`

Returns result of all rows with parameters binded using `?N`, where N is the index of the paramter (starting at 1).

Prefer using `all` with tagged template.

#### Response

Same as `D1API.all`.

### `` D1API.first`SELECT * FROM user WHERE id = ${id}` ``

Returns first row with tagged template.

You can reuse parameters inside the query by manually mapping them to `?N`. Example: `SELECT * FROM user WHERE id = ${id} AND age = ?1`. This will filter where both `id` and `age` are equal to 1. This is not recommended as it can be error prone.

#### Response

```json5
{
  id: 1,
}
```

### `D1API.firstRaw("SELECT * FROM user WHERE id = ?1", [id])`

Returns first row with parameters binded using `?N`, where N is the index of the paramter (starting at 1).

Prefer using `first` with tagged template.

#### Response

Same as `D1API.first`.

### `` D1API.exec`SELECT * FROM user WHERE id = ${id}` ``

Executes a query on the D1 API with tagged template.

You can reuse parameters inside the query by manually mapping them to `?N`. Example: `SELECT * FROM user WHERE id = ${id} AND age = ?1`. This will filter where both `id` and `age` are equal to 1. This is not recommended as it can be error prone.

#### Response

```json5
{
  success: true,
  result: [
    {
      success: true,
      // Row data here. Can be empty if non-SELECT statement
      results: [
        {
          id: 1
        }
      ],
      // Metadata such as duration, rows read/written, changed, etc.
      meta: { ... }
    }
  ],
  // Query errors. A D1Error is thrown if any errors are present.
  errors: [],
  // Messages/warnings are in the format of: { code: 1000, message: "Some message" }
  messages: [],
}
```

### `D1API.execRaw("SELECT * FROM user WHERE id = ?1", [id])`

Executes a query on the D1 API with parameters binded using `?N`, where N is the index of the paramter (starting at 1).

Prefer using `exec` with tagged template.

### `D1Error`

Error throw when the `errors` field is returned non-empty from the D1 API. It contains the `errors` field set to the errors, in the format of:

```json5
{
  code: 1000,
  message: 'Some error',
}
```

You can use the `body` field to get the original response.

[downloads-img]: https://img.shields.io/npm/dt/d1-api
[downloads-url]: https://www.npmtrends.com/d1-api
[npm-img]: https://img.shields.io/npm/v/d1-api
[npm-url]: https://www.npmjs.com/package/d1-api
[issues-img]: https://img.shields.io/github/issues/Cretezy/d1-api
[issues-url]: https://github.com/Cretezy/d1-api/issues
