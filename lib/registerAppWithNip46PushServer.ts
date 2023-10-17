export async function registerAppWithNip46PushServer(
  expoToken: string,
  appPublicKey: string
) {
  const result = await fetch("https://nip46.regtest.getalby.com/token/expo", {
    method: "POST",
    body: JSON.stringify({
      // FIXME: pk here should be pk generated by the NC app (node app right now)
      pk: appPublicKey, // PUBKEY OF THE APP!
      token: expoToken,
      channel_id: "default",
    }),
  });
  console.log("response from nip46 push server", result.ok, result.status);
  console.log("response from nip46 push server", await result.text());
}
