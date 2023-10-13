import "../lib/applyGlobalPolyfills";
import "../lib/registerExpoNotifications";

import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />;
}
