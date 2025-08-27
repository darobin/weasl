
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { CID } from "./cid.js";

// Options to create a WEASL
export type WEASLOptions = {
  store?: WEASLStore,
  interfaces?: WEASLInterface[],
};

// The methods supported by WEASL requests
export type WEASLMethod = 'put' | 'get' | 'has' | 'delete';

// Represents a response from a WEASL store, sort of similar to Fetch's Response
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

// Abstract interface for all stores
export abstract class WEASLStore {
  abstract init (ctx?: WEASL): Promise<void>;
  abstract shutdown (ctx?: WEASL): Promise<void>;
  abstract putRaw (raw: Uint8Array | ReadableStream): Promise<CID>;
  abstract putData (data: any): Promise<CID>;
  abstract get (cid: CID | string): Promise<WEASLResponse>;
  abstract has (cid: CID | string): Promise<WEASLResponse>;
  abstract delete (cid: CID | string): Promise<WEASLResponse>;
}

// Abstract interface for all interfaces
export abstract class WEASLInterface {
  abstract init (ctx?: WEASL): Promise<void>;
  abstract shutdown (ctx?: WEASL): Promise<void>;
  abstract notify (method: WEASLMethod, cid: CID | string): void;
}

// The concrete access point. Coordinates stores, interfaces, and more. Serves as
// context for the various components that have to work together.
// NOTE
// At this point the indirection of wrapping the store isn't obviously useful
// but the idea is that this will be pluggable in other ways.
export default class WEASL implements WEASLStore {
  #store: WEASLStore;
  #interfaces: WEASLInterface[];
  constructor (options?: WEASLOptions) {
    if (options?.store) this.#store = options.store;
    if (options?.interfaces) this.#interfaces = options.interfaces;
  }
  async init () {
    await Promise.all([this.#store, ...(this.#interfaces || [])].filter(Boolean).map(v => v.init(this)));
  }
  async shutdown () {
    await Promise.all([this.#store, ...(this.#interfaces || [])].filter(Boolean).map(v => v.shutdown(this)));
  }
  notifyAll (method: WEASLMethod, cid: CID | string) {
    if (typeof cid === 'string') cid = new CID(cid);
    (this.#interfaces || []).forEach(intf => intf.notify(method, cid));
  }
  async putRaw (raw: Uint8Array | ReadableStream): Promise<CID> {
    const cid = await this.#store.putRaw(raw);
    this.notifyAll('put', cid);
    return cid;
  }
  async putData (data: any): Promise<CID> {
    const cid = await this.#store.putData(data);
    this.notifyAll('put', cid);
    return cid;
  }
  async get (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.get(cid);
  }
  async has (cid: CID | string): Promise<WEASLResponse> {
    return this.#store.has(cid);
  }
  async delete (cid: CID | string): Promise<WEASLResponse> {
    const res = await this.#store.delete(cid);
    this.notifyAll('delete', cid);
    return res;
  }
}
