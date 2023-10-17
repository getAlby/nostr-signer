import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAppStore } from "./AppStore";
import { router } from "expo-router";

console.log("Executing registerExpoNotifications");

Notifications.setNotificationHandler({
  handleNotification: async (_notification: Notifications.Notification) => ({
    shouldShowAlert: true, // TODO: should this be false for the encrypted notifications?
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.addNotificationReceivedListener(async (notification) => {
  /*
  {"date": 1696867016.1575851, "request": {"content": {"attachments": [Array], "badge": null, "body": null, "categoryIdentifier": "", "data": [Object], "launchImageName": "", "sound": null, "subtitle": null, "summaryArgument": null, "summaryArgumentCount": 0, "targetContentIdentifier": null, "threadIdentifier": "", "title": "New event to sign"}, "identifier": "4B47C287-A6B0-4561-A730-E20CE0969D86", "trigger": {"class": "UNPushNotificationTrigger", "payload": [Object], "type": "push"}}}
  */

  // dismiss the encrypted notification from the NIP-46 push server
  // (we want to make a new one instead)
  console.log("Notification received", notification);
  Notifications.dismissNotificationAsync(notification.request.identifier);

  //decryptNip46PushServerNotification(notification);
  useAppStore.getState().addNotification(notification);
  router.push("/sign");
});

Notifications.addNotificationResponseReceivedListener((response) => {
  console.log("Notification Response received", response);

  // NOTE: currently responding to notification of encrypted content
  // if it were decrypted, we can act upon it and respond

  // TODO:
  // 1. add to queue
  // 2. navigate to approval page
  // 3. on approval page display latest notification
  useAppStore.getState().addNotification(response.notification);
  router.push("/sign");
  //decryptNip46PushServerNotification(response.notification);

  //const allowSign = response.actionIdentifier === "allow";
  //respondNotification(allowSign, response.notification, handler);
});

export async function registerExpoPushToken(): Promise<string> {
  let token: string;

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
      throw new Error("Failed to get push token for push notification!");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        // TODO: this works for Android
        //  confirm this is correct for iOS + Expo Go
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;
    console.log(token);
  } else {
    throw new Error("Must use physical device for Push Notifications");
  }

  if (!token) {
    throw new Error("Failed to retrieve expo push token");
  }

  return token;
}
