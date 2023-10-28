import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import React from "react";
import { SplashScreen } from "expo-router";
const splash = require("../assets/splash.png");

export function Page({ children }: React.PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    "GeneralSans-Extralight": require("../assets/fonts/GeneralSans-Extralight.otf"),
    "GeneralSans-Light": require("../assets/fonts/GeneralSans-Light.otf"),
    "GeneralSans-Regular": require("../assets/fonts/GeneralSans-Regular.otf"),
    "GeneralSans-Medium": require("../assets/fonts/GeneralSans-Medium.otf"),
    "GeneralSans-Bold": require("../assets/fonts/GeneralSans-Bold.otf"),
  });
  const splashLoaded = !!splash;
  const loaded = fontsLoaded && splashLoaded;
  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  });
  if (!loaded) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          style={styles.imgBackground}
          resizeMode="cover"
          source={splash}
        >
          <View style={styles.container}>{children}</View>
        </ImageBackground>
      </TouchableWithoutFeedback>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  imgBackground: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
});
