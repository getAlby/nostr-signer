import { Link } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { ActivityIndicator, Button, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../lib/AppStore";
import {
  DecryptResult,
  decryptNip46PushServerNotification,
} from "../../lib/decryptNip46PushServerNotification";
import { NostrSigner } from "../../lib/nostr";
import { store } from "../../lib/store";
import { finishEvent, getPublicKey } from "nostr-tools";

export function Sign() {
  const [isSigning, setSigning] = React.useState(false);
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
      setSigning(true);
      // TODO: do not access private key directly
      const privateKey = await store.getPrivateKey();
      // TODO: move this code
      const handler = new NostrSigner({
        secretKey: privateKey,
        relay: decryptResult.appConnection.relay,
      });

      let result;
      switch (decryptResult.payload.method) {
        case "get_public_key":
          result = getPublicKey(privateKey);
          break;
        case "sign_event":
          result = finishEvent(decryptResult.payload.params[0], privateKey);
          break;
        default:
          throw new Error(
            "Unsupported NIP-46 method: " + decryptResult.payload.method
          );
      }

      await handler.reply(
        {
          id: decryptResult.payload.id,
          result,
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
    setSigning(false);
  };

  const deny = () => {
    useAppStore.getState().shiftNotification();
  };

  return (
    <Page>
      {isSigning ? (
        <>
          <ActivityIndicator size="large" />
        </>
      ) : decryptResult ? (
        <>
          <Text>SIGN {decryptResult.payload.method}</Text>
          {decryptResult.payload.params.length > 0 && (
            <>
              <Text>
                Kind {JSON.stringify(decryptResult.payload.params[0].kind)}
              </Text>
              <Text>
                Content{" "}
                {JSON.stringify(decryptResult.payload.params[0].content)}
              </Text>
              <Text>
                Event {JSON.stringify(decryptResult.payload.params[0])}
              </Text>
            </>
          )}

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              gap: 40,
            }}
          >
            <Button title="Ignore" onPress={deny} />
            <Button title="Sign" onPress={approve} />
          </View>
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
