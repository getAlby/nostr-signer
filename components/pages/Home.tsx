import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import { Button, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { fontSizes, fonts } from "../../app/styles";
import { Footer } from "../Footer";
import { FooterButton } from "../FooterButton";
import { Content } from "../Content";

export function Home() {
  const [isLoading, setLoading] = React.useState(true);
  const [publicKey, setPublicKey] = React.useState<string | undefined>();
  const [npub, setNPub] = React.useState<string | undefined>();
  const [appConnections, setAppConnections] = React.useState<AppConnection[]>(
    []
  );
  React.useEffect(() => {
    (async () => {
      setNPub(await store.getNPub());
      setPublicKey(await store.getPublicKey());
      setAppConnections(await store.getAppConnections());
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await store.logout();
    setNPub(undefined);
    setAppConnections([]);
  }

  function openAboutPage() {
    router.replace("/about");
  }
  function login() {
    router.replace("/login");
  }
  function addConnection() {
    router.replace("/new");
  }

  async function copyPublicKey() {
    await Clipboard.setStringAsync(publicKey);
  }
  async function copyNpub() {
    await Clipboard.setStringAsync(npub);
  }

  return (
    <Page>
      {isLoading ? (
        <>
          <Text>Loading...</Text>
        </>
      ) : !npub ? (
        <>
          <Text style={styles.welcome}>Welcome to</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>nostr</Text>
            <Text style={styles.titleBold}>Signer</Text>
          </View>
          <Text style={styles.description}>
            Sign Nostr events remotely{"\n"}with your phone
          </Text>

          <Content></Content>

          <Footer>
            <FooterButton
              secondary
              onPress={openAboutPage}
              title="How does it work?"
            />
            <FooterButton onPress={login} title="Start" />
          </Footer>
        </>
      ) : (
        <>
          <Text style={styles.welcome}>Greetings</Text>
          <Content>
            <Text>Logged in as {npub}</Text>
            <Button title="Copy hex" onPress={copyPublicKey} />
            <Button title="Copy npub" onPress={copyNpub} />
            <Button onPress={logout} title="logout" />
            {appConnections.length > 0 && (
              <>
                <Text style={{ marginTop: 40, fontSize: 20 }}>
                  Your connections
                </Text>
                {appConnections.map((connection, index) => (
                  <Link
                    key={index}
                    href={{
                      pathname: "/connections/[index]",
                      params: { index },
                    }}
                    style={{
                      marginTop: 20,
                      color: "#f0f",
                    }}
                  >
                    {connection.metadata.name}
                  </Link>
                ))}
                <Link
                  href={{ pathname: "/new" }}
                  style={{ marginTop: 60, color: "#f0f" }}
                >
                  Add another connection
                </Link>
              </>
            )}
          </Content>

          <Footer>
            <FooterButton
              secondary
              onPress={openAboutPage}
              title="How does it work?"
            />
            <FooterButton
              onPress={addConnection}
              title="Add a new connection"
            />
          </Footer>
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: fontSizes["3xl"],
    fontFamily: fonts.light,
    position: "absolute",
    bottom: "88%",
  },
  title: {
    fontSize: fontSizes["6xl"],
    fontFamily: fonts.extralight,
  },
  titleBold: {
    fontFamily: fonts.regular,
    fontSize: fontSizes["6xl"],
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    top: "27%",
  },
  description: {
    fontSize: fontSizes.lg,
    position: "absolute",
    top: "40%",
    textAlign: "center",
  },
  start: {},
});
