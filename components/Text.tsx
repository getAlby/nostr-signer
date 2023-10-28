import {
  StyleSheet,
  TextProps,
  Text as _Text,
  useColorScheme,
} from "react-native";
import { colors, fontSizes, fonts } from "../app/styles";

export function Text({
  children,
  ...otherProps
}: React.PropsWithChildren<TextProps>) {
  const colorScheme = useColorScheme();

  return (
    <_Text {...otherProps} style={[styles.text, otherProps.style]}>
      {children}
    </_Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.neutral,
    fontSize: fontSizes.base,
    fontFamily: fonts.regular,
  },
});
