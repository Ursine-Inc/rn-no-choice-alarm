import { Image } from "expo-image";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  Gesture,
  GestureDetector,
  TextInput,
} from "react-native-gesture-handler";
import { styles } from "../index-styles";

export default function HomeScreen() {
  const native = Gesture.Native();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">No Choice Alarm</ThemedText>
      </ThemedView>
      <ThemedText type="defaultSemiBold">set an alarm</ThemedText>
      <GestureDetector gesture={native}>
        <ThemedView style={styles.alarm}>
          <ThemedText>Hour</ThemedText>
          <TextInput placeholder="00"></TextInput>
          <ThemedText>Minutes</ThemedText>
          <TextInput placeholder="00"></TextInput>
        </ThemedView>
      </GestureDetector>
    </ParallaxScrollView>
  );
}
