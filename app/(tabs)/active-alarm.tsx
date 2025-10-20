import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function ActiveAlarmScreen() {
  const params = useLocalSearchParams();
  const { hour, minutes, day, isRecurring, selectedAudio } = params;
  const { setHasActiveAlarm, isAlarmKilled, setIsAlarmKilled, getAudioSource } =
    useActiveAlarm();

  const [countdown, setCountdown] = useState("");
  const [scaleAnim] = useState(new Animated.Value(0));
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);
  const alarmTriggeredRef = useRef(false);

  // Function to play alarm sound
  const playAlarmSound = useCallback(
    async (audioName: string) => {
      if (alarmTriggeredRef.current || isAlarmKilled) {
        return;
      }

      alarmTriggeredRef.current = true;
      setIsAlarmSounding(true);

      try {
        console.log("🔔 ALARM TIME! Playing sound:", audioName);

        // Set audio mode for alarm playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Get the audio source from context using clean name
        const audioSource = getAudioSource(audioName);

        if (!audioSource) {
          console.error("❌ Audio source not found for:", audioName);
          return;
        }

        console.log("✅ Audio source found! Playing...");

        // Load and play the audio with looping
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          {
            shouldPlay: true,
            isLooping: true, // Loop the alarm sound
            volume: 1.0,
          },
          (status: any) => {
            if (status.isLoaded && status.didJustFinish && !status.isLooping) {
              setIsAlarmSounding(false);
            }
          }
        );

        setSound(newSound);
      } catch (error) {
        console.error("Error playing alarm sound:", error);
        setIsAlarmSounding(false);
        alarmTriggeredRef.current = false;
      }
    },
    [getAudioSource, isAlarmKilled]
  );

  // Cleanup sound on unmount or when alarm is killed
  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Cleaning up alarm sound");
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Stop sound when alarm is killed
  useEffect(() => {
    if (isAlarmKilled && sound) {
      console.log("Stopping alarm sound - alarm killed");
      sound.stopAsync();
      sound.unloadAsync();
      setSound(null);
      setIsAlarmSounding(false);
    }
  }, [isAlarmKilled, sound]);

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Calculate countdown
    const calculateCountdown = () => {
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(parseInt(hour as string) || 0);
      alarmTime.setMinutes(parseInt(minutes as string) || 0);
      alarmTime.setSeconds(0);

      // console.log("Current time:", now.toLocaleTimeString());
      // console.log("Alarm time (today):", alarmTime.toLocaleTimeString());

      const diff = alarmTime.getTime() - now.getTime();

      // console.log("Time diff (ms):", diff);
      // console.log("Time diff (seconds):", Math.floor(diff / 1000));
      // console.log("Alarm triggered ref:", alarmTriggeredRef.current);

      // // Check if countdown has reached 0 or passed (trigger alarm!)
      // console.log("=== TRIGGER CHECK ===");
      // console.log("diff <= 0:", diff <= 0);
      // console.log("!isAlarmKilled:", !isAlarmKilled);
      // console.log("!alarmTriggeredRef.current:", !alarmTriggeredRef.current);

      if (diff <= 0 && !isAlarmKilled && !alarmTriggeredRef.current) {
        // console.log("🔔 🔔 🔔 ALARM TIME! Triggering alarm...");
        // console.log("Selected audio name:", selectedAudio);
        playAlarmSound(selectedAudio as string);
      } else if (diff > 0) {
        // console.log("Alarm not triggered yet - still counting down.");
      }

      // If alarm is active (countdown reached 0), show "ALARM ACTIVE!"
      if (diff <= 0 && diff > -60000) {
        setCountdown("ALARM ACTIVE!");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${mins}m ${secs}s`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [hour, minutes, scaleAnim, isAlarmKilled, selectedAudio, playAlarmSound]);

  // Handle alarm killed state
  useEffect(() => {
    if (isAlarmKilled) {
      // Wait 2 seconds, then animate back to home
      const timeout = setTimeout(() => {
        setIsAlarmKilled(false);
        setHasActiveAlarm(false);
        router.push("/");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isAlarmKilled, setHasActiveAlarm, setIsAlarmKilled]);

  const handleEdit = () => {
    setHasActiveAlarm(false);
    router.back();
  };

  const handleCancel = () => {
    // Cancel the alarm and hide the tab
    setHasActiveAlarm(false);
    router.back();
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/header-image.jpg")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <Animated.View
          style={[
            styles.alarmCard,
            isAlarmKilled && styles.alarmCardKilled,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ThemedText type="title" style={styles.title}>
            {isAlarmKilled ? "Alarm Killed! 🔴" : "Alarm Set! ✅"}
          </ThemedText>

          <View
            style={[
              styles.timeDisplay,
              isAlarmKilled && styles.timeDisplayKilled,
            ]}
          >
            <Text
              style={[
                styles.alarmTime,
                isAlarmKilled && styles.alarmTimeKilled,
              ]}
            >
              {String(hour).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Day:</ThemedText>
              <ThemedText style={styles.detailValue}>{day}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Recurring:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {isRecurring === "true" ? "Yes" : "No"}
              </ThemedText>
            </View>

            {selectedAudio && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Sound:</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1}>
                  {selectedAudio}
                </ThemedText>
              </View>
            )}
          </View>

          <View
            style={[
              styles.countdownContainer,
              isAlarmSounding && styles.countdownContainerActive,
            ]}
          >
            <ThemedText type="subtitle" style={styles.countdownLabel}>
              {isAlarmSounding ? "Status:" : "Alarm in:"}
            </ThemedText>
            <Text
              style={[
                styles.countdownTime,
                isAlarmSounding && styles.countdownTimeActive,
              ]}
            >
              {countdown}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Alarm</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Alarm</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: -40,
  },
  headerImage: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  alarmCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alarmCardKilled: {
    backgroundColor: "#ffebee",
    borderWidth: 3,
    borderColor: "#ff4444",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
  },
  timeDisplay: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
  },
  timeDisplayKilled: {
    backgroundColor: "#ffcdd2",
  },
  alarmTime: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  alarmTimeKilled: {
    color: "#ff4444",
    textDecorationLine: "line-through",
  },
  detailsContainer: {
    marginBottom: 30,
    gap: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
  countdownContainer: {
    alignItems: "center",
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#E8F5E9",
    borderRadius: 15,
  },
  countdownContainerActive: {
    backgroundColor: "#ffebee",
    borderWidth: 3,
    borderColor: "#ff4444",
  },
  countdownLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  countdownTime: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  countdownTimeActive: {
    fontSize: 42,
    color: "#ff4444",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  buttonContainer: {
    gap: 15,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
