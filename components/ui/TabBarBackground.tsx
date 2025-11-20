import { StyleSheet, View } from "react-native";

export default function TabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(255,255,255,0.9)" },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
