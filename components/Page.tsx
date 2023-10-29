import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast, { BaseToast } from "react-native-toast-message";
import { useFonts } from "expo-font";
import React from "react";
import { SplashScreen } from "expo-router";
import { colors, fonts } from "../app/styles";

const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.primary,
        borderLeftColor: colors.neutral,
      }}
      contentContainerStyle={{}}
      text1Style={{
        color: colors.neutral,
        fontFamily: fonts.medium,
      }}
      text2Style={{
        color: colors.neutral,
      }}
    />
  ),
};

export function Page({ children }: React.PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    "GeneralSans-Extralight": require("../assets/fonts/GeneralSans-Extralight.otf"),
    "GeneralSans-Light": require("../assets/fonts/GeneralSans-Light.otf"),
    "GeneralSans-Regular": require("../assets/fonts/GeneralSans-Regular.otf"),
    "GeneralSans-Medium": require("../assets/fonts/GeneralSans-Medium.otf"),
    "GeneralSans-Bold": require("../assets/fonts/GeneralSans-Bold.otf"),
  });
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>{children}</View>
      </TouchableWithoutFeedback>
      <Toast config={toastConfig} />
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
});
