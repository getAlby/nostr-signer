import { StyleSheet, View } from "react-native";

export function Footer({ children }: React.PropsWithChildren) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    padding: 32,
    paddingBottom: 48,
    gap: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
});
