import { Button, StyleSheet, TextInput, View } from "react-native";
import { Page } from "../Page";
import React from "react";
import { Link, router } from "expo-router";
import { store } from "../../lib/store";
import { generatePrivateKey, nip19 } from "nostr-tools";
import * as Clipboard from "expo-clipboard";
import { Text } from "../Text";
import { Content } from "../Content";
import { FooterButton } from "../FooterButton";
import { Footer } from "../Footer";
import { colors } from "../../app/styles";

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
        <Button title="Paste" onPress={paste} />
        <Button title="Random" onPress={generateKey} />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: 24,
            marginTop: 24,
          }}
        ></View>
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
    borderRadius: 6,
  },
});
