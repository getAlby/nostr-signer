import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Page } from "../Page";
import React from "react";
import { Link, router } from "expo-router";
import { store } from "../../lib/store";
import { generatePrivateKey, nip19 } from "nostr-tools";
import * as Clipboard from "expo-clipboard";

export function About() {
  return (
    <Page>
      <Text>About</Text>
      <Text style={{ marginTop: 20 }}>
        Store your Nsec in a single app and use it to sign requests from other
        Nostr clients via push notifications.
      </Text>

      <Text style={{ marginTop: 40 }}>
        View on{" "}
        <Link
          style={{ color: "#f0f" }}
          href="https://github.com/getAlby/nostr-signer"
        >
          Github
        </Link>
      </Text>

      <Link href={{ pathname: "/" }} style={{ marginTop: 40, color: "#f0f" }}>
        Home
      </Link>
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
