// The only change from passing-on-2.4.3.test.ts is that we're importing msw@2.4.9 here.
import { setupServer } from 'msw-2.4.9/node';

import { it, expect } from 'vitest';

const server = setupServer();

it('preserves init values in headers created before the server was started', () => {
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
    Object.fromEntries(
      new Request('http://localhost:3000', { headers }).headers,
    ),
  ).toEqual(Object.fromEntries(headers));

  // Append a new header value
  headers.append('accept', 'application/xml');

  // Check if the headers have the correct values
  expect(headers.get('accept')).toBe('application/json, application/xml');
  expect(headers.get('cache-control')).toBe('no-cache');

  // Check if the headers keep their values when used in a request
  expect(
    Object.fromEntries(
      new Request('http://localhost:3000', { headers }).headers,
    ),
  ).toEqual(Object.fromEntries(headers));

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
    Object.fromEntries(
      new Request('http://localhost:3000', { headers }).headers,
    ),
  ).toEqual(Object.fromEntries(headers));
});
