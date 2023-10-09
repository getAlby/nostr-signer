// modifed from https://github1s.com/nostr-connect/connect/blob/master/src/rpc.ts
import EventEmitter from "events";
import {
  Event,
  Filter,
  finishEvent,
  getEventHash,
  getPublicKey,
  getSignature,
  Relay,
  relayInit,
  signEvent,
  Sub,
  validateEvent,
  verifySignature,
} from "nostr-tools";
import { Nip04 } from "./nip04";

export interface NostrRPCRequest {
  id: string;
  method: string;
  params: any[];
}
export interface NostrRPCResponse {
  id: string;
  result: any;
  error: any;
}

export class NostrRPC {
  relay: string;
  self: { pubkey: string; secret: string };
  event: Event | undefined;
  // this is for implementing the response handlers for each method
  [key: string]: any;
  // events
  events = new EventEmitter();
  private _relay: Relay;

  constructor(opts: { relay?: string; secretKey: string }) {
    console.log("Connecting to relay:", opts.relay);
    this.relay = opts.relay || "wss://nostr.vulpem.com";
    this.self = {
      pubkey: getPublicKey(opts.secretKey),
      secret: opts.secretKey,
    };
  }

  async call(
    {
      target,
      request: { id = randomID(), method, params = [] },
    }: {
      target: string;
      request: {
        id?: string;
        method: string;
        params?: any[];
      };
    },
    opts?: { skipResponse?: boolean; timeout?: number }
  ): Promise<any> {
    // connect to relay
    const relay = await connectToRelay(this.relay);
    console.log("Connected to relay", relay);

    // prepare request to be sent
    const request = prepareRequest(id, method, params);
    const event = await prepareEvent(this.self.secret, target, request);
    console.log("Preparing event", event);

    return new Promise<void>(async (resolve, reject) => {
      const sub = relay.sub([
        {
          kinds: [24133],
          authors: [target],
          "#p": [this.self.pubkey],
          limit: 1,
        } as Filter,
      ]);

      console.log("Waiting for events");
      sub.on("event", async (event: Event) => {
        console.log("Got event", event);
        let payload;
        /* eslint-disable @typescript-eslint/no-unused-vars */
        try {
          const plaintext = await new Nip04(this.self.secret).decrypt(
            event.pubkey,
            event.content
          );
          if (!plaintext) throw new Error("failed to decrypt event");
          payload = JSON.parse(plaintext);
        } catch (error) {
          console.error(error);
          return;
        }

        // ignore all the events that are not NostrRPCResponse events
        if (!isValidResponse(payload)) return;

        // ignore all the events that are not for this request
        if (payload.id !== id) return;

        // if the response is an error, reject the promise
        if (payload.error) {
          reject(payload.error);
        }

        // if the response is a result, resolve the promise
        if (payload.result) {
          resolve(payload.result);
        }
      });

      console.log("Broadcasting to relay");
      await broadcastToRelay(relay, event, false);
      console.log("Broadcasted to relay");

      // skip waiting for response from remote
      if (opts && opts.skipResponse === true) resolve();
    });
  }

  async listen(): Promise<Sub> {
    this._relay = await connectToRelay(this.relay);

    const sub = this._relay.sub([
      {
        kinds: [24133],
        "#p": [this.self.pubkey],
        since: now(),
      } as Filter,
    ]);

    sub.on("event", async (event: Event) => {
      console.info("Got event!", event);
      let payload: NostrRPCRequest;
      /* eslint-disable @typescript-eslint/no-unused-vars */
      try {
        const plaintext = await new Nip04(this.self.secret).decrypt(
          event.pubkey,
          event.content
        );
        if (!plaintext) throw new Error("failed to decrypt event");
        payload = JSON.parse(plaintext);
      } catch (error) {
        console.error("Failed to parse event", error);
        return;
      }

      // ignore all the events that are not NostrRPCRequest events
      if (!isValidRequest(payload)) return;

      // handle request
      if (typeof this[payload.method] !== "function") Promise.resolve();
      this[payload.method](event, payload);
    });

    return sub;
  }

  async reply(response: NostrRPCResponse, event: Event) {
    this._relay = this._relay || (await connectToRelay(this.relay));

    const body = prepareResponse(response.id, response.result, response.error);

    const responseEvent = await prepareEvent(
      this.self.secret,
      event.pubkey,
      body
    );

    // send response via relay
    this._relay.publish(responseEvent);
  }
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}
export function randomID(): string {
  return Math.random().toString().slice(2);
}
export function prepareRequest(
  id: string,
  method: string,
  params: any[]
): string {
  return JSON.stringify({
    id,
    method,
    params,
  });
}
export function prepareResponse(id: string, result: any, error: any): string {
  return JSON.stringify({
    id,
    result,
    error,
  });
}
export async function prepareEvent(
  secretKey: string,
  pubkey: string,
  content: string
): Promise<Event> {
  const cipherText = await new Nip04(secretKey).encrypt(pubkey, content);

  const event: Event = {
    kind: 24133,
    created_at: now(),
    pubkey: getPublicKey(secretKey),
    tags: [["p", pubkey]],
    content: cipherText,
    id: "",
    sig: "",
  };

  const signedEvent = finishEvent(event, secretKey);
  const ok = validateEvent(signedEvent);
  const veryOk = verifySignature(signedEvent);
  if (!ok || !veryOk) {
    throw new Error("Event is not valid");
  }

  return signedEvent;
}

export function isValidRequest(payload: any): boolean {
  if (!payload) return false;

  const keys = Object.keys(payload);
  if (
    !keys.includes("id") ||
    !keys.includes("method") ||
    !keys.includes("params")
  )
    return false;

  return true;
}

export function isValidResponse(payload: any): boolean {
  if (!payload) return false;

  const keys = Object.keys(payload);
  if (
    !keys.includes("id") ||
    !keys.includes("result") ||
    !keys.includes("error")
  )
    return false;

  return true;
}

export async function connectToRelay(relayURL: string) {
  const relay = relayInit(relayURL);
  await relay.connect();
  await new Promise<void>((resolve, reject) => {
    relay.on("connect", () => {
      console.log("RELAY CONNECTED!");
      resolve();
    });
    relay.on("error", () => {
      reject(new Error(`not possible to connect to ${relay.url}`));
    });
  });
  return relay;
}
export async function broadcastToRelay(
  relay: Relay,
  event: Event,
  skipSeen: boolean = false
) {
  // send request via relay
  return await new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        relay.on("error", () => {
          reject(new Error(`failed to connect to ${relay.url}`));
        });
        console.log("Publishing...");
        await relay.publish(event);
        console.log("Published");
        resolve();
      } catch (error) {
        console.error(error);
        reject(error);
      }
    })();
    /*pub.on('failed', (reason: any) => {
      reject(reason);
    });
    pub.on('ok', () => {
      resolve();
    });*/
  });
}
