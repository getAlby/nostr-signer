import * as SecureStore from "expo-secure-store";
import { nip19, getPublicKey as nostrGetPublicKey } from "nostr-tools";

export type AppConnection = {
  publicKey: string;
  relay: string;
  metadata: {
    name: string;
    description?: string;
    url?: string;
    icons?: string[];
  };
};

async function getAppConnections() {
  const appConnections: AppConnection[] = [];
  let connectionIndex = 0;
  while (true) {
    const connectionJson = await SecureStore.getItemAsync(
      connectionIndex.toString()
    );
    if (!connectionJson) {
      break;
    }
    appConnections.push(JSON.parse(connectionJson));
    connectionIndex++;
  }
  return appConnections;
}

async function removeAppConnection(connectionIndex: number) {
  // push other connections down to fill gap
  while (true) {
    await SecureStore.deleteItemAsync(connectionIndex.toString());
    connectionIndex++;
    const connectionJson = await SecureStore.getItemAsync(
      connectionIndex.toString()
    );
    if (!connectionJson) {
      break;
    }
    SecureStore.setItemAsync((connectionIndex - 1).toString(), connectionJson);
  }
}

async function addAppConnection(appConnection: AppConnection) {
  let connectionIndex = 0;
  while (true) {
    const appConnectionJson = await SecureStore.getItemAsync(
      connectionIndex.toString()
    );
    if (!appConnectionJson) {
      break;
    }
    const existingAppConnection: AppConnection = JSON.parse(appConnectionJson);
    if (appConnection.publicKey === existingAppConnection.publicKey) {
      throw new Error("Already connected to this app");
    }
    connectionIndex++;
  }
  return SecureStore.setItemAsync(
    connectionIndex.toString(),
    JSON.stringify(appConnection)
  );
}

function setPrivateKey(privateKey: string) {
  return SecureStore.setItemAsync("privateKey", privateKey);
}

// TODO: move signing here instead of exposing private key!
async function getPrivateKey(): Promise<string | undefined> {
  const privateKey = await SecureStore.getItemAsync("privateKey");
  return privateKey ?? undefined;
}

async function getPublicKey(): Promise<string | undefined> {
  const privateKey = await SecureStore.getItemAsync("privateKey");
  if (!privateKey) {
    return undefined;
  }
  return nostrGetPublicKey(privateKey);
}

async function getNPub(): Promise<string | undefined> {
  const pubkey = await getPublicKey();
  if (!pubkey) {
    return undefined;
  }
  return nip19.npubEncode(pubkey);
}

async function logout() {
  await SecureStore.deleteItemAsync("privateKey");
  let connectionIndex = 0;
  while (true) {
    const connectionJson = await SecureStore.getItemAsync(
      connectionIndex.toString()
    );
    if (!connectionJson) {
      break;
    }
    await SecureStore.deleteItemAsync(connectionIndex.toString());
    connectionIndex++;
  }
}

export const store = {
  setPrivateKey,
  getPublicKey,
  getNPub,
  getPrivateKey,
  addAppConnection,
  removeAppConnection,
  getAppConnections,
  logout,
};
