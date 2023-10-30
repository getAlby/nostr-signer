import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { colors, commonStyles, fontSizes, fonts } from "../../app/styles";
import { Footer } from "../Footer";
import { FooterButton } from "../FooterButton";
import { Content } from "../Content";
import { IconButton } from "../IconButton";
import Toast from "react-native-toast-message";
import { Header } from "../Header";
const logo = require("../../assets/logo.png");

export function Home() {
  const dimensions = Dimensions.get("window");
  const [isLoading, setLoading] = React.useState(true);
  const [publicKey, setPublicKey] = React.useState<string | undefined>();
  const [npub, setNPub] = React.useState<string | undefined>();
  const [appConnections, setAppConnections] = React.useState<AppConnection[]>(
    []
  );
  const [copyOptionsOpen, setCopyOptionsOpen] = React.useState(false);

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

  async function chooseCopyType() {
    setCopyOptionsOpen(true);
  }
  async function copyPublicKey() {
    await Clipboard.setStringAsync(publicKey);
    Toast.show({
      type: "success",
      text1: "Public Key Copied",
      text2: `Format: Hex`,
    });
  }
  async function copyNpub() {
    await Clipboard.setStringAsync(npub);
    Toast.show({
      type: "success",
      text1: "Public Key Copied",
      text2: `Format: NPub`,
    });
  }

  return (
    <Page>
      {copyOptionsOpen ? (
        <>
          <Header title="Choose an option" showBackButton={false} />
          <Content>
            <IconButton title="Copy NPub" onPress={copyNpub} />
            <IconButton title="Copy Hex" onPress={copyPublicKey} />
            <IconButton
              title="Cancel"
              onPress={() => setCopyOptionsOpen(false)}
            />
          </Content>
        </>
      ) : isLoading ? (
        <>
          <Text>Loading...</Text>
        </>
      ) : !npub ? (
        <>
          <Content>
            <Text style={styles.welcome}>Welcome to</Text>
            <Image
              source={logo}
              style={{
                width: dimensions.width * 0.2,
                height: dimensions.width * 0.2,
                display: "flex",
              }}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>nostr</Text>
              <Text style={styles.titleBold}>Signer</Text>
            </View>
            <Text style={styles.description}>
              Sign Nostr events remotely{"\n"}with your phone
            </Text>
          </Content>

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
          {appConnections.length > 0 ? (
            <Header showBackButton={false} title="Your connections" />
          ) : (
            <Header large showBackButton={false} title="Greetings" />
          )}

          <Content>
            <View style={commonStyles.flexHorizontal}>
              <Text>
                {npub.slice(0, 10)}...{npub.slice(npub.length - 10)}
              </Text>
              <IconButton onPress={chooseCopyType} title="📋" />
            </View>
            <IconButton onPress={logout} title="logout" />
            <View style={styles.appConnections}>
              {appConnections.map((connection, index) => (
                <Item
                  key={connection.publicKey}
                  connection={connection}
                  index={index}
                />
              ))}
            </View>
          </Content>

          <Footer>
            {!appConnections.length && (
              <FooterButton
                secondary
                onPress={openAboutPage}
                title="How does it work?"
              />
            )}
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

type ItemProps = { connection: AppConnection; index: number };
function Item({ connection, index }: ItemProps) {
  return (
    <Link
      key={connection.publicKey}
      href={{
        pathname: "/connections/[index]",
        params: { index },
      }}
      style={styles.appConnection}
    >
      {connection.metadata.name}
    </Link>
  );
}

const styles = StyleSheet.create({
  welcome: {
    marginTop: "15%",
    fontSize: fontSizes["3xl"],
    fontFamily: fonts.light,
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
  },
  description: {
    fontSize: fontSizes.lg,
    textAlign: "center",
  },
  start: {},
  appConnections: {
    width: "100%",
    marginTop: 16,
    gap: 8,
  },
  appConnection: {
    width: "100%",
    backgroundColor: colors.primary,
    fontSize: fontSizes.xl,
    color: colors.neutral,
    padding: 20,
  },
});
