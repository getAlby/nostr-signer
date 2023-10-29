import { StyleSheet, TextInput, View } from "react-native";
import { Page } from "../Page";
import React from "react";
import { router } from "expo-router";
import { store } from "../../lib/store";
import { generatePrivateKey, nip19 } from "nostr-tools";
import * as Clipboard from "expo-clipboard";
import { Text } from "../Text";
import { Content } from "../Content";
import { FooterButton } from "../FooterButton";
import { Footer } from "../Footer";
import { colors } from "../../app/styles";
import { IconButton } from "../IconButton";
import { Header } from "../Header";

export function Login() {
  const [text, setText] = React.useState("");

  async function paste() {
    const clipboardText = await Clipboard.getStringAsync();
    setText(clipboardText);
  }
  async function generateKey() {
    setText(nip19.nsecEncode(generatePrivateKey()));
  }
  async function login() {
    let privateKeyHex = text;
    if (text.startsWith("nsec")) {
      privateKeyHex = nip19.decode(text).data as string;
    }

    await store.setPrivateKey(privateKeyHex);
    router.replace("/");
  }

  return (
    <Page>
      <Header title="Start" large showBackButton={false} />
      <Content>
        <Text style={styles.instructions}>
          Enter your Nostr private key to start
        </Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="nsec1..."
        />
        <IconButton title="Paste" onPress={paste} />
        <IconButton title="Generate new key" onPress={generateKey} />
      </Content>

      <Footer>
        <FooterButton onPress={login} title="Continue" />
      </Footer>
    </Page>
  );
}

const styles = StyleSheet.create({
  instructions: {
    marginBottom: 70,
  },
  input: {
    height: 40,
    width: "100%",
    padding: 10,
    backgroundColor: colors.neutral,
    color: colors["neutral-secondary"],
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,
  },
});
