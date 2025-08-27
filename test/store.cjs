
/* eslint @typescript-eslint/no-require-imports: 0 */
/* global require */

const { ok, equal, deepEqual, rejects } = require('node:assert');
const { createReadStream } = require('node:fs');
const { Readable: { toWeb } } = require('node:stream');
// const module = require('node:module');
const { WEASL } = require('..');
// NOTE: CJS doesn't work with package.json#exports in a way that allows us to
// require('../memory-store').
const { WEASLMemoryStore } = require('../dist/cjs/memory-store');
const { CID } = require('../dist/cjs/cid');
const { rick, rickPath, loadRickBytes, kitsu, kitsuCID } = require('./common.cjs');

let rickBytes;
before(async () => rickBytes = await loadRickBytes());
describe('Stores', () => {
  it('inits', async () => {
    let hasInitialised = false;
    const w = new WEASL({ store: {
      init (ctx) {
        hasInitialised = true;
        ok(ctx instanceof WEASL, 'init context is correct');
      },
    } });
    await w.init();
    ok(hasInitialised, 'init ran');
  });
  it('shuts down', async () => {
    let hasShutDown = false;
    const w = new WEASL({ store: {
      shutdown (ctx) {
        hasShutDown = true;
        ok(ctx instanceof WEASL, 'shutdown context is correct');
      },
    } });
    await w.shutdown();
    ok(hasShutDown, 'shutdown ran');
  });
  it('stores raw array', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    const cid = await w.putRaw(rickBytes);
    equal(cid.toString(), rick, 'correct CID for putRaw (bytes)');
    const bytesBack = await (await w.get(cid)).bytes();
    deepEqual(bytesBack, rickBytes, 'the bytes are the same for putRaw (bytes)');
  });
  it('stores raw stream', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    const rickStream = toWeb(createReadStream(rickPath));
    const cid = await w.putRaw(rickStream);
    equal(cid.toString(), rick, 'correct CID for putRaw (stream)');
    const bytesBack = await (await w.get(cid)).bytes();
    deepEqual(bytesBack, rickBytes, 'the bytes are the same for putRaw (stream)');
  });
  it('stores data', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    const cid = await w.putData(kitsu);
    equal(cid.toString(), kitsuCID, 'correct CID for putData');
    const dataBack = await (await w.get(cid)).data();
    deepEqual(dataBack, kitsu, 'the data are the same for putData');
  });
  it('fetch errors', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    await w.putData(kitsu);
    await w.putRaw(rickBytes);
    rejects(
      async () => await w.get('bafkreifn5yxi7nkftsn46b6x26grda57ict7md2xuvfbsgkiahe2e7vnq5'),
      {
        message: /Not found/,
      },
      'errors for not found'
    );
    rejects(
      async () => await (await w.get(kitsuCID)).bytes(),
      {
        message: /Cannot request bytes\(\) for a data CID/,
      },
      'errors asking bytes for data'
    );
    rejects(
      async () => await (await w.get(kitsuCID)).stream(),
      {
        message: /Cannot request stream\(\) for a data CID/,
      },
      'errors asking stream for data'
    );
    rejects(
      async () => await (await w.get(rick)).data(),
      {
        message: /Cannot request data\(\) for a raw CID/,
      },
      'errors asking data for raw'
    );
  });
  it('fetches raw', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    await w.putRaw(rickBytes);
    const res = await w.get(rick);
    ok(res.ok, 'response is ok');
    ok(!res.error, 'response has no error');
    equal(res.method, 'get', 'response method is get');
    deepEqual(res.cid, new CID(rick), 'response got the right CID');
    ok(res.isRaw, 'response is raw');
    ok(!res.isData, 'response is not data');
  });
  it('fetches data', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    await w.putData(kitsu);
    const res = await w.get(kitsuCID);
    ok(res.ok, 'response is ok');
    ok(!res.error, 'response has no error');
    equal(res.method, 'get', 'response method is get');
    deepEqual(res.cid, new CID(kitsuCID), 'response got the right CID');
    ok(!res.isRaw, 'response is not raw');
    ok(res.isData, 'response is data');
  });
  it('has & delete', async () => {
    const w = new WEASL({ store: new WEASLMemoryStore() });
    await w.putRaw(rickBytes);
    await w.putData(kitsu);
    ok(await w.has(rick), 'has raw');
    ok(await w.has(kitsuCID), 'has data');
    await w.delete(rick);
    await w.delete(kitsuCID);
    ok(!(await w.has(rick)), 'deletes raw');
    ok(!(await w.has(kitsuCID)), 'deletes data');
  });
});
