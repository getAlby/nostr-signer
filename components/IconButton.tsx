import { Pressable, StyleSheet } from "react-native";
import { colors, fontSizes, fonts } from "../app/styles";
import { Text } from "./Text";

type IconButtonProps = {
  title: string;
  onPress(): void;
};

export function IconButton({ title, onPress }: IconButtonProps) {
  return (
    <Pressable style={[styles.iconButton]} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary + "AA",
  },
  title: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
  },
});
