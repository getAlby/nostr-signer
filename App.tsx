import applyGlobalPolyfills from "./applyGlobalPolyfills";
applyGlobalPolyfills();
import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Event, getPublicKey } from "nostr-tools";
import { NostrSigner } from "./lib/nostr";
import { NostrRPCRequest } from "./lib/rpc";
import { Nip04 } from "./lib/nip04";

Notifications.setNotificationHandler({
  handleNotification: async (notification: Notifications.Notification) => ({
    shouldShowAlert: true, // TODO: should this be false for the encrypted notifications?
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const sk = "f4b9141b8bb86c873d077218717540da701be15442bd0359227106d1d0fbe392"; //generatePrivateKey();
console.log("SK", sk);

class MobileHandler extends NostrSigner {
  // TODO: handle connect & sign event requests
  // async get_public_key(event: Event, request: NostrRPCRequest): Promise<void> {
  //   // TODO: make sure app is connected first
  //   console.log("Pubkey requested", event, request);
  //   //return getPublicKey(sk);
  //   schedulePushNotification("<AppName> requested your pubkey", event, request);
  // }
}

const respondNotification = (
  allowSign: boolean,
  notification: Notifications.Notification,
  handler: MobileHandler
) => {
  const data = notification.request.content.data as {
    event: Event;
    request: NostrRPCRequest;
  };
  const { id, method } = data.request;
  try {
    if (allowSign) {
      console.log("Signing", notification.request.content.data);

      switch (method) {
        case "get_public_key":
          handler.reply(
            {
              id,
              result: getPublicKey(sk),
              error: null,
            },
            data.event
          );
          break;
        default:
          throw new Error("Unsupported request method: " + method);
      }
    } else {
      throw new Error("Denied");
    }
  } catch (error) {
    console.log("Denying", notification.request.content.data);

    handler.reply(
      {
        id,
        result: null, //getPublicKey(sk),
        error: error.message,
      },
      data.event
    );
  }
};

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  //const relayUrl = "wss://relay.shitforce.one";
  const relayUrl = "wss://relay.damus.io";
  const handler = new MobileHandler({ secretKey: sk, relay: relayUrl });

  useEffect(() => {
    (async () => {
      // 📡 Listen for incoming requests
      // await handler.listen();
    })();

    async function decryptNotification(
      notification: Notifications.Notification
    ) {
      console.log(
        "TODO: handle incoming notification:",
        notification,
        notification.request.content.data
      );
      const event = notification.request.content.data as Event;

      try {
        console.log("Decrypting", event.pubkey);
        const plaintext = await new Nip04(sk).decrypt(
          event.pubkey,
          event.content
        );

        if (!plaintext) throw new Error("failed to decrypt event");
        const payload: NostrRPCRequest = JSON.parse(plaintext);
        console.log("Decrypted", payload);
        // TODO: rather than directly replying, launch a notification for the user to choose
        handler.reply(
          {
            id: payload.id,
            result: getPublicKey(sk),
            error: null,
          },
          event
        );
        console.log("Replied");
      } catch (error) {
        console.error("Failed to parse event", error);
        return;
      }

      //schedulePushNotification("<AppName> requested your pubkey", event, request);

      //setNotification(notification);
    }

    registerForPushNotificationsAsync().then(async (token) => {
      // TODO: only register once
      console.log("Registering expo token with push server");
      try {
        const result = await fetch(
          "https://nip46.regtest.getalby.com/token/expo",
          {
            method: "POST",
            body: JSON.stringify({
              // FIXME: pk here should be pk generated by the NC app (node app right now)
              pk: "d7313505363c3568bd96c2ebef56af98b77a44af5e444b1ea02adf9e8e79bc0b", //getPublicKey(sk), //"6881a7e3de2ae8eb601aef033e0572ed9c11916258abb7f8d8e285de4226ba23", // PUBKEY OF THE APP!
              token,
              channel_id: "default",
            }),
          }
        );
        console.log(result.ok, result.status);
        console.log("response from nip46 push server", await result.text());
      } catch (error) {
        console.error("error from nip46 push server", error);
      }

      setExpoPushToken(token);
    });

    // FIXME: this only receives notifications when the app is running
    // notification should be data-only?
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        /*
        {"date": 1696867016.1575851, "request": {"content": {"attachments": [Array], "badge": null, "body": null, "categoryIdentifier": "", "data": [Object], "launchImageName": "", "sound": null, "subtitle": null, "summaryArgument": null, "summaryArgumentCount": 0, "targetContentIdentifier": null, "threadIdentifier": "", "title": "New event to sign"}, "identifier": "4B47C287-A6B0-4561-A730-E20CE0969D86", "trigger": {"class": "UNPushNotificationTrigger", "payload": [Object], "type": "push"}}}
        */

        // dismiss the encrypted notification from the NIP-46 push server
        // (we want to make a new one instead)
        Notifications.dismissNotificationAsync(notification.request.identifier);

        decryptNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Response received", response);

        // NOTE: currently responding to notification of encrypted content
        // if it were decrypted, we can act upon it and respond
        decryptNotification(response.notification);

        //const allowSign = response.actionIdentifier === "allow";
        //respondNotification(allowSign, response.notification, handler);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {notification ? (
          <>
            <Text>
              Title: {notification && notification.request.content.title}{" "}
            </Text>
            <Text>
              Body: {notification && notification.request.content.body}
            </Text>
            {/* <Text>
              Data:{" "}
              {notification &&
                JSON.stringify(notification.request.content.data)}
            </Text> */}
            <Button
              onPress={() => respondNotification(true, notification, handler)}
              title="Allow"
            />
            <Button
              onPress={() => respondNotification(false, notification, handler)}
              title="Deny"
            />
          </>
        ) : (
          <>
            <Text>Waiting for notification...</Text>
          </>
        )}
      </View>
    </View>
  );
}

async function schedulePushNotification(
  body: string,
  event: Event,
  request: NostrRPCRequest
) {
  // TODO: where should this be set?
  const cat = await Notifications.setNotificationCategoryAsync(
    "signer_notification_options",
    [
      {
        buttonTitle: "Block",
        identifier: "block",
        options: {
          opensAppToForeground: false,
        },
      },
      {
        buttonTitle: "Allow",
        identifier: "allow",
        options: {
          opensAppToForeground: false,
        },
      },
    ],
    {}
  );

  await Notifications.scheduleNotificationAsync({
    identifier: event.id,
    content: {
      categoryIdentifier: cat.identifier,
      title: "NIP-46 Request",
      body,
      data: { event, request },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
