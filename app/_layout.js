import "../lib/applyGlobalPolyfills";
import "../lib/registerExpoNotifications";
import { SplashScreen } from "expo-router";
SplashScreen.preventAutoHideAsync();

import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />;
}
