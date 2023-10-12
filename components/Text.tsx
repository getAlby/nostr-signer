import { StyleSheet, Text as _Text, useColorScheme } from "react-native";

export function Text({ children }: React.PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <_Text style={[styles.text, styles[colorScheme + "Text"]]}>
      {children}
    </_Text>
  );
}

const styles = StyleSheet.create({
  text: {},
  lightText: {
    color: "#242c40",
  },
  darkText: {
    color: "#d0d0c0",
  },
});
