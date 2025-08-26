
/* eslint @typescript-eslint/no-explicit-any: 0 */
import CID from "./cid.js";

export type WEASLOptions = {
  store?: WEASLStore,
};

export type WEASLMethod = 'put' | 'get' | 'has' | 'delete';

// XXX
// - async init/shutdown
// - #interfaces: []

export abstract class WEASLResponse {
  ok: boolean;
  method: WEASLMethod;
  error?: string;
  cid: CID;
  constructor (cid: CID | string, method: WEASLMethod, error?: string) {
    if (typeof cid === 'string') cid = new CID(cid);
    this.cid = cid;
    this.method = method;
    if (error) {
      this.error = error;
      this.ok = false;
    }
    else {
      this.ok = true;
    }
  }
  get isRaw () { return this.cid.isRaw;  }
  get isData () { return this.cid.isData;  }
  abstract data (): Promise<any>;
  abstract stream (): Promise<ReadableStream>;
  abstract bytes (): Promise<Uint8Array>;
}

export abstract class WEASLStore {
  // constructor (options?);
  abstract init (ctx?: WEASL): Promise<void>;
  abstract shutdown (ctx?: WEASL): Promise<void>;
  abstract putRaw (raw: Uint8Array | ReadableStream): Promise<CID>;
  abstract putData (data: any): Promise<CID>;
  abstract get (cid: CID | string): Promise<WEASLResponse>;
  abstract has (cid: CID | string): Promise<WEASLResponse>;
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
  async init () {
    await Promise.all([this.#store].filter(Boolean).map(v => v.init(this)));
  }
  async shutdown () {
    await Promise.all([this.#store].filter(Boolean).map(v => v.shutdown(this)));
  }
  async putRaw (raw: Uint8Array | ReadableStream): Promise<CID> {
    return this.#store.putRaw(raw);
    // XXX notify interfaces with CID when done
  }
  async putData (data: any): Promise<CID> {
    return this.#store.putData(data);
    // XXX notify interfaces with CID when done
  }
  async get (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.get(cid);
  }
  async has (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.has(cid);
  }
  async delete (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.delete(cid);
    // XXX notify interfaces with CID when done
  }
}
