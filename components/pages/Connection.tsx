import { Link, router, useLocalSearchParams } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import { Button } from "react-native";
import Toast from "react-native-toast-message";

export function Connection() {
  const { index: indexString } = useLocalSearchParams();
  const index = parseInt(indexString as string);
  const [appConnection, setAppConnection] = React.useState<
    AppConnection | undefined
  >();
  React.useEffect(() => {
    (async () => {
      const appConnections = await store.getAppConnections();
      setAppConnection(appConnections[index]);
    })();
  }, [index]);

  async function disconnect() {
    await store.removeAppConnection(index);

    router.replace("/");
    Toast.show({
      type: "success",
      text1: "App disconnected",
      text2: `${appConnection.metadata.name} - ${appConnection.relay}`,
    });
  }

  return (
    <Page>
      <Text>App Connection</Text>
      {appConnection && (
        <>
          <Text>{appConnection.metadata.name}</Text>
          <Text>{appConnection.publicKey}</Text>
          <Text>{appConnection.relay}</Text>
        </>
      )}

      <Button onPress={disconnect} title="DISCONNECT" />

      <Link href={{ pathname: "/" }} style={{ marginTop: 40, color: "#f0f" }}>
        Home
      </Link>
    </Page>
  );
}
