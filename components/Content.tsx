import { StyleSheet, View } from "react-native";

export function Content({ children }: React.PropsWithChildren) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
