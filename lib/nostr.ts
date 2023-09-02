// modifed from https://github1s.com/nostr-connect/connect/blob/master/src/nostr.ts
import { NostrRPC } from "./rpc";

export class NostrSigner extends NostrRPC {
  async disconnect(): Promise<null> {
    this.events.emit("disconnect");
    return null;
  }
  isConnected(): boolean {
    throw new Error("Method not implemented yet.");
  }
}
