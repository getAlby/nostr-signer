import "../lib/applyGlobalPolyfills";
import "../lib/registerExpoNotifications";
import { SplashScreen } from "expo-router";

import { Slot } from "expo-router";

import { ImageBackground, StyleSheet } from "react-native";
import React from "react";
const background = require("../assets/background.jpg");

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ImageBackground
      style={styles.imgBackground}
      resizeMode="cover"
      source={background}
    >
      <Slot />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
});
