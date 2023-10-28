import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fontSizes, fonts } from "../app/styles";

type FooterButtonProps = {
  title: string;
  onPress(): void;
  secondary?: boolean;
};

export function FooterButton({ title, onPress, secondary }: FooterButtonProps) {
  return (
    <Pressable
      style={[styles.footerButton, secondary && styles.secondary]}
      onPress={onPress}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footerButton: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  secondary: {
    backgroundColor: colors.primary + "AA",
  },
  title: {
    color: colors.neutral,
    fontSize: fontSizes.lg,
    fontFamily: fonts.medium,
  },
});
