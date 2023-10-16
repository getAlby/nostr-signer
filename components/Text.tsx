import {
  StyleSheet,
  TextProps,
  Text as _Text,
  useColorScheme,
} from "react-native";

export function Text({
  children,
  ...otherProps
}: React.PropsWithChildren<TextProps>) {
  const colorScheme = useColorScheme();

  return (
    <_Text
      {...otherProps}
      style={[otherProps.style, styles.text, styles[colorScheme + "Text"]]}
    >
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
