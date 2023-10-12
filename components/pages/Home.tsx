import { Link, router } from "expo-router";
import { Page } from "../Page";
import { Text } from "../Text";
import React from "react";
import { AppConnection, store } from "../../lib/store";
import { Button } from "react-native";

export function Home() {
  const [isLoading, setLoading] = React.useState(true);
  const [hasPrivateKey, setHasPrivateKey] = React.useState<boolean>(false);
  const [appConnections, setAppConnections] = React.useState<AppConnection[]>(
    []
  );
  React.useEffect(() => {
    (async () => {
      setHasPrivateKey(await store.hasPrivateKey());
      setAppConnections(await store.getAppConnections());
      setLoading(false);
    })();
  }, []);

  async function login() {
    await store.setPrivateKey(
      "f4b9141b8bb86c873d077218717540da701be15442bd0359227106d1d0fbe392"
    );
    setHasPrivateKey(true);
  }

  return (
    <Page>
      {isLoading ? (
        <>
          <Text>Loading...</Text>
        </>
      ) : !hasPrivateKey ? (
        <>
          <Text>Welcome to Alby Signer</Text>
          <Button onPress={login} title="login" />
        </>
      ) : appConnections.length > 0 ? (
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
          <Link href={{ pathname: "/new" }}>
            <Text>Create your first connection</Text>
          </Link>
        </>
      )}
    </Page>
  );
}
