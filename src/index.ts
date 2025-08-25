
/* eslint @typescript-eslint/no-explicit-any: 0 */

import { Cid as CID, fromString as parseCID, CODEC_RAW } from "@atcute/cid";

export type WEASLOptions = {
  store?: WEASLStore,
};

export type WEASLMethod = 'put' | 'get' | 'delete';

export abstract class WEASLResponse {
  ok: boolean;
  method: WEASLMethod;
  error?: string;
  isRaw: boolean;
  isData: boolean;
  cid: CID;
  constructor (cid: CID | string, method: WEASLMethod, error?: string) {
    if (typeof cid === 'string') cid = parseCID(cid);
    this.cid = cid;
    this.method = method;
    if (error) {
      this.error = error;
      this.ok = false;
    }
    else {
      this.ok = true;
    }
    this.isRaw = (cid.codec === CODEC_RAW);
    this.isData = !this.isRaw;
  }
  abstract data (): Promise<any>;
  abstract stream (): Promise<ReadableStream>;
  abstract bytes (): Promise<ArrayBufferView>;
}

export abstract class WEASLStore {
  // constructor (options?);
  abstract putRaw (raw: ArrayBufferView | ReadableStream): Promise<void>;
  abstract putData (data: any): Promise<void>;
  abstract get (cid: CID | string): Promise<WEASLResponse>;
  abstract delete (cid: CID | string): Promise<WEASLResponse>;
}

// NOTE
// At this point the indirection of wrapping the store isn't obviously useful
// but the idea is that this will be pluggable in other ways.
export default class WEASL implements WEASLStore {
  #store: WEASLStore;
  constructor (options?: WEASLOptions) {
    if (options?.store) this.#store = options.store;
  }
  async putRaw (raw: ArrayBufferView | ReadableStream): Promise<void> {
    return this.#store.putRaw(raw);
  }
  async putData (data: any): Promise<void> {
    return this.#store.putData(data);
  }
  async get (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.get(cid);
  }
  async delete (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.delete(cid);
  }
}
