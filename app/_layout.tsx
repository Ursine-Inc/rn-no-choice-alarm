import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { ActiveAlarmProvider } from "@/hooks/useActiveAlarm";
import { AlarmStorageProvider } from "@/hooks/useAlarmStorage";
import { AudioProvider } from "@/hooks/useAudio";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!loaded) {
    return null;
  }

  return (
    <AudioProvider>
      <AlarmStorageProvider>
        <ActiveAlarmProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </GestureHandlerRootView>
        </ActiveAlarmProvider>
      </AlarmStorageProvider>
    </AudioProvider>
  );
}
