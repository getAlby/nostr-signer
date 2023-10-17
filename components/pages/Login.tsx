import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Page } from "../Page";
import React from "react";
import { Link, router } from "expo-router";
import { store } from "../../lib/store";
import { generatePrivateKey, nip19 } from "nostr-tools";
import * as Clipboard from "expo-clipboard";

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
      <Text>Enter Private key</Text>
      <TextInput style={styles.input} value={text} onChangeText={setText} />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          gap: 40,
        }}
      >
        <Button title="Paste" onPress={paste} />
        <Button title="Random" onPress={generateKey} />
      </View>

      <Text>
        View on{" "}
        <Link
          style={{ color: "#f0f" }}
          href="https://github.com/getAlby/nostr-signer"
        >
          Github
        </Link>
      </Text>

      <Button title="Continue" onPress={login} />
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
