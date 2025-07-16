import { Image } from "expo-image";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Pressable, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "../index-styles";

export default function HomeScreen() {
  const touch = Gesture.Tap();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/header-image.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Get (dafak) Up :)</ThemedText>
      </ThemedView>
      <ThemedView>
        <GestureDetector gesture={touch}>
          <ThemedView>
            <View style={styles.alarm}>
              <ThemedText type="subtitle">Hour</ThemedText>
              <TextInput
                style={styles.alarmInput}
                placeholder="00"
                keyboardType="number-pad"
              ></TextInput>
              <ThemedText type="subtitle">Minutes</ThemedText>
              <TextInput
                style={styles.alarmInput}
                placeholder="00"
                keyboardType="number-pad"
              ></TextInput>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgb(169, 236, 169)" : "white",
                  },
                  styles.wrapperCustom,
                  styles.addButton,
                ]}
              >
                <ThemedText type="link" style={styles.addButtonLabel}>
                  +
                </ThemedText>
              </Pressable>
            </View>
            <View style={styles.options}>
              <ThemedText type="subheading">Select soundtrack</ThemedText>
              <Pressable style={styles.optionsButton}>
                <Text style={styles.label}>Music</Text>
              </Pressable>
              <Pressable style={styles.optionsButton}>
                <Text style={styles.label}>Speech</Text>
              </Pressable>
            </View>
          </ThemedView>
        </GestureDetector>
      </ThemedView>
    </ParallaxScrollView>
  );
}
