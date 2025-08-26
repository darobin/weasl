
import { Cid, fromString as parseCID, toString as stringifyCID, toCidLink, CODEC_RAW, CODEC_DCBOR } from "@atcute/cid";

// We wrap atcute's CIDs in our own type that has built-in toString & toJSON so
// people don't need to know how to deal with it.
export default class CID {
  #cid: Cid;
  #string: string;
  constructor (cid?: string | Cid) {
    if (cid) {
      if (typeof cid === 'string') {
        this.#cid = parseCID(cid);
        this.#string = cid;
      }
      else {
        this.#cid = cid;
        this.#string = stringifyCID(cid);
      }
    }
  }
  get version () { return 1; }
  get codec () { return this.#cid?.codec; }
  get digest () { return this.#cid?.digest; }
  get bytes () { return this.#cid?.bytes; }
  get isRaw () { return (this.#cid.codec === CODEC_RAW); }
  get isData () { return (this.#cid.codec === CODEC_DCBOR); }
  toString () { return this.#string;  }
  toJSON () { return toCidLink(this.#cid);  }
}
