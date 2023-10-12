import * as SecureStore from "expo-secure-store";

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
  while (await SecureStore.getItemAsync(connectionIndex.toString())) {
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

async function hasPrivateKey(): Promise<boolean> {
  const privateKey = await SecureStore.getItemAsync("privateKey");
  return !!privateKey;
}

export const store = {
  setPrivateKey,
  hasPrivateKey,
  addAppConnection,
  removeAppConnection,
  getAppConnections,
};
