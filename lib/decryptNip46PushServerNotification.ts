import * as Notifications from "expo-notifications";
import { Event, getPublicKey } from "nostr-tools";
import { Nip04 } from "./nip04";
import { AppConnection, store } from "./store";
import { NostrRPCRequest } from "./rpc";

export type DecryptResult = {
  event: Event;
  appConnection: AppConnection;
  payload: NostrRPCRequest;
};

export async function decryptNip46PushServerNotification(
  notification: Notifications.Notification
): Promise<DecryptResult> {
  console.log(
    "decrypting notification:",
    notification,
    notification.request.content.data
  );
  const event = notification.request.content.data as Event;

  try {
    console.log("Decrypting", event.pubkey);
    // TODO: move to store
    const privateKey = await store.getPrivateKey();
    const nip04 = new Nip04(privateKey);
    const plaintext = await nip04.decrypt(event.pubkey, event.content);

    if (!plaintext) throw new Error("failed to decrypt event");
    const payload: NostrRPCRequest = JSON.parse(plaintext);
    console.log("Decrypted", payload);

    // TODO: should not have to retrieve all app connections to find the right one
    const appConnections = await store.getAppConnections();
    const appConnection = appConnections.find(
      (connection) => connection.publicKey === event.pubkey
    );
    if (!appConnection) {
      throw new Error(
        "No app connection found for app pubkey: " + event.pubkey
      );
    }

    return { appConnection, payload, event };

    // TODO: rather than directly replying, launch a notification for the user to choose
    // TODO: show a signing page
  } catch (error) {
    // TODO: show an error toast?
    console.error("Failed to handle push notification", error);
    throw error;
  }

  //schedulePushNotification("<AppName> requested your pubkey", event, request);

  //setNotification(notification);
}
