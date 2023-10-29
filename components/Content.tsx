import { StyleSheet, View } from "react-native";

export function Content({ children }: React.PropsWithChildren) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    padding: 32,
    gap: 24,
  },
});