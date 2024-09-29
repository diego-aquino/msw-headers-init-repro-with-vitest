# Reproduction of header values being lost in `Request` and `fetch` with `msw@>=2.4.4`

> This reproduction was created from the example
> [with-vitest](https://github.com/mswjs/examples/tree/main/examples/with-vitest).

## How this reproduction works

The directory `tests` contains two identical suites, except for the imported MSW
version:

- `passing-on-v2.4.3.test.ts` - This suite is using `msw@2.4.3` and passes.
- `failing-on-v2.4.9.test.ts` - This suite is using `msw@2.4.9` and fails.

Before starting the MSW server, each suite creates a `Headers` instance with
initial values, appends a new header and checks if the initial values are
preserved and the instance contains the correct values.

```ts
// Create headers with init values before starting the server
const headers = new Headers({
  accept: 'application/json',
  'cache-control': 'no-cache',
});

// Check if the headers have the correct values
expect(headers.get('accept')).toBe('application/json');
expect(headers.get('cache-control')).toBe('no-cache');

// Check if the headers keep their values when used in a request
expect(
  Object.fromEntries(new Request('http://localhost:3000', { headers }).headers),
).toEqual(Object.fromEntries(headers));

// Append a new header value
headers.append('accept', 'application/xml');

// Check if the headers have the correct values
expect(headers.get('accept')).toBe('application/json, application/xml');
expect(headers.get('cache-control')).toBe('no-cache');

// Check if the headers keep their values when used in a request
expect(
  Object.fromEntries(new Request('http://localhost:3000', { headers }).headers),
).toEqual(Object.fromEntries(headers));
```

After starting the server with `server.listen()`, the suites append yet another
header to the instance and re-run the checks. With `msw@2.4.3`, the existing
values are preserved and the new header is appended. However, the current
headers are lost with `msw@2.4.9` when used in a `Request` or `fetch` call. The
only kept header is the one appended _after_ starting the server, as if the
instance was empty before.

```ts
// Start the server
server.listen();

// Check if the headers still have the same values
expect(headers.get('accept')).toBe('application/json, application/xml');
expect(headers.get('cache-control')).toBe('no-cache');

// Append a new header value
headers.append('accept', 'text/plain');

// Check if the init values were preserved and the new header was added
expect(headers.get('accept')).toBe(
  'application/json, application/xml, text/plain',
);
expect(headers.get('cache-control')).toBe('no-cache');

// Check if the headers keep their values when used in a request
//
// ==> This assertion fails with msw@2.4.9
//
expect(
  Object.fromEntries(new Request('http://localhost:3000', { headers }).headers),
).toEqual(Object.fromEntries(headers));
```

The problem does not appear to occur when using the headers directly, because
only the last expect reading the headers from a `Request` fails.

## Getting started

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Run the tests:

   ```bash
   npm run test
   ```

The suite `passing-on-v2.4.3.test.ts` should pass, while
`failing-on-v2.4.9.test.ts` should fail.
