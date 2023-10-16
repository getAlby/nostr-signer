import { Link } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { Button } from "react-native";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../lib/AppStore";
import {
  DecryptResult,
  decryptNip46PushServerNotification,
} from "../../lib/decryptNip46PushServerNotification";
import { NostrSigner } from "../../lib/nostr";
import { store } from "../../lib/store";
import { getPublicKey } from "nostr-tools";

export function Sign() {
  const notifications = useAppStore((store) => store.notifications);
  const [decryptResult, setDecryptResult] = React.useState<
    DecryptResult | undefined
  >();

  React.useEffect(() => {
    setDecryptResult(undefined);
    if (!notifications.length) {
      return undefined;
    }
    (async () => {
      try {
        console.log("Checking", notifications[0]);
        const result = await decryptNip46PushServerNotification(
          notifications[0]
        );
        console.log("Result", result);
        setDecryptResult(result);
      } catch (error) {
        console.error(error);
        setDecryptResult(undefined);
        Toast.show({
          type: "error",
          text1: "Failed to decrypt request",
          text2: (error as Error).message,
        });
        useAppStore.getState().shiftNotification();
      }
    })();
  }, [notifications]);

  const approve = async () => {
    try {
      // TODO: do not access private key directly
      const privateKey = await store.getPrivateKey();
      // TODO: move this code
      const handler = new NostrSigner({
        secretKey: privateKey,
        relay: decryptResult.appConnection.relay,
      });
      await handler.reply(
        {
          id: decryptResult.payload.id,
          result: getPublicKey(privateKey),
          error: null,
        },
        decryptResult.event
      );
      console.log("Replied");
      Toast.show({
        type: "success",
        text1: "Signed successfully",
        text2: "🎉🎉🎉",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to send response",
        text2: (error as Error).message,
      });
    }
    useAppStore.getState().shiftNotification();
  };

  const deny = () => {
    useAppStore.getState().shiftNotification();
  };

  return (
    <Page>
      <Text>{notifications.length} events to sign</Text>
      {decryptResult ? (
        <>
          <Text>SIGN {decryptResult.payload.method}</Text>
          <Button title="Approve" onPress={approve} />
          <Button title="Deny" onPress={deny} />
        </>
      ) : (
        <>
          <Text>No more notifications to sign</Text>
          <Link href={{ pathname: "/" }} style={{ marginTop: 20 }}>
            <Text>Home</Text>
          </Link>
        </>
      )}
    </Page>
  );
}
