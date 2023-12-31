import { StyleSheet } from "react-native";

// TODO: consider using NativeWind (https://www.nativewind.dev/)
export const colors = {
  primary: "#47585C",
  neutral: "#C8D5BB",
  "neutral-secondary": "#8B8B8B",
};
export const fonts = {
  extralight: "GeneralSans-Extralight",
  light: "GeneralSans-Light",
  regular: "GeneralSans-Regular",
  medium: "GeneralSans-Medium",
  bold: "GeneralSans-Bold",
};
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
};

export const commonStyles = StyleSheet.create({
  flexHorizontal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 4,
  },
  paddingHorizontal: {
    paddingHorizontal: 32,
    width: "100%",
  },
  marginHorizontal: {
    marginHorizontal: 32,
  },
  textBackground: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
  },
});
