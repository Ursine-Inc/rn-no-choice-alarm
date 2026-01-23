import { Audio } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { KillSwitch } from "@/components/KillSwitch";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useActiveAlarm } from "@/hooks/useActiveAlarm";
<<<<<<< HEAD
import { useAlarmStorage } from "@/hooks/useAlarmStorage";
=======
>>>>>>> main
import { useAudio } from "@/hooks/useAudio";
import { ENABLE_DELETE_ALL } from "./alarms";

export default function ActiveAlarmScreen() {
  const { id: alarmId } = useLocalSearchParams<{ id: string }>();
  const { getAlarm } = useAlarmStorage();

  const {
    setHasActiveAlarm,
    isAlarmKilled,
    setIsAlarmKilled,
    isAlarmCountdownPaused,
    isAlarmCancelled,
    cancelAlarm,
    turnOffAlarm,
    selectedAudio,
    activeAlarm,
  } = useActiveAlarm();
<<<<<<< HEAD

=======
  
>>>>>>> main
  const { getAudioSource } = useAudio();
  const [countdown, setCountdown] = useState("");
  const [scaleAnim] = useState(new Animated.Value(0));
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);
  const alarmTriggeredRef = useRef(false);

  const playAlarmSound = useCallback(
    async (audioName: string) => {
      if (alarmTriggeredRef.current || isAlarmKilled || isAlarmCancelled) {
        return;
      }

      alarmTriggeredRef.current = true;
      setIsAlarmSounding(true);

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const audioSource = getAudioSource(audioName);

        if (!audioSource) {
          console.error("❌ Audio source not found for:", audioName);
          return;
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          {
            shouldPlay: true,
            isLooping: true,
            volume: 1.0,
          },
          (status: any) => {
            if (status.isLoaded && status.didJustFinish && !status.isLooping) {
              setIsAlarmSounding(false);
            }
          },
        );

        setSound(newSound);
      } catch (error) {
        setIsAlarmSounding(false);
        alarmTriggeredRef.current = false;
      }
    },
    [getAudioSource, isAlarmKilled],
  );

  const handleCancel = () => {
    cancelAlarm();
    router.push("/alarms");
  };

  useEffect(() => {
    const alarm = getAlarm(alarmId);
    if (!alarm) {
      router.push("/");
      return;
    }

    const { hour, minutes, selectedAudio } = alarm;

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const calculateCountdown = () => {
      if (isAlarmCountdownPaused) return;

      const now = new Date();
      const alarmTime = new Date();

      alarmTime.setHours(parseInt(hour as string) || 0);
      alarmTime.setMinutes(parseInt(minutes as string) || 0);
      alarmTime.setSeconds(0);

      const diff = alarmTime.getTime() - now.getTime();

      if (
        diff <= 0 &&
        !isAlarmKilled &&
        !alarmTriggeredRef.current &&
        !isAlarmSounding
      ) {
        playAlarmSound(selectedAudio as string);
      }

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
  }, [
    scaleAnim,
    isAlarmKilled,
    isAlarmCancelled,
    playAlarmSound,
    isAlarmSounding,
    isAlarmCountdownPaused,
  ]);

  useEffect(() => {
    if (isAlarmCancelled) {
      alarmTriggeredRef.current = false;
      setSound(null);
      setIsAlarmSounding(false);
      setCountdown("Alarm Cancelled");
      cancelAlarm();
    }
    if (isAlarmKilled && sound) {
      sound.stopAsync();
      sound.unloadAsync();
      setSound(null);
      setIsAlarmSounding(false);
    }

    if (isAlarmKilled) {
      const timeout = setTimeout(() => {
        setIsAlarmKilled(false);
        setHasActiveAlarm(false);
        turnOffAlarm(alarmId);
        router.push("/");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [
    isAlarmKilled,
    isAlarmCancelled,
    sound,
    alarmId,
    setHasActiveAlarm,
    setIsAlarmKilled,
    cancelAlarm,
  ]);

  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Cleaning up alarm sound");
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/splash-screen_2025.jpg")}
          style={styles.headerImage}
          contentFit="cover"
          contentPosition="top"
        />
      }
      noPadding={true}
    >
      {ENABLE_DELETE_ALL && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Alarm</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.killSwitchWrapper}>
        <KillSwitch />
      </View>
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
            {isAlarmKilled ? "Alarm Killed! 🔴" : "Alarm Active! ✅"}
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
              {String(activeAlarm?.hour).padStart(2, "0")}:
              {String(activeAlarm?.minutes).padStart(2, "0")}
            </Text>
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

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Day:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {activeAlarm?.day}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Recurring:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {activeAlarm?.isRecurring === "true" ? "Yes" : "No"}
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
        </Animated.View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  killSwitchWrapper: {
    paddingTop: 15,
  },
  container: {
    flex: 1,
    margin: 0,
  },
  headerImage: {
    width: "100%",
    height: 260,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
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
    fontSize: 30,
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
