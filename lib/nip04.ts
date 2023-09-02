// copied from Alby extension as it does not require crypto.subtle

import * as secp256k1 from "@noble/secp256k1";
import { AES, enc } from "crypto-js";
import * as CryptoJS from "crypto-js";
import Hex from "crypto-js/enc-hex";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";

export class Nip04 {
  privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  encrypt(pubkey: string, text: string) {
    try {
      const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
      const normalizedKey = Buffer.from(key.slice(1, 33));
      const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
      const hexKey = Hex.parse(hexNormalizedKey);

      const encrypted = AES.encrypt(text, hexKey, {
        iv: CryptoJS.lib.WordArray.random(16),
      });

      return `${encrypted.toString()}?iv=${encrypted.iv.toString(
        CryptoJS.enc.Base64
      )}`;
    } catch (error) {
      console.error("ENCRYPT FAILED", error);
      throw error;
    }
  }

  async decrypt(pubkey: string, ciphertext: string) {
    const [cip, iv] = ciphertext.split("?iv=");
    const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
    const hexKey = Hex.parse(hexNormalizedKey);

    const decrypted = AES.decrypt(cip, hexKey, {
      iv: Base64.parse(iv),
    });

    return Utf8.stringify(decrypted);
  }
}
