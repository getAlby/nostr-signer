import applyGlobalPolyfills from "../applyGlobalPolyfills";
applyGlobalPolyfills();
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
  useTheme,
} from "@react-navigation/native";

import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />;
}
