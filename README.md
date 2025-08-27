
# WEASL — Warehouse that's Extensible for Arbitrary Structures & Links (WEASL)

WEASL is an experimental API framework to store and retrieve [DASL](https://dasl.ing/) data.
The goal, if the experiment is deemed successful, is to add storage backends, interfaces to
expose the data, indexing methods, etc.

```js
import { WEASL } from '@dasl/weasl';
import { WEASLMemoryStore } from '@dasl/weasl/memory-store.js';

const w = new WEASL({ store: new WEASLMemoryStore() });

const bytesCID = await w.putRaw(someBytes);
const otherBytesCID = await w.putRaw(someReadableStream);
const dataCID = await w.putData({
  cat: 'Kitsune',
  age: 4,
  picture: { $link: 'bafkreifn5yxi7nkftsn46b6x26grda57ict7md2xuvfbsgkiahe2e7vnq4' },
});

const r = await w.get(dataCID);
if (r.ok) {
  const data = await r.data();
}
else {
  console.warn(`Oh no: ${r.error}`);
}

if (await r.has(otherBytesCID)) {
  console.log('We have it');
}

await r.delete(bytesCID); // bye
```

## API

The core of WEASL is that you can put either raw or structured data, and then get it back using
its CID (Content IDentifier). It's meant to make working with content-addressed data
easy, something that you do without needing to think about it.

The `CID` class is a thin wrapper around `@atcute/cid`. Every method that accepts
CIDs can take either a `CID` or a string DASL CID, and every method that returns
a CID uses the `CID` class.

Of specific interest, `CID` instances automatically stringify to the string CID
(via `toString`) and automatically serialised to `{ "$link": "<cid>" }` in JSON
contexts (via `toJSON`).

- `version`: always 1.
- `codec`: the numeric value indicating either `0x55` for raw data or `0x71` for DRISL
  (but you're better off using `isRaw`/`isData`).
- `digest.codec`: the numeric value indicating the hash type, always `0x12` for SHA-256.
- `digest.contents`: raw hash bytes.
- `bytes`: raw CID bytes.
- `isRaw`: true if it's a raw CID.
- `isData`: true if it's a data CID (DRISL).
- `toString()`: stringifies to the DASL CID.
- `toJSON()`: serialises to `{ "$link": "<string-cid>" }` in JSON.

The `WEASL` class is the key entry point.

- `new WEASL(options)`: where `options` can contain a `store` (needed if you want
  to actually store anything) and an array of `interfaces` that get notified of
  activity on the store and can provide access to it (e.g. over HTTP).
- `async init()`: calls init on the store and all interfaces, resolves when they
  all have.
- `async shutdown()`: calls shutdown on the store and all interfaces, resolves when they
  all have.
- `async putRaw (raw: Uint8Array | ReadableStream): Promise<CID>`: used to put raw
  data in the store, and returns a CID for it.
- `async putData (data: any): Promise<CID>`: used to put data in the store, automatically
  serialising it to DRISL, and returning a CID for it. Note that `{ "$link": "<cid>" }`
  constructs automatically get converted to Tag42 CID links in the DRISL.
- `async get (cid: CID | string): Promise<WEASLResponse>`: given a CID, returns a
  response object that tells you whether it was successful, gives you access to the
  data, etc.
- `async has (cid: CID | string): Promise<boolean>`: tells you whether the store has
  a given CID or not.
- `async delete (cid: CID | string): Promise<WEASLResponse>`: removes a given CID
  from the store.

A `WEASLResponse` has:

- `ok`: true if successful.
- `method`: the method that was called to produce this, `get` or `delete`.
- `error`: a string if there was an error.
- `cid`: the `CID` for the request.
- `isRaw`: true if it's a raw CID.
- `isData`: true if it's a data CID (DRISL).
- `async data (): Promise<any>`: return the decoded data, only for data CIDs.
- `async stream (): Promise<ReadableStream>`: returns a stream for the raw data,
  only for raw CIDs.
- `async bytes (): Promise<Uint8Array>`: returns bytes for the raw data,
  only for raw CIDs.

The in-memory store is very bare bones:

```js
import { WEASLMemoryStore } from '@dasl/weasl/memory-store.js';
const store = new WEASLMemoryStore();
```

It's mostly good for testing or for simple things. It's a good place to start from
if you want to write a store.

## Future

Here are some stores we have in mind:

- [x] Memory
- [ ] File system
- [ ] SQLite, Pg…
- [ ] Kubo, Helia

And some interfaces:

- [ ] HTTP
