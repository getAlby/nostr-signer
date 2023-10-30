import { Button, StyleSheet, TextInput, View } from "react-native";
import { Page } from "../Page";
import React from "react";
import { Link, router } from "expo-router";
import { store } from "../../lib/store";
import { generatePrivateKey, nip19 } from "nostr-tools";
import * as Clipboard from "expo-clipboard";
import { Content } from "../Content";
import { FooterButton } from "../FooterButton";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { Text } from "../Text";
import { colors, commonStyles } from "../../app/styles";

export function About() {
  function goHome() {
    router.push("/");
  }
  function openGithub() {
    router.push("https://github.com/getAlby/nostr-signer");
  }

  return (
    <Page>
      <Header large title="How does it work?" showBackButton={false} />
      <Content>
        <View
          style={[commonStyles.textBackground, commonStyles.marginHorizontal]}
        >
          <Text>
            Nostr Signer is a mobile app designed to streamline the signing
            process within the Nostr ecosystem. It simplifies the management of
            your nsec (Nostr private key) and allows other Nostr apps to
            securely request signing functions using the NIP-46 protocol. The
            app receives signing requests as push notifications, which you can
            either accept or ignore. If accepted, it performs the necessary
            signing and sends the result back to the requesting app. Nostr
            Signer provides a central hub for managing your Nsec, making the
            Nostr experience more convenient and secure on mobile devices.
          </Text>
          <Text style={{ marginVertical: 20 }}>
            Not sure what to do? open the{" "}
            <Link
              href="https://rolznz.github.io/connect/"
              style={{ color: "#ff00ff" }}
            >
              Nostr Connect Playground
            </Link>{" "}
            on your PC and scan the QR code to try out remote signing.
          </Text>
        </View>
      </Content>
      <Footer>
        <FooterButton secondary title="View on Github" onPress={openGithub} />
        <FooterButton title="Home" onPress={goHome} />
      </Footer>
    </Page>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    padding: 10,
  },
});
