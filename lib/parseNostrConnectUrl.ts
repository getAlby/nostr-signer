import { AppConnection } from "./store";

export function parseNostrConnectUrl(walletConnectUrl: string): AppConnection {
  walletConnectUrl = walletConnectUrl.replace("nostrconnect://", "http://"); // makes it possible to parse with URL in the different environments (browser/node/...)
  const url = new URL(walletConnectUrl);
  const publicKey = url.host;
  const relay = url.searchParams.get("relay");
  if (!publicKey || !relay) {
    throw new Error("Invalid NIP-46 URL");
  }

  const metadataJson = url.searchParams.get("metadata");
  const metadata = metadataJson && JSON.parse(metadataJson);

  return {
    publicKey,
    metadata: {
      name: "Unknown Connection",
      ...(metadata || {}),
    },
    relay,
  };
}
