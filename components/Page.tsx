import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";

export function Page({ children }: React.PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, styles[colorScheme + "Container"]]}>
          {children}
        </View>
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
  },
  lightContainer: {
    backgroundColor: "#d0d0c0",
  },
  darkContainer: {
    backgroundColor: "#242c40",
  },
});
