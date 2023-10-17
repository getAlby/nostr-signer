import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import { Button } from "react-native";
import * as Clipboard from "expo-clipboard";

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
          <Text>Welcome to Alby Signer</Text>
          <Link href="/login">
            <Text>Login</Text>
          </Link>
        </>
      ) : (
        <>
          <Text>Logged in as {npub}</Text>
          <Button title="Copy hex" onPress={copyPublicKey} />
          <Button title="Copy npub" onPress={copyNpub} />
          <Button onPress={logout} title="logout" />
          {appConnections.length > 0 ? (
            <>
              <Text>Your connections</Text>
              {appConnections.map((connection, index) => (
                <Link
                  key={index}
                  href={{
                    pathname: "/connections/[index]",
                    params: { index },
                  }}
                  style={{
                    marginTop: 20,
                  }}
                >
                  <Text>{connection.metadata.name}</Text>
                </Link>
              ))}
              <Link href={{ pathname: "/new" }} style={{ marginTop: 40 }}>
                <Text>Add another connection</Text>
              </Link>
            </>
          ) : (
            <>
              <Link href={{ pathname: "/new" }} style={{ marginTop: 40 }}>
                <Text>Create your first connection</Text>
              </Link>
            </>
          )}
        </>
      )}
    </Page>
  );
}
