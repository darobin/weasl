
/* eslint @typescript-eslint/no-require-imports: 0 */
/* global require, module */

const { ok, equal, deepEqual } = require('node:assert');
const { join } = require('node:path');
const { readFile } = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { Readable: { toWeb } } = require('node:stream');
// const module = require('node:module');
const { default: WEASL } = require('..');
// NOTE: CJS doesn't work with package.json#exports in a way that allows us to
// require('../memory-store').
const { default: WEASLMemoryStore } = require('../dist/cjs/memory-store');

const rick = 'bafkreifn5yxi7nkftsn46b6x26grda57ict7md2xuvfbsgkiahe2e7vnq4';
const rickPath = join(module.path, 'fixtures/rick.jpg');

describe('Stores', () => {
  it('inits', async () => {
    let hasInitialised = false;
    const store = {
      init (ctx) {
        hasInitialised = true;
        ok(ctx instanceof WEASL, 'init context is correct');
      },
    };
    const w = new WEASL({ store });
    await w.init();
    ok(hasInitialised, 'init ran');
  });
  it('shuts down', async () => {
    let hasShutDown = false;
    const store = {
      shutdown (ctx) {
        hasShutDown = true;
        ok(ctx instanceof WEASL, 'shutdown context is correct');
      },
    };
    const w = new WEASL({ store });
    await w.shutdown();
    ok(hasShutDown, 'shutdown ran');
  });
  it('stores raw array', async () => {
    const store = new WEASLMemoryStore();
    const w = new WEASL({ store });
    const rickBytes = await readFile(rickPath);
    const cid = await w.putRaw(rickBytes);
    equal(cid.toString(), rick, 'correct CID for putRaw');
    const bytesBack = await (await w.get(cid)).bytes();
    equal(bytesBack, rickBytes, 'the bytes are the same for putRaw');
  });
  it('stores raw stream', async () => {
  });
  it('stores data', async () => {
  });
  it('fetches raw array', async () => {
  });
  it('fetches raw stream', async () => {
  });
  it('fetches data', async () => {
  });
});
