import { router, useLocalSearchParams } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import Toast from "react-native-toast-message";
import { Header } from "../Header";
import { Content } from "../Content";
import { Footer } from "../Footer";
import { FooterButton } from "../FooterButton";
import { commonStyles } from "../../app/styles";

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
    setTimeout(() => {
      Toast.show({
        type: "success",
        text1: "App disconnected",
        text2: `${appConnection.metadata.name} - ${appConnection.relay}`,
      });
    }, 100);
  }

  return (
    <Page>
      <Header title={appConnection?.metadata.name ?? "App connection"} />
      <Content>
        {appConnection && (
          <>
            <Text>App Pubkey</Text>
            <Text selectable style={commonStyles.marginHorizontal}>
              {appConnection.publicKey}
            </Text>
            <Text>Relay</Text>
            <Text selectable style={commonStyles.marginHorizontal}>
              {appConnection.relay}
            </Text>
          </>
        )}
      </Content>
      <Footer>
        <FooterButton onPress={disconnect} title="DISCONNECT" />
      </Footer>
    </Page>
  );
}
