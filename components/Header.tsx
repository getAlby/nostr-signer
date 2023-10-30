import { StyleSheet, View } from "react-native";
import { fontSizes, fonts } from "../app/styles";
import { Text } from "./Text";
import { IconButton } from "./IconButton";
import { router } from "expo-router";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  large?: boolean;
};

export function Header({ title, showBackButton = true, large }: HeaderProps) {
  function goHome() {
    router.push("/");
  }

  return (
    <View style={styles.container}>
      {showBackButton && (
        <View style={styles.exit}>
          <IconButton title="X" onPress={goHome} />
        </View>
      )}
      <Text style={[styles.title, large && styles.largeTitle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  exit: {
    position: "absolute",
    top: 60,
    left: 32,
  },
  container: {
    paddingTop: 64,
    paddingHorizontal: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },

  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.light,
  },
  largeTitle: {
    fontSize: fontSizes["3xl"],
  },
});
