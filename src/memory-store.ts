
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ReadableStream } from 'node:stream/web'; // make sure this is replaced in browser
import { arrayBuffer } from 'node:stream/consumers';
import { create, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { encode, decode } from '@atcute/cbor';
import { WEASLResponse, WEASLStore, WEASLMethod } from "./index.js";
import { CID } from "./cid.js";

export class WEASLMemoryResponse extends WEASLResponse {
  #payload: Uint8Array;
  constructor (cid: CID | string, method: WEASLMethod, error?: string) {
    super(cid, method, error);
  }
  async data (): Promise<any> {
    if (!this.isData) throw new Error(`Cannot request data() for a raw CID.`);
    if (!this.#payload) throw new Error(`Cannot get data() from empty response.`);
    return decode(this.#payload);
  }
  async stream (): Promise<ReadableStream> {
    return ReadableStream.from(await this.bytes());
  }
  async bytes (): Promise<Uint8Array> {
    if (!this.isRaw) throw new Error(`Cannot request bytes() for a data CID.`);
    if (!this.#payload) throw new Error(`Cannot get bytes() from empty response.`);
    return this.#payload;
  }
  setPayload (payload: Uint8Array): void {
    this.#payload = payload
  }
}

export class WEASLMemoryStore implements WEASLStore {
  #memory = {};
  async init () {
    this.#memory = {};
  }
  async shutdown () {
    this.#memory = {};
  }
  async putRaw (raw: Uint8Array | ReadableStream): Promise<CID> {
    if (raw instanceof ReadableStream) raw = new Uint8Array(await arrayBuffer(raw));
    else raw = new Uint8Array(raw); // need a new object
    const atCID = await create(CODEC_RAW, raw);
    const cid = new CID(atCID);
    this.#memory[cid.toString()] = raw;
    return cid;
  }
  async putData (data: any): Promise<CID> {
    const bytes = encode(data);
    const atCID = await create(CODEC_DCBOR, bytes);
    const cid = new CID(atCID);
    this.#memory[cid.toString()] = bytes;
    return cid;
  }
  async get (cid: CID | string): Promise<WEASLResponse> {
    cid = cid.toString();
    if (!this.#memory[cid]) return new WEASLMemoryResponse(cid, 'get', 'Not found');
    const res = new WEASLMemoryResponse(cid, 'get');
    res.setPayload(this.#memory[cid]);
    return res;
  }
  async has (cid: CID | string): Promise<boolean> {
    if (!this.#memory[cid.toString()]) return false;
    return true;
  }
  // Note: this always succeeds, we don't check that it's there
  async delete (cid: CID | string): Promise<WEASLResponse> {
    delete this.#memory[cid.toString()];
    return new WEASLMemoryResponse(cid, 'delete');
  }
}
