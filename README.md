# Alby-signer

Simple Nostr Remote signing app made using Expo

## Development

Install Expo Go on your mobile, then run `yarn start`. Make sure to run on the same WIFI network or use `yarn start:tunnel`

# To fire an event, run the following code in node: (requires nostr-tools and @nostr-connect/connect dependencies)

```
const crypto = require("crypto");
global.crypto = crypto;
require('websocket-polyfill');
const { generatePrivateKey, getPublicKey, nip19, finishEvent, relayInit } = require('nostr-tools');
const { Connect } = require('@nostr-connect/connect');

const sk = 'f4b9141b8bb86c873d077218717540da701be15442bd0359227106d1d0fbe392'; //generatePrivateKey()
const pk = getPublicKey(sk)

const appConnectSk = '3771b65da6cb3e6be82cd4b3b04c73da94de197c9d56698e4e52fb8304abf838'; // generatePrivateKey();

console.log("sk is " + sk);
console.log("pk is " + pk +" (" + nip19.npubEncode(pk) +")");
console.log("Nsec is " + nip19.nsecEncode(sk));

console.log("Nostr Connect App sk is " + appConnectSk);
console.log("Nostr Connect App pk is " + getPublicKey(appConnectSk));

const relayUrl = 'wss://relay.shitforce.one';


(async () => {
  const connect = new Connect({ secretKey: appConnectSk, relay: relayUrl, target: pk });
  // connect.events.on('connect', async ( walletPubkey ) => {
  //   console.log('connected with wallet: ' + walletPubkey);
  //   await connect.disconnect();
  // });

  await connect.init();
  try {

    const receivedPubkey = await connect.getPublicKey();

    console.log("Got pubkey: " + receivedPubkey);
  }
  catch(error) {
    console.error(error);
  }
  await connect.disconnect();


})();
```
