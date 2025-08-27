
/* eslint @typescript-eslint/no-require-imports: 0 */
/* global require */

const { ok, equal, deepEqual } = require('node:assert');
const { WEASL } = require('..');
const { WEASLMemoryStore } = require('../dist/cjs/memory-store');
const { CID } = require('../dist/cjs/cid');
const { rick, loadRickBytes, kitsu, kitsuCID } = require('./common.cjs');

let rickBytes;
before(async () => rickBytes = await loadRickBytes());
describe('Interfaces', () => {
  it('inits', async () => {
    let hasInitialised = false;
    const w = new WEASL({ interfaces: [{
      init (ctx) {
        hasInitialised = true;
        ok(ctx instanceof WEASL, 'init context is correct');
      },
    }] });
    await w.init();
    ok(hasInitialised, 'init ran');
  });
  it('shuts down', async () => {
    let hasShutDown = false;
    const w = new WEASL({ interfaces: [{
      shutdown (ctx) {
        hasShutDown = true;
        ok(ctx instanceof WEASL, 'shutdown context is correct');
      },
    }] });
    await w.shutdown();
    ok(hasShutDown, 'shutdown ran');
  });
  it('notifies puts & deletes', async () => {
    let notifications = [];
    const w = new WEASL({
      store: new WEASLMemoryStore(),
      interfaces: [{
        notify (method, cid) {
          notifications.push([method, cid]);
        },
      }],
    });
    await w.putRaw(rickBytes);
    await w.putData(kitsu);
    await w.delete(rick);
    await w.delete(kitsuCID);
    deepEqual(
      notifications,
      [
        ['put', new CID(rick)],
        ['put', new CID(kitsuCID)],
        ['delete', new CID(rick)],
        ['delete', new CID(kitsuCID)],
      ],
      'notifications are correct'
    );
  });
});
