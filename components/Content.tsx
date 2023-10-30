import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type ContentProps = {
  style?: StyleProp<ViewStyle>;
};

export function Content({
  children,
  style,
}: React.PropsWithChildren<ContentProps>) {
  return (
    <View style={styles.outer}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, style]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    display: "flex",
    paddingTop: 32,
    //padding: 32,
    //paddingBottom: 0,
  },
  content: {
    flex: 1,
    width: "100%",
    display: "flex",
    //backgroundColor: "#f00",
  },
  contentContainer: {
    //flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    display: "flex",
    gap: 24,
  },
});
/*<TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      ></TouchableWithoutFeedback>*/
