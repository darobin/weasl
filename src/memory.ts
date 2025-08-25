
/* eslint @typescript-eslint/no-explicit-any: 0 */

import { Cid as CID, toString as stringifyCID } from "@atcute/cid";
import { WEASLResponse, WEASLStore, WEASLMethod } from "./index.js";

export class WEASLMemoryResponse extends WEASLResponse {
  constructor (cid: CID | string, method: WEASLMethod, error?: string) {
    super(cid, method, error);
  }
  async data (): Promise<any> {
    // XXX
    // - check that CID is a data CID, or throw
    // - check that we have the data, or throw
    // - decode and return it
  }
  async stream (): Promise<ReadableStream> {
    // XXX
    // - call bytes
    // - wrap in a stream
  }
  async bytes (): Promise<ArrayBufferView> {
    // XXX
    // - check that CID is a raw CID, or throw
    // - check that we have the data, or throw
    // - return it
  }
}

export default class WEASLMemoryStore implements WEASLStore {
  #memory = {};
  async putRaw (raw: ArrayBufferView | ReadableStream): Promise<void> {
    // XXX
    // - if it's a stream, slurp it into bytes
    // - get a CID for the bytes
    // - store locally
  }
  async putData (data: any): Promise<void> {
    // XXX
    // - encode
    // - get a CID for the bytes
    // - store locally
  }
  async get (cid: CID | string): Promise<WEASLResponse> {
    if (typeof cid !== 'string') cid = stringifyCID(cid);
    if (!this.#memory[cid]) return new WEASLMemoryResponse(cid, 'get', 'Not found');
    return new WEASLMemoryResponse(cid, 'get');
  }
  // Note: this always succeeds, we don't check that it's there
  async delete (cid: CID | string): Promise<WEASLResponse> {
    if (typeof cid !== 'string') cid = stringifyCID(cid);
    delete this.#memory[cid];
    return new WEASLMemoryResponse(cid, 'delete');
  }
}
