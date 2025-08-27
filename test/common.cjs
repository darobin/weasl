
/* eslint @typescript-eslint/no-require-imports: 0 */
/* global require, module */

const { join } = require('node:path');
const { readFile } = require('node:fs/promises');

const rick = 'bafkreifn5yxi7nkftsn46b6x26grda57ict7md2xuvfbsgkiahe2e7vnq4';
const rickPath = join(module.path, 'fixtures/rick.jpg');
let rickBytes;

async function loadRickBytes () {
  return new Uint8Array(await readFile(rickPath));
}

const kitsu = {
  name: 'Kitsune',
  age: 4,
  friends: ['Noodle', 'Bouboule'],
};
const kitsuCID = 'bafyreieoixmlaun3q36lsmrwlr7uu7xxveocv7hs77rfdmmnp5gkldrlz4';

module.exports = {
  rick,
  rickPath,
  rickBytes,
  loadRickBytes,
  kitsu,
  kitsuCID,
};
