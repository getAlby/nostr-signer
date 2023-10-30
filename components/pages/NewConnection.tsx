import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import React from "react";
import Toast from "react-native-toast-message";
import { parseNostrConnectUrl } from "../../lib/parseNostrConnectUrl";
import { store } from "../../lib/store";
import { registerExpoPushToken } from "../../lib/registerExpoNotifications";
import { registerAppWithNip46PushServer } from "../../lib/registerAppWithNip46PushServer";
import { sendNip46ConnectRequest } from "../../lib/sendNip46ConnectRequest";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";
import * as Clipboard from "expo-clipboard";
import { Header } from "../Header";
import { Content } from "../Content";
import { Footer } from "../Footer";
import { FooterButton } from "../FooterButton";
import { colors, commonStyles } from "../../app/styles";

export function NewConnection() {
  const [isScanning, setScanning] = React.useState(false);

  const [connectStatus, setConnectStatus] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);

  async function scan() {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === "granted") {
      setScanning(true);
    }
  }
  React.useEffect(() => {
    scan();
  }, []);

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    setScanning(false);
    connect(data);
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  async function paste() {
    const text = await Clipboard.getStringAsync();
    connect(text);
  }

  async function connect(nip46ConnectionString: string) {
    try {
      setLoading(true);
      setConnectStatus("Parsing URL");
      const appConnection = parseNostrConnectUrl(nip46ConnectionString);
      setConnectStatus("Sending NIP-46 connect request");
      // FIXME: if connect doesn't work, user has to manually give their public key to the app
      // - add a new screen for the user to do this?
      try {
        await sendNip46ConnectRequest(appConnection);
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "info",
          text1: "Failed to send connect request",
          text2: "Manual connection required",
        });
      }
      await store.addAppConnection(appConnection);
      setConnectStatus("Registering push notifications");
      const expoToken = await registerExpoPushToken();
      setConnectStatus("Registering with NIP-46 push server");
      await registerAppWithNip46PushServer(expoToken, appConnection.publicKey);
      router.replace("/");
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "New app connection added",
          text2: `${appConnection.metadata.name} - ${appConnection.relay}`,
        });
      }, 100);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to connect to app",
        text2: (error as Error).message,
      });
      setLoading(false);
    }
  }

  return (
    <Page>
      <Header title="Add a new connection" />

      {isLoading ? (
        <>
          <Content>
            <ActivityIndicator
              size="large"
              style={{ marginTop: 80 }}
              color={colors.primary}
            />
            <View style={commonStyles.textBackground}>
              <Text>{connectStatus}</Text>
            </View>
          </Content>
        </>
      ) : (
        <>
          <Content>
            <Text>Scan or paste a NIP-46 connection string</Text>
            {isScanning && (
              <View style={commonStyles.paddingHorizontal}>
                <BarCodeScanner
                  onBarCodeScanned={handleBarCodeScanned}
                  style={styles.scanner}
                />
              </View>
            )}
          </Content>
          <Footer>
            <FooterButton onPress={paste} title="Paste connection string" />
          </Footer>
        </>
      )}
    </Page>
  );
}

const dimensions = Dimensions.get("window");
const styles = StyleSheet.create({
  scanner: {
    width: "100%",
    height: dimensions.height * 0.5,
    borderRadius: 32,
    overflow: "hidden",
    borderColor: colors.primary,
    borderWidth: 1,
  },
});
