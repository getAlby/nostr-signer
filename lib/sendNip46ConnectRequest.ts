import { AppConnection, store } from "./store";
import { NostrSigner } from "./nostr";
import { getPublicKey } from "nostr-tools";

export async function sendNip46ConnectRequest(appConnection: AppConnection) {
  try {
    const privateKey = await store.getPrivateKey();
    const handler = new NostrSigner({
      secretKey: privateKey,
      relay: appConnection.relay,
    });

    const result = await handler.call({
      target: appConnection.publicKey,
      request: {
        method: "connect",
        params: [getPublicKey(privateKey)],
      },
    });
    console.log("REQUEST RESULT:", result);
    await handler.disconnect();
  } catch (error) {
    console.error("Connection failed", error);
    throw error;
  }
}
