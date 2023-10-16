import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import {
  ActivityIndicator,
  Button,
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

export function NewConnection() {
  const [isScanning, setScanning] = React.useState(false);

  const [connectStatus, setConnectStatus] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");

  async function scan() {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === "granted") {
      setScanning(true);
    }
  }

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    setScanning(false);
    setText(data);
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  async function paste() {
    const text = await Clipboard.getStringAsync();
    setText(text);
  }

  async function connect() {
    try {
      setLoading(true);
      setConnectStatus("Parsing URL");
      const appConnection = parseNostrConnectUrl(text);
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
      Toast.show({
        type: "success",
        text1: "New app connection added",
        text2: `${appConnection.metadata.name} - ${appConnection.relay}`,
      });
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
      <Text>New Connection</Text>

      {isLoading ? (
        <>
          <ActivityIndicator size="large" style={{ marginVertical: 40 }} />
          <Text>{connectStatus}</Text>
        </>
      ) : isScanning ? (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <>
          <Text style={{ marginVertical: 20 }}>
            Not sure what to do? open the{" "}
            <Link
              href="https://rolznz.github.io/connect/"
              style={{ color: "#ff00ff" }}
            >
              Nostr Connect Playground
            </Link>{" "}
            on your PC and scan the QR code.
          </Text>

          <TextInput
            style={styles.input}
            onChangeText={(_text) => setText(_text)}
            value={text}
            multiline
          />
          <View style={{ marginTop: 20 }}>
            <Button onPress={scan} title="SCAN" />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button onPress={paste} title="PASTE" />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button onPress={connect} title="CONNECT" />
          </View>

          <Link href={{ pathname: "/" }} style={{ marginTop: 40 }}>
            <Text>Home</Text>
          </Link>
        </>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  input: {
    borderColor: "#8e30eb",
    borderWidth: 1,
    color: "#8e30eb",
    padding: 4,
    margin: 4,
    width: "100%",
    height: 200,
  },
});
