import { router } from "expo-router";
import { useEffect, useState } from "react";

import { AndroidDayPicker } from "@/components/AndroidDayPicker";
import { AndroidTimePicker } from "@/components/AndroidTimePicker";
import { IOSDayPicker } from "@/components/IOSDayPicker";
import { IOSTimePicker } from "@/components/IOSTimePicker";
import { AlarmStorage } from "@/data/AlarmStorage";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import {
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { PreviewAnimation } from "../../components/player/preview-animation";
import { useActiveAlarm } from "../../hooks/useActiveAlarm";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useAudio } from "@/hooks/useAudio";
import styles from "../../themes/styles/home";

const START_CURSOR_MS = 5000;
const PLAY_DURATION_MS = 10000;
const TOTAL_PREVIEW_DURATION_MS = START_CURSOR_MS + PLAY_DURATION_MS;

export default function HomeScreen() {
  const {
    setHasActiveAlarm,
    setIsAlarmKilled,
    isAlarmCancelled,
    setIsAlarmCancelled,
  } = useActiveAlarm();
  const {
        audioMap,
    audioCollections,
    getAudioSource,
    getAudioCollection,
  } = useAudio();
  // start with no time selected to make validation explicit
  const [hour, setHour] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  // start with no day selected to make validation explicit
  const [day, setDay] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSpeechExpanded, setIsSpeechExpanded] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);

  const [selectedAudio, setSelectedAudio] = useState("");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const selectedCollection = selectedAudio
    ? getAudioCollection(selectedAudio)
    : null;
  const selectedBelongsToMusic = selectedCollection === "MUSIC";
  const selectedBelongsToSpeech = selectedCollection === "SPEECH";

  const cleanupPreview = async () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error cleaning up sound:", error);
      }
      setSound(null);
    }
    setPlayingPreview(null);
    setIsPreviewPlaying(false);
    setPreviewProgress(0);
  };

  const stopPreview = async () => {
    await cleanupPreview();
  };

  const playPreview = async (cleanName: string) => {
    try {
      await cleanupPreview();

      setPlayingPreview(cleanName);
      setIsPreviewPlaying(true);

      const audioSource = getAudioSource(cleanName);
      if (!audioSource) {
        console.error("Audio source not found for:", cleanName);
        setPlayingPreview(null);
        setIsPreviewPlaying(false);
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        {
          shouldPlay: true,
          positionMillis: START_CURSOR_MS,
        },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingPreview(null);
            setIsPreviewPlaying(false);
          }
        }
      );

      setSound(newSound);

      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / TOTAL_PREVIEW_DURATION_MS, 1); // 11 seconds total (10s play + 1s fade)
        setPreviewProgress(progress);
      }, 100);

      const timeout = setTimeout(async () => {
        try {
          const fadeSteps = 20;
          const fadeInterval = 1000 / fadeSteps;

          for (let i = fadeSteps; i >= 0; i--) {
            const volume = i / fadeSteps;
            await newSound.setVolumeAsync(volume);
            await new Promise((resolve) => setTimeout(resolve, fadeInterval));
          }
        } catch (error) {
          console.error("Error during fadeout:", error);
        }

        clearInterval(progressInterval);
        await cleanupPreview();
      }, PLAY_DURATION_MS);

      setPreviewTimeout(timeout);
    } catch (error) {
      console.error("Error playing preview:", error);
      setPlayingPreview(null);
      setIsPreviewPlaying(false);
      alert(`Error playing audio: ${error}`);
    }
  };

  const handleSave = () => {
    if (hour === null || minutes === null) {
      alert("Please select a time for the alarm!");
      return;
    }
    if (day === null) {
      alert("Please select a day for the alarm!");
      return;
    }
    if (!selectedAudio) {
      alert("Please select an alarm sound!");
      return;
    }
    if (!audioMap.has(selectedAudio)) {
      alert("Selected audio is invalid. Please choose a valid sound.");
      return;
    }

    setIsAlarmCancelled(false);
    setIsAlarmKilled(false);
    setHasActiveAlarm(true);

    const cleanName = selectedAudio;
    const alarmId = Date.now().toString();
    const timeString = `${String(hour).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    AlarmStorage.saveAlarm({
      id: alarmId,
      time: timeString,
      day,
      enabled: true,
      trackIds: [cleanName],
      recurring: isRecurring,
    });

    router.push({
      pathname: "/active-alarm",
      params: {
        hour: String(hour).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        day,
        isRecurring: isRecurring.toString(),
        selectedAudio: cleanName,
      },
    });
  };

  useEffect(() => {
    if (isAlarmCancelled) {
      stopPreview();

      try {
        setIsAlarmCancelled(false); // clear the request flag
      } catch (e) {
        console.error("Error clearing isAlarmCancelled:", e);
      }

      try {
        setIsAlarmKilled(false);
        setHasActiveAlarm(false);
      } catch (e) {
        console.error("Error resetting alarm hook state:", e);
      }
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }
    };
  }, [sound, previewTimeout]);

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
      <ThemedView>
        <ThemedView>
          <View style={styles.alarm}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <ThemedText type="subtitle">Time</ThemedText>
              {Platform.OS === "ios" ? (
                <IOSTimePicker
                  hour={hour}
                  minutes={minutes}
                  onTimeChange={(h, m) => {
                    setHour(h);
                    setMinutes(m);
                  }}
                />
              ) : (
                <AndroidTimePicker
                  hour={hour}
                  minutes={minutes}
                  onTimeChange={(h, m) => {
                    setHour(h);
                    setMinutes(m);
                  }}
                />
              )}
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}>
              <ThemedText type="subtitle">Day</ThemedText>
              {Platform.OS === "ios" ? (
                <IOSDayPicker
                  day={day}
                  daysOfWeek={daysOfWeek}
                  onDayChange={setDay}
                />
              ) : (
                <AndroidDayPicker
                  day={day}
                  daysOfWeek={daysOfWeek}
                  onDayChange={setDay}
                />
              )}
          </View>
          <View style={styles.recurringContainer}>
            <View style={styles.recurringSection}>
              <ThemedText type="subtitle">Recurring</ThemedText>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isRecurring ? "#4CAF50" : "#f4f3f4"}
              />
            </View>
          </View>
          </View>
          <View style={styles.alarmAudioOptions}>
            <ThemedText type="subtitle">Select soundtrack</ThemedText>
            {selectedAudio ? (
              <View style={styles.selectedBadgeRow}>
                <View
                  style={[
                    styles.selectedBadge,
                    selectedBelongsToMusic && styles.selectedBadgeMusic,
                    selectedBelongsToSpeech && styles.selectedBadgeSpeech,
                  ]}
                >
                  <Text style={styles.selectedBadgeText}>
                    {selectedBelongsToMusic
                      ? "Music"
                      : selectedBelongsToSpeech
                      ? "Speech"
                      : "Other"}
                  </Text>
                </View>
                <Text style={styles.audioLabel}>{selectedAudio}</Text>
              </View>
            ) : null}
            {(() => {
              const selectedBelongsToMusic = selectedAudio
                ? audioCollections.get("MUSIC")?.has(selectedAudio) ?? false
                : false;
              const selectedBelongsToSpeech = selectedAudio
                ? audioCollections.get("SPEECH")?.has(selectedAudio) ?? false
                : false;

              return (
                <>
                  <Pressable
                    style={[
                      styles.optionsButton,
                      isMusicExpanded && styles.optionsButtonSelectedMusic,
                      selectedBelongsToMusic &&
                        styles.optionsButtonSelectedMusic,
                    ]}
                    onPress={() => setIsMusicExpanded(!isMusicExpanded)}
                  >
                    <Text style={styles.label}>
                      Music {isMusicExpanded ? "▲" : "▼"}
                    </Text>
                  </Pressable>
                  {isMusicExpanded && (
                    <ScrollView
                      style={styles.audioList}
                      nestedScrollEnabled={true}
                    >
                      {Array.from(
                        audioCollections.get("MUSIC")?.values() ?? []
                      ).map((mapping) => {
                        const cleanName =
                          mapping &&
                          typeof mapping === "object" &&
                          "cleanName" in mapping
                            ? // @ts-ignore
                              mapping.cleanName
                            : String(mapping);

                        return (
                          <View
                            key={cleanName}
                            style={[
                              styles.audioItem,
                              selectedAudio === cleanName &&
                                styles.audioItemSelected,
                            ]}
                          >
                            <Pressable
                              style={styles.audioItemContent}
                              onPress={() => {
                                setSelectedAudio(cleanName);
                                setIsMusicExpanded(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.audioLabel,
                                  selectedAudio === cleanName &&
                                    styles.audioLabelSelected,
                                ]}
                              >
                                {cleanName}
                              </Text>
                            </Pressable>
                            <View style={{ position: "relative" }}>
                              <Pressable
                                style={styles.previewButton}
                                onPress={() => {
                                  if (
                                    playingPreview === cleanName &&
                                    isPreviewPlaying
                                  ) {
                                    stopPreview();
                                  } else {
                                    playPreview(cleanName);
                                  }
                                }}
                              >
                                <Text style={styles.previewButtonText}>
                                  {playingPreview === cleanName &&
                                  isPreviewPlaying
                                    ? "⏸"
                                    : "▶️"}
                                </Text>
                              </Pressable>
                              {playingPreview === cleanName &&
                                isPreviewPlaying && (
                                  <PreviewAnimation
                                    previewProgress={previewProgress}
                                  />
                                )}
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  )}

                  <Pressable
                    style={[
                      styles.optionsButton,
                      isSpeechExpanded && styles.optionsButtonSelectedSpeech,
                      selectedBelongsToSpeech &&
                        styles.optionsButtonSelectedSpeech,
                    ]}
                    onPress={() => setIsSpeechExpanded(!isSpeechExpanded)}
                  >
                    <Text style={styles.label}>
                      Speech {isSpeechExpanded ? "▲" : "▼"}
                    </Text>
                  </Pressable>
                </>
              );
            })()}
            {isSpeechExpanded && (
              <ScrollView style={styles.audioList} nestedScrollEnabled={true}>
                {Array.from(audioCollections.get("SPEECH")?.values() ?? []).map(
                  (mapping) => {
                    const cleanName =
                      mapping &&
                      typeof mapping === "object" &&
                      "cleanName" in mapping
                        ? // @ts-ignore
                          mapping.cleanName
                        : String(mapping);

                    return (
                      <View
                        key={cleanName}
                        style={[
                          styles.audioItem,
                          selectedAudio === cleanName &&
                            styles.audioItemSelected,
                        ]}
                      >
                        <Pressable
                          style={styles.audioItemContent}
                          onPress={() => {
                            setSelectedAudio(cleanName);
                            setIsSpeechExpanded(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.audioLabel,
                              selectedAudio === cleanName &&
                                styles.audioLabelSelected,
                            ]}
                          >
                            {cleanName}
                          </Text>
                        </Pressable>
                        <View style={{ position: "relative" }}>
                          <Pressable
                            style={styles.previewButton}
                            onPress={() => {
                              if (
                                playingPreview === cleanName &&
                                isPreviewPlaying
                              ) {
                                stopPreview();
                              } else {
                                playPreview(cleanName);
                              }
                            }}
                          >
                            <Text style={styles.previewButtonText}>
                              {playingPreview === cleanName && isPreviewPlaying
                                ? "⏸"
                                : "▶️"}
                            </Text>
                          </Pressable>
                          {playingPreview === cleanName && isPreviewPlaying && (
                            <PreviewAnimation
                              previewProgress={previewProgress}
                            />
                          )}
                        </View>
                      </View>
                    );
                  }
                )}
              </ScrollView>
            )}{" "}
            <Pressable
              onPress={handleSave}
              disabled={
                selectedAudio === "" ||
                hour === null ||
                minutes === null ||
                day === null
              }
              accessibilityRole="button"
              accessibilityState={{
                disabled:
                  selectedAudio === "" ||
                  hour === null ||
                  minutes === null ||
                  day === null,
              }}
              style={({ pressed }) => [
                styles.saveButton,
                (selectedAudio === "" ||
                  hour === null ||
                  minutes === null ||
                  day === null) &&
                  styles.saveButtonDisabled,
                pressed &&
                  selectedAudio !== "" &&
                  hour !== null &&
                  minutes !== null &&
                  day !== null &&
                  styles.saveButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonLabel,
                  (selectedAudio === "" ||
                    hour === null ||
                    minutes === null ||
                    day === null) &&
                    styles.saveButtonLabelDisabled,
                ]}
              >
                Save Alarm
              </Text>
            </Pressable>
          </View>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}
