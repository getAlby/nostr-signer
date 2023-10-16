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

export function NewConnection() {
  const [isScanning, setScanning] = React.useState(false);

  const [connectStatus, setConnectStatus] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [text, setText] = React.useState(
    ""
    //"nostrconnect://b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4?metadata=%7B%22name%22%3A%22Example%22%2C%22description%22%3A%22%F0%9F%94%89%F0%9F%94%89%F0%9F%94%89%22%2C%22url%22%3A%22https%3A%2F%2Fexample.com%22%2C%22icons%22%3A%5B%22https%3A%2F%2Fexample.com%2Ficon.png%22%5D%7D&relay=wss%3A%2F%2Frelay.damus.io"
    //"nostrconnect://6c83959af5ed9bc73d19aa702b7e9752b643815416d1109f055552b44e4d373b?metadata=%7B%22name%22%3A%22Example%22%2C%22description%22%3A%22%F0%9F%94%89%F0%9F%94%89%F0%9F%94%89%22%2C%22url%22%3A%22https%3A%2F%2Fexample.com%22%2C%22icons%22%3A%5B%22https%3A%2F%2Fexample.com%2Ficon.png%22%5D%7D&relay=wss%3A%2F%2Frelay.damus.io"
  );

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

  async function connect() {
    try {
      setLoading(true);
      setConnectStatus("Parsing URL");
      const appConnection = parseNostrConnectUrl(text);
      setConnectStatus("Sending NIP-46 connect request");
      await sendNip46ConnectRequest(appConnection);
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
